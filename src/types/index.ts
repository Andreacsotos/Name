export interface Format {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  category: string;
  priority: number;
  complexity?: "low" | "high" | "extreme";
}

export interface DesignAnalysis {
  originalSize: {
    width: number;
    height: number;
  };
  typography: {
    headline: FontInfo;
    subheadline: FontInfo;
    body: FontInfo;
    legal: FontInfo;
  };
  colors: {
    background: string;
    text: string;
    secondary: string;
  };
  spacing: {
    margins: number;
    gaps: number;
  };
  elements: {
    hasImage: boolean;
    imageAspectRatio?: number;
    imagePlacement: "top" | "center" | "bottom";
    imagePercentage: number;
  };
  hierarchy: {
    headlineSize: number;
    subheadlineSize: number;
    bodySize: number;
    legalSize: number;
  };
}

export interface FontInfo {
  family: string;
  style: string;
  size: number;
  weight: "light" | "regular" | "bold";
  lineHeight: number;
}

export interface GenerationOptions {
  formats: Format[];
  includeAI: boolean;
  preserveAspectRatios: boolean;
  applySmartRules: boolean;
}

export interface SmartRule {
  name: string;
  condition: string;
  layout: "full" | "minimal" | "compact" | "extreme" | "vertical-extreme";
  elements: {
    [key: string]: ElementRule;
  };
  spacing: {
    margins?: number | "proportional";
    gaps?: number | "proportional";
  };
}

export interface ElementRule {
  show: boolean;
  scale: number;
  minSize?: number;
  maxSize?: number;
  position?: string;
  lines?: number;
  minHeight?: string;
}

export interface GeneratedFrame {
  name: string;
  format: Format;
  dimensions: {
    width: number;
    height: number;
  };
  appliedRule: SmartRule | null;
  elements: {
    [key: string]: {
      visible: boolean;
      scale: number;
      position: { x: number; y: number };
      size: { width: number; height: number };
    };
  };
}

export interface ResizeResult {
  success: boolean;
  framesGenerated: GeneratedFrame[];
  errors?: string[];
  warnings?: string[];
}
