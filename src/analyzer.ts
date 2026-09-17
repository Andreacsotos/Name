import { DesignAnalysis, FontInfo } from "./types/index.js";

export class DesignAnalyzer {
  /**
   * Analiza el frame actual de Figma y extrae:
   * - Tipografías (fonts, tamaños)
   * - Colores (backgrounds, texts)
   * - Espaciado (márgenes, gaps)
   * - Elementos (imagen, logo, texto)
   */
  analyzeFrame(frameData: any): DesignAnalysis {
    console.log("🔍 Analizando diseño actual...");

    const children = frameData.children || [];

    // Analizar tipografías
    const typography = this.extractTypography(children);

    // Analizar colores
    const colors = this.extractColors(frameData, children);

    // Analizar espaciado
    const spacing = this.extractSpacing(frameData, children);

    // Analizar elementos
    const elements = this.analyzeElements(children, frameData);

    const analysis: DesignAnalysis = {
      originalSize: {
        width: frameData.width,
        height: frameData.height,
      },
      typography,
      colors,
      spacing,
      elements,
      hierarchy: {
        headlineSize: typography.headline.size,
        subheadlineSize: typography.subheadline.size,
        bodySize: typography.body.size,
        legalSize: typography.legal.size,
      },
    };

    console.log("✅ Análisis completado");
    return analysis;
  }

  private extractTypography(children: any[]): any {
    const fontMap = new Map<string, any>();

    // Buscar texto y extraer tipografías
    children.forEach((child) => {
      if (child.type === "TEXT" && child.fontName) {
        const key = `${child.fontName.family}-${child.fontName.style}`;
        if (!fontMap.has(key)) {
          fontMap.set(key, {
            family: child.fontName.family,
            style: child.fontName.style,
            sizes: [],
          });
        }
        fontMap.get(key).sizes.push(child.fontSize);
      }
    });

    // Agrupar por tamaño (headline, subheadline, body, legal)
    const largest = this.findLargestFont(fontMap);
    const smallest = this.findSmallestFont(fontMap);

    return {
      headline: {
        family: largest.family,
        style: largest.style,
        size: Math.max(...largest.sizes),
        weight: "bold",
        lineHeight: 0.8,
      } as FontInfo,
      subheadline: {
        family: largest.family || "Inter",
        style: "Regular",
        size: 80,
        weight: "regular",
        lineHeight: 0.8,
      } as FontInfo,
      body: {
        family: "Inter",
        style: "Regular",
        size: 16,
        weight: "regular",
        lineHeight: 1.5,
      } as FontInfo,
      legal: {
        family: "Inter",
        style: "Regular",
        size: 10,
        weight: "light",
        lineHeight: 1.4,
      } as FontInfo,
    };
  }

  private extractColors(frameData: any, children: any[]): any {
    let backgroundColor = "#FFFFFF";
    let textColor = "#000000";
    let secondaryColor = "#808080";

    // Color de fondo del frame
    if (frameData.fills && frameData.fills.length > 0) {
      const fill = frameData.fills[0];
      if (fill.type === "SOLID") {
        backgroundColor = this.rgbaToHex(fill.color);
      }
    }

    // Buscar colores de texto
    children.forEach((child) => {
      if (child.type === "TEXT" && child.fills) {
        const fill = child.fills[0];
        if (fill && fill.type === "SOLID") {
          const color = this.rgbaToHex(fill.color);
          if (color !== backgroundColor) {
            textColor = color;
          }
        }
      }
    });

    return {
      background: backgroundColor,
      text: textColor,
      secondary: secondaryColor,
    };
  }

  private extractSpacing(frameData: any, children: any[]): any {
    let margins = 40;
    let gaps = 20;

    // Estimar márgenes del primer elemento
    if (children.length > 0) {
      const firstChild = children[0];
      margins = Math.min(firstChild.x || 40, 60);

      // Estimar gaps entre elementos
      if (children.length > 1) {
        gaps = Math.abs(
          (children[1].y || 0) - ((children[0].y || 0) + (children[0].height || 0))
        );
      }
    }

    return {
      margins: Math.max(margins, 20),
      gaps: Math.max(gaps, 15),
    };
  }

  private analyzeElements(children: any[], frameData: any): any {
    let hasImage = false;
    let imageAspectRatio = 16 / 9;
    let imagePlacement: "top" | "center" | "bottom" = "center";
    let imagePercentage = 0.6;

    // Buscar imagen (elemento tipo IMAGE)
    children.forEach((child) => {
      if (child.type === "IMAGE" || child.type === "GROUP") {
        hasImage = true;
        const childAspectRatio = (child.width || 1) / (child.height || 1);
        imageAspectRatio = childAspectRatio;

        // Determinar posición
        const midY = frameData.height / 2;
        const childMidY = (child.y || 0) + (child.height || 0) / 2;
        if (childMidY < midY * 0.4) {
          imagePlacement = "top";
        } else if (childMidY > midY * 1.6) {
          imagePlacement = "bottom";
        }

        // Calcular porcentaje
        imagePercentage = (child.height || 0) / frameData.height;
      }
    });

    return {
      hasImage,
      imageAspectRatio,
      imagePlacement,
      imagePercentage,
    };
  }

  private findLargestFont(fontMap: Map<string, any>): any {
    let largest = null;
    let maxSize = 0;

    fontMap.forEach((font) => {
      const maxFontSize = Math.max(...font.sizes);
      if (maxFontSize > maxSize) {
        maxSize = maxFontSize;
        largest = { ...font, sizes: font.sizes };
      }
    });

    return largest || { family: "Inter", style: "Regular", sizes: [16] };
  }

  private findSmallestFont(fontMap: Map<string, any>): any {
    let smallest = null;
    let minSize = Infinity;

    fontMap.forEach((font) => {
      const minFontSize = Math.min(...font.sizes);
      if (minFontSize < minSize) {
        minSize = minFontSize;
        smallest = { ...font, sizes: font.sizes };
      }
    });

    return smallest || { family: "Inter", style: "Regular", sizes: [12] };
  }

  private rgbaToHex(rgba: any): string {
    const r = Math.round((rgba.r || 0) * 255);
    const g = Math.round((rgba.g || 0) * 255);
    const b = Math.round((rgba.b || 0) * 255);

    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }
}
