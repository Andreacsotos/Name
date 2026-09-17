import {
  DesignAnalysis,
  Format,
  GeneratedFrame,
  SmartRule,
  ElementRule,
} from "./types/index.js";

export class DesignCalculator {
  /**
   * Calcula las nuevas dimensiones y escalas para un formato específico
   * basado en el análisis del diseño actual
   */
  calculateFrame(
    analysis: DesignAnalysis,
    format: Format,
    smartRule: SmartRule
  ): GeneratedFrame {
    const originalSize = analysis.originalSize;
    const scaleX = format.width / originalSize.width;
    const scaleY = format.height / originalSize.height;

    // Calcular espaciado
    const spacing = this.calculateSpacing(
      analysis.spacing,
      format,
      smartRule,
      scaleX,
      scaleY
    );

    // Calcular elementos y sus nuevas dimensiones
    const elements: {
      [key: string]: {
        visible: boolean;
        scale: number;
        position: { x: number; y: number };
        size: { width: number; height: number };
      };
    } = {};

    // Logo
    elements.logo = this.calculateElement(
      "logo",
      { x: spacing.margins, y: spacing.margins, width: 100, height: 100 },
      smartRule,
      scaleX,
      scaleY,
      format,
      analysis
    );

    // Imagen
    elements.image = this.calculateImage(
      analysis.elements,
      format,
      smartRule,
      spacing,
      analysis.originalSize
    );

    // Título
    elements.title = this.calculateTextElement(
      "title",
      analysis.typography.headline,
      smartRule,
      format,
      spacing
    );

    // Subtítulo
    elements.subtitle = this.calculateTextElement(
      "subtitle",
      analysis.typography.subheadline,
      smartRule,
      format,
      spacing
    );

    // Body
    elements.body = this.calculateTextElement(
      "body",
      analysis.typography.body,
      smartRule,
      format,
      spacing
    );

    // Legal
    elements.legal = this.calculateTextElement(
      "legal",
      analysis.typography.legal,
      smartRule,
      format,
      spacing
    );

    return {
      name: `${format.name} (${format.width}x${format.height})`,
      format,
      dimensions: {
        width: format.width,
        height: format.height,
      },
      appliedRule: smartRule,
      elements,
    };
  }

  private calculateSpacing(
    originalSpacing: { margins: number; gaps: number },
    format: Format,
    smartRule: SmartRule,
    scaleX: number,
    scaleY: number
  ): { margins: number; gaps: number } {
    const ruleSpacing = smartRule.spacing;
    let margins = originalSpacing.margins;
    let gaps = originalSpacing.gaps;

    if (ruleSpacing.margins === "proportional") {
      margins = originalSpacing.margins * Math.min(scaleX, scaleY);
    } else if (typeof ruleSpacing.margins === "number") {
      margins = ruleSpacing.margins;
    }

    if (ruleSpacing.gaps === "proportional") {
      gaps = originalSpacing.gaps * Math.min(scaleX, scaleY);
    } else if (typeof ruleSpacing.gaps === "number") {
      gaps = ruleSpacing.gaps;
    }

    return {
      margins: Math.max(margins, 4),
      gaps: Math.max(gaps, 2),
    };
  }

  private calculateElement(
    elementName: string,
    originalDimensions: { x: number; y: number; width: number; height: number },
    smartRule: SmartRule,
    scaleX: number,
    scaleY: number,
    format: Format,
    analysis: DesignAnalysis
  ): {
    visible: boolean;
    scale: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
  } {
    const ruleElement = smartRule.elements[elementName];

    if (!ruleElement || !ruleElement.show) {
      return {
        visible: false,
        scale: 0,
        position: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
      };
    }

    const baseScale = Math.min(scaleX, scaleY);
    const scale = ruleElement.scale * baseScale;

    let width = originalDimensions.width * scale;
    let height = originalDimensions.height * scale;

    const position = this.calculatePosition(
      elementName,
      ruleElement,
      format,
      analysis
    );

    return {
      visible: true,
      scale,
      position,
      size: { width, height },
    };
  }

