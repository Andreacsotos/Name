import { GeneratedFrame, ResizeResult } from "./types/index.js";

export class DesignGenerator {
  /**
   * Genera frames en Figma basado en los frames calculados
   * Nota: Esta es la interfaz esperada - la implementación real
   * dependerá de la Figma Plugin API
   */
  async generateFrames(
    frames: GeneratedFrame[],
    figmaFrameId: string,
    figmaContext?: any
  ): Promise<ResizeResult> {
    console.log("🎨 Iniciando generación de frames en Figma...");

    const framesGenerated: GeneratedFrame[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const frame of frames) {
      try {
        const result = await this.createFrame(frame, figmaContext);
        framesGenerated.push(result);
        console.log(
          `✅ Frame generado: ${frame.name} (${frame.format.width}x${frame.format.height})`
        );
      } catch (error: any) {
        errors.push(
          `Error al generar ${frame.name}: ${error.message || error}`
        );
      }
    }

    console.log(`\n📊 Resumen de generación:`);
    console.log(`  ✅ Frames generados: ${framesGenerated.length}`);
    if (errors.length > 0) {
      console.log(`  ❌ Errores: ${errors.length}`);
    }
    if (warnings.length > 0) {
      console.log(`  ⚠️ Advertencias: ${warnings.length}`);
    }

    return {
      success: errors.length === 0,
      framesGenerated,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  private async createFrame(
    frame: GeneratedFrame,
    figmaContext?: any
  ): Promise<GeneratedFrame> {
    // Si existe contexto de Figma, crear el frame real
    if (figmaContext && figmaContext.createFrame) {
      return this.createFigmaFrame(frame, figmaContext);
    }

    // Si no, retornar el frame como está (modo offline/preview)
    return frame;
  }

  private async createFigmaFrame(
    frame: GeneratedFrame,
    figmaContext: any
  ): Promise<GeneratedFrame> {
    // Crear un nuevo frame en Figma con las dimensiones del formato
    const figmaFrame = figmaContext.createFrame({
      name: frame.name,
      width: frame.dimensions.width,
      height: frame.dimensions.height,
    });

    // Aplicar fondo
    figmaFrame.fills = [
      {
        type: "SOLID",
        color: this.hexToRgba(figmaContext.colors?.background || "#FFFFFF"),
      },
    ];

    // Crear elementos dentro del frame
    await this.createElements(figmaFrame, frame, figmaContext);

    return frame;
  }

  private async createElements(
    figmaFrame: any,
    frame: GeneratedFrame,
    figmaContext: any
  ): Promise<void> {
    const elements = frame.elements;

    // Logo
    if (elements.logo?.visible) {
      this.createLogoElement(figmaFrame, elements.logo, figmaContext);
    }

    // Imagen
    if (elements.image?.visible) {
      this.createImageElement(figmaFrame, elements.image, figmaContext);
    }

    // Título
    if (elements.title?.visible) {
      this.createTextElement(figmaFrame, elements.title, figmaContext, {
        name: "Title",
        fontSize: 48,
        fontWeight: "bold",
      });
    }

    // Subtítulo
    if (elements.subtitle?.visible) {
      this.createTextElement(figmaFrame, elements.subtitle, figmaContext, {
        name: "Subtitle",
        fontSize: 32,
      });
    }

    // Body
    if (elements.body?.visible) {
      this.createTextElement(figmaFrame, elements.body, figmaContext, {
        name: "Body",
        fontSize: 16,
      });
    }

    // Legal
    if (elements.legal?.visible) {
      this.createTextElement(figmaFrame, elements.legal, figmaContext, {
        name: "Legal",
        fontSize: 10,
      });
    }
  }

  private createLogoElement(
    figmaFrame: any,
    element: any,
    figmaContext: any
  ): void {
    if (figmaContext.createRectangle) {
      const rect = figmaContext.createRectangle();
      rect.name = "Logo";
      rect.x = element.position.x;
      rect.y = element.position.y;
      rect.width = element.size.width;
      rect.height = element.size.height;
      rect.fills = [
        {
          type: "SOLID",
          color: figmaContext.colors?.secondary || "#CCCCCC",
        },
      ];
      figmaFrame.appendChild(rect);
    }
  }

  private createImageElement(
    figmaFrame: any,
    element: any,
    figmaContext: any
  ): void {
    if (figmaContext.createRectangle) {
      const rect = figmaContext.createRectangle();
      rect.name = "Image";
      rect.x = element.position.x;
      rect.y = element.position.y;
      rect.width = element.size.width;
      rect.height = element.size.height;
      rect.fills = [
        {
          type: "SOLID",
          color: figmaContext.colors?.secondary || "#CCCCCC",
        },
      ];
      figmaFrame.appendChild(rect);
    }
  }

  private createTextElement(
    figmaFrame: any,
    element: any,
    figmaContext: any,
    options: { name: string; fontSize: number; fontWeight?: string }
  ): void {
    if (figmaContext.createText) {
      const text = figmaContext.createText();
      text.name = options.name;
      text.x = element.position.x;
      text.y = element.position.y;
      text.width = element.size.width;
      text.height = element.size.height;
      text.characters = `${options.name} Text`;
      text.fontSize = Math.round(options.fontSize * element.scale);
      text.fills = [
        {
          type: "SOLID",
          color: figmaContext.colors?.text || "#000000",
        },
      ];
      figmaFrame.appendChild(text);
    }
  }

  private hexToRgba(
    hex: string
  ): { r: number; g: number; b: number; a: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return {
      r: result ? parseInt(result[1], 16) / 255 : 1,
      g: result ? parseInt(result[2], 16) / 255 : 1,
      b: result ? parseInt(result[3], 16) / 255 : 1,
      a: 1,
    };
  }

  /**
   * Retorna la información de generación en formato legible
   */
  formatResult(result: ResizeResult): string {
    let output = "\n🎨 RESULTADO DE GENERACIÓN\n";
    output += "═".repeat(50) + "\n\n";

    if (result.success) {
      output += "✅ Generación completada exitosamente\n\n";
    } else {
      output += "❌ Generación completada con errores\n\n";
    }

    output += `Frames generados: ${result.framesGenerated.length}\n`;
    result.framesGenerated.forEach((frame) => {
      output += `  • ${frame.name}\n`;
    });

    if (result.errors && result.errors.length > 0) {
      output += `\n❌ Errores (${result.errors.length}):\n`;
      result.errors.forEach((error) => {
        output += `  • ${error}\n`;
      });
    }

    if (result.warnings && result.warnings.length > 0) {
      output += `\n⚠️ Advertencias (${result.warnings.length}):\n`;
      result.warnings.forEach((warning) => {
        output += `  • ${warning}\n`;
      });
    }

    output += "\n" + "═".repeat(50) + "\n";
    return output;
  }
}
