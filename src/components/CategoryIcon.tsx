/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";

interface CategoryIconProps {
  name: string;
  className?: string;
}

export default function CategoryIcon({ name, className = "w-4 h-4" }: CategoryIconProps) {
  // Safe lookup for dynamic lucide-react icons
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
}