  private calculateTextElement(
    elementName: string,
    fontInfo: any,
    smartRule: SmartRule,
    format: Format,
    spacing: { margins: number; gaps: number }
  ): {
    visible: boolean;
    scale: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
  } {
    const ruleElement = smartRule.elements[elementName];

    if (!ruleElement || !ruleElement.show) {
      return {
        visible: false,
        scale: 0,
        position: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
      };
    }

    const baseFontSize = fontInfo.size;
    let newFontSize = baseFontSize * ruleElement.scale;

    // Aplicar límites de minSize y maxSize
    if (ruleElement.minSize) {
      newFontSize = Math.max(newFontSize, ruleElement.minSize);
    }
    if (ruleElement.maxSize) {
      newFontSize = Math.min(newFontSize, ruleElement.maxSize);
    }

    // Estimar dimensiones de texto
    const textWidth = format.width - spacing.margins * 2;
    const estimatedHeight = newFontSize * (fontInfo.lineHeight || 1.2);
    const lines = ruleElement.lines || Math.ceil(newFontSize / (newFontSize * 0.8));

    // Posicionar elemento
    let yPosition = spacing.margins;
    if (elementName === "subtitle") {
      yPosition += spacing.margins + 40; // Espacio después del título
    } else if (elementName === "body") {
      yPosition += spacing.margins + 120; // Espacio después del subtítulo
    } else if (elementName === "legal") {
      yPosition = format.height - spacing.margins - estimatedHeight;
    }

    return {
      visible: true,
      scale: ruleElement.scale,
      position: { x: spacing.margins, y: yPosition },
      size: {
        width: textWidth,
        height: estimatedHeight * lines,
      },
    };
  }

  private calculateImage(
    elements: any,
    format: Format,
    smartRule: SmartRule,
    spacing: { margins: number; gaps: number },
    originalSize: { width: number; height: number }
  ): {
    visible: boolean;
    scale: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
  } {
    const ruleElement = smartRule.elements.image;

    if (!ruleElement || !ruleElement.show || !elements.hasImage) {
      return {
        visible: false,
        scale: 0,
        position: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
      };
    }

    const availableHeight = format.height - spacing.margins * 3 - 100; // Espacio para otros elementos
    let imageHeight = availableHeight * ruleElement.scale;

    const imageWidth =
      (imageHeight * elements.imageAspectRatio) ||
      format.width - spacing.margins * 2;

    let yPosition = spacing.margins + 60; // Después del logo/título

    if (elements.imagePlacement === "bottom") {
      yPosition = format.height - imageHeight - spacing.margins;
    } else if (elements.imagePlacement === "center") {
      yPosition = (format.height - imageHeight) / 2;
    }

    return {
      visible: true,
      scale: ruleElement.scale,
      position: {
        x: (format.width - imageWidth) / 2,
        y: yPosition,
      },
      size: {
        width: imageWidth,
        height: imageHeight,
      },
    };
  }

  private calculatePosition(
    elementName: string,
    ruleElement: ElementRule,
    format: Format,
    analysis: DesignAnalysis
  ): { x: number; y: number } {
    const margins = analysis.spacing.margins;

    switch (ruleElement.position) {
      case "top-left":
        return { x: margins, y: margins };
      case "top-center":
        return {
          x: (format.width - 80) / 2, // Asumiendo logo de ~80px
          y: margins,
        };
      case "top-right":
        return {
          x: format.width - margins - 80,
          y: margins,
        };
      case "center":
        return {
          x: (format.width - 100) / 2,
          y: (format.height - 100) / 2,
        };
      case "left":
        return {
          x: margins,
          y: (format.height - 50) / 2,
        };
      case "right":
        return {
          x: format.width - margins - 80,
          y: (format.height - 50) / 2,
        };
      default:
        return { x: margins, y: margins };
    }
  }
}
