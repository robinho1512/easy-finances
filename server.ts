import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUPS_FILE_PATH = path.join(process.cwd(), "cloud_backups.json");

// Lazy initialization of the Gemini client to avoid crashes if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API 1: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API 2: Cloud Backup - Save State
  app.post("/api/backup/save", (req, res) => {
    try {
      const { accountName, data } = req.body;
      if (!accountName || !data) {
        return res.status(400).json({ error: "Nome da conta e dados de backup são obrigatórios." });
      }

      let backups: Record<string, any> = {};
      if (fs.existsSync(BACKUPS_FILE_PATH)) {
        try {
          const fileContent = fs.readFileSync(BACKUPS_FILE_PATH, "utf8");
          backups = JSON.parse(fileContent);
        } catch (e) {
          console.error("Erro ao ler arquivo de backups, recriando...", e);
        }
      }

      backups[accountName] = {
        updatedAt: new Date().toISOString(),
        backupData: data,
      };

      fs.writeFileSync(BACKUPS_FILE_PATH, JSON.stringify(backups, null, 2), "utf8");
      res.json({ success: true, message: "Backup salvo com sucesso na nuvem!" });
    } catch (error: any) {
      console.error("Erro no backup:", error);
      res.status(500).json({ error: "Falha ao salvar o backup: " + error.message });
    }
  });

  // API 3: Cloud Backup - Load State
  app.get("/api/backup/load", (req, res) => {
    try {
      const { accountName } = req.query;
      if (!accountName || typeof accountName !== "string") {
        return res.status(400).json({ error: "Nome da conta é obrigatório." });
      }

      if (!fs.existsSync(BACKUPS_FILE_PATH)) {
        return res.status(404).json({ error: "Nenhum backup encontrado na nuvem para esta conta." });
      }

      const fileContent = fs.readFileSync(BACKUPS_FILE_PATH, "utf8");
      const backups = JSON.parse(fileContent);

      if (!backups[accountName]) {
        return res.status(404).json({ error: "Conta de backup não encontrada." });
      }

      res.json({ success: true, data: backups[accountName] });
    } catch (error: any) {
      console.error("Erro ao carregar backup:", error);
      res.status(500).json({ error: "Falha ao carregar backup: " + error.message });
    }
  });

  // API 4: AI Receipt/Statement Text Parsing via Gemini
  app.post("/api/parse-receipt", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Texto do recibo vazio." });
      }

      // Check if API key exists, otherwise return fallback mock data response
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.json({
          fallback: true,
          error: "GEMINI_API_KEY não configurada.",
          data: simulateParsing(text),
        });
      }

      const ai = getGeminiClient();
      const systemInstruction = `Você é um assistente financeiro de elite especializado em ler notificações bancárias, PIX, SMS de cartão de crédito e faturas brasileiras.
Sua tarefa é extrair os seguintes dados estruturados com extrema precisão:
1. Valor numérico da transação (em reais)
2. Estabelecimento / Descrição amigável
3. Categoria sugerida apropriada (escolha entre: "Alimentação", "Transporte", "Lazer", "Moradia", "Saúde", "Mercado", "Outros")
4. Tipo de despesa (geralmente "Pix", "Crédito" ou "Débito")

Formate sua resposta EXCLUSIVAMENTE como o esquema JSON requisitado. Não inclua Markdown, apenas o JSON bruto válido.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analise este extrato/mensagem e extraia os dados financeiros: "${text}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              value: {
                type: Type.NUMBER,
                description: "O valor numérico da despesa.",
              },
              description: {
                type: Type.STRING,
                description: "Nome do estabelecimento, recebedor ou descrição abreviada.",
              },
              category: {
                type: Type.STRING,
                description: 'Categoria da despesa. Deve ser estritamente uma de: "Alimentação", "Transporte", "Lazer", "Moradia", "Saúde", "Mercado", "Outros".',
              },
              paymentMethod: {
                type: Type.STRING,
                description: "Forma de pagamento extraída da mensagem (por exemplo: Crédito, Débito, Pix).",
              },
              date: {
                type: Type.STRING,
                description: "Data em formato ISO YYYY-MM-DD se encontrada, senão a data de hoje.",
              },
            },
            required: ["value", "description", "category", "paymentMethod"],
          },
        },
      });

      const jsonStr = response.text?.trim() || "{}";
      const parsedData = JSON.parse(jsonStr);

      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Erro na interpretação do extrato pela IA:", error);
      res.json({
        fallback: true,
        error: error.message,
        data: simulateParsing(req.body.text || ""),
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      // Avoid matching API routes
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server rodando com sucesso em http://0.0.0.0:${PORT}`);
  });
}

// Simple deterministic rule-based local parser for fallback if API key is not configured or fails
function simulateParsing(text: string) {
  const clean = text.toLowerCase();
  let value = 0;
  let description = "Compra por IA";
  let category = "Outros";
  let paymentMethod = "Pix";

  // Match standard Brazilian financial templates
  const moneyMatch = text.match(/(?:r\$|reais)\s*([0-9.,]+)/i) || text.match(/([0-9.,]+)\s*(?:reais|r\$)/i) || text.match(/(?:pago|transferido|valor de)\s*([0-9.,]+)/i);
  if (moneyMatch) {
    const numStr = moneyMatch[1].replace(/\./g, "").replace(",", ".");
    value = parseFloat(numStr) || 0;
  }

  // Find recipient / establishment
  if (clean.includes("uber") || clean.includes("pop") || clean.includes("taxi")) {
    description = "Uber / Transporte";
    category = "Transporte";
    paymentMethod = "Crédito";
  } else if (clean.includes("ifood") || clean.includes("restaurante") || clean.includes("mcdonald") || clean.includes("burger king")) {
    description = "iFood / Restaurante";
    category = "Alimentação";
    paymentMethod = "Crédito";
  } else if (clean.includes("supermercado") || clean.includes("carrefour") || clean.includes("pao de acucar") || clean.includes("mercado")) {
    description = "Supermercado";
    category = "Mercado";
    paymentMethod = "Débito";
  } else if (clean.includes("farmacia") || clean.includes("droga") || clean.includes("medicamente") || clean.includes("hospital")) {
    description = "Farmácia / Saúde";
    category = "Saúde";
    paymentMethod = "Débito";
  } else if (clean.includes("netflix") || clean.includes("spotify") || clean.includes("cinema") || clean.includes("ingressos")) {
    description = "Lazer / Entretenimento";
    category = "Lazer";
    paymentMethod = "Crédito";
  } else if (clean.includes("aluguel") || clean.includes("condominio") || clean.includes("enel") || clean.includes("sabesp") || clean.includes("luz") || clean.includes("internet")) {
    description = "Contas de Casa";
    category = "Moradia";
    paymentMethod = "Pix";
  } else {
    // Attempt standard parsing
    const parts = text.split(/[;,\n.-]/);
    if (parts.length > 0) {
      const longestPart = parts.reduce((a, b) => (a.length > b.length ? a : b), "");
      description = longestPart.substring(0, 30).trim();
    }
  }

  if (clean.includes("pix")) paymentMethod = "Pix";
  else if (clean.includes("cartão") || clean.includes("credito") || clean.includes("fatura")) paymentMethod = "Crédito";
  else if (clean.includes("debito") || clean.includes("fração")) paymentMethod = "Débito";

  return {
    value: value || 42.5,
    description: description || "Transação Extraída",
    category,
    paymentMethod,
    date: new Date().toISOString().split("T")[0],
  };
}

startServer();
