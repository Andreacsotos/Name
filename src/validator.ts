import { GeneratedFrame, Format, DesignAnalysis, SmartRule } from "./types/index.js";

export interface ValidationError {
  element: string;
  issue: string;
  severity: "error" | "warning";
}

export class DesignValidator {
  /**
   * Valida que un frame generado cumpla con las reglas de diseño
   */
  validateFrame(
    frame: GeneratedFrame,
    analysis: DesignAnalysis,
    format: Format
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar dimensiones
    this.validateDimensions(frame, errors);

    // Validar elementos visibles
    this.validateElements(frame, errors);

    // Validar tipografía
    this.validateTypography(frame, analysis, errors);

    // Validar espaciado
    this.validateSpacing(frame, errors);

    // Validar colores
    this.validateColors(analysis, errors);

    return errors;
  }

  private validateDimensions(frame: GeneratedFrame, errors: ValidationError[]) {
    if (frame.dimensions.width <= 0 || frame.dimensions.height <= 0) {
      errors.push({
        element: "frame",
        issue: "Dimensiones inválidas",
        severity: "error",
      });
    }

    if (frame.dimensions.width !== frame.format.width) {
      errors.push({
        element: "frame",
        issue: `Ancho esperado: ${frame.format.width}, obtenido: ${frame.dimensions.width}`,
        severity: "error",
      });
    }

    if (frame.dimensions.height !== frame.format.height) {
      errors.push({
        element: "frame",
        issue: `Alto esperado: ${frame.format.height}, obtenido: ${frame.dimensions.height}`,
        severity: "error",
      });
    }
  }

  private validateElements(frame: GeneratedFrame, errors: ValidationError[]) {
    Object.entries(frame.elements).forEach(([name, element]) => {
      if (!element) {
        errors.push({
          element: name,
          issue: "Elemento no definido",
          severity: "warning",
        });
        return;
      }

      if (element.visible) {
        // Validar que el elemento no salga del frame
        if (
          element.position.x + element.size.width >
          frame.dimensions.width
        ) {
          errors.push({
            element: name,
            issue: "Elemento se desborda horizontalmente",
            severity: "warning",
          });
        }

        if (
          element.position.y + element.size.height >
          frame.dimensions.height
        ) {
          errors.push({
            element: name,
            issue: "Elemento se desborda verticalmente",
            severity: "warning",
          });
        }

        // Validar tamaños mínimos
        if (element.size.width < 10 && element.size.height < 10) {
          errors.push({
            element: name,
            issue: "Elemento demasiado pequeño",
            severity: "warning",
          });
        }
      }
    });
  }

  private validateTypography(
    frame: GeneratedFrame,
    analysis: DesignAnalysis,
    errors: ValidationError[]
  ) {
    const textElements = ["title", "subtitle", "body", "legal"];

    textElements.forEach((name) => {
      const element = frame.elements[name];
      if (element && element.visible) {
        // Validar que el tamaño de fuente sea legible
        if (name === "title" && element.scale < 0.3) {
          errors.push({
            element: name,
            issue: "Título demasiado pequeño para ser legible",
            severity: "warning",
          });
        }

        if (name === "body" && element.scale < 0.1) {
          errors.push({
            element: name,
            issue: "Texto del cuerpo demasiado pequeño",
            severity: "warning",
          });
        }

        if (name === "legal" && element.scale < 0.05) {
          errors.push({
            element: name,
            issue: "Texto legal demasiado pequeño",
            severity: "warning",
          });
        }
      }
    });
  }

  private validateSpacing(frame: GeneratedFrame, errors: ValidationError[]) {
    const visibleElements = Object.values(frame.elements).filter(
      (e) => e && e.visible
    );

    if (visibleElements.length < 2) {
      return;
    }

    // Validar que haya espaciado entre elementos
    for (let i = 0; i < visibleElements.length - 1; i++) {
      const current = visibleElements[i];
      const next = visibleElements[i + 1];

      if (!current || !next) continue;

      const gap = next.position.y - (current.position.y + current.size.height);

      if (gap < 2) {
        errors.push({
          element: `spacing-${i}`,
          issue: "Espaciado insuficiente entre elementos",
          severity: "warning",
        });
      }
    }
  }

  private validateColors(
    analysis: DesignAnalysis,
    errors: ValidationError[]
  ) {
    const { background, text } = analysis.colors;

    // Validar que hay contraste entre fondo y texto
    if (this.isSameColor(background, text)) {
      errors.push({
        element: "colors",
        issue: "Contraste insuficiente entre fondo y texto",
        severity: "error",
      });
    }
  }

  private isSameColor(color1: string, color2: string): boolean {
    const c1 = color1.toLowerCase().replace("#", "");
    const c2 = color2.toLowerCase().replace("#", "");
    return c1 === c2;
  }

  /**
   * Retorna un resumen de validación legible
   */
  getSummary(errors: ValidationError[]): string {
    if (errors.length === 0) {
      return "✅ Validación exitosa - No se encontraron problemas";
    }

    const errorCount = errors.filter((e) => e.severity === "error").length;
    const warningCount = errors.filter((e) => e.severity === "warning").length;

    let summary = "⚠️ Validación completada con problemas:\n";
    if (errorCount > 0) {
      summary += `  ❌ Errores: ${errorCount}\n`;
    }
    if (warningCount > 0) {
      summary += `  ⚠️ Advertencias: ${warningCount}`;
    }

    return summary;
  }
}
