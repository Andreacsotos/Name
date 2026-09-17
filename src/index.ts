import { DesignAnalyzer } from "./analyzer.js";
import { DesignCalculator } from "./calculator.js";
import { DesignValidator } from "./validator.js";
import { DesignGenerator } from "./generator.js";
import {
  Format,
  DesignAnalysis,
  GeneratedFrame,
  SmartRule,
  ResizeResult,
} from "./types/index.js";

// Importar configuraciones
import smartRulesConfig from "../config/smartRules.json" with { type: "json" };
import formatsConfig from "../config/formats.json" with { type: "json" };

export class SmartSizePlugin {
  private analyzer: DesignAnalyzer;
  private calculator: DesignCalculator;
  private validator: DesignValidator;
  private generator: DesignGenerator;
  private smartRules: SmartRule[];
  private formats: Map<string, Format>;

  constructor() {
    this.analyzer = new DesignAnalyzer();
    this.calculator = new DesignCalculator();
    this.validator = new DesignValidator();
    this.generator = new DesignGenerator();

    // Cargar smart rules
    this.smartRules = smartRulesConfig.rules;

    // Cargar formatos
    this.formats = this.loadFormats();

    console.log("🚀 Smart Size Plugin inicializado");
    console.log(`  📋 Formatos disponibles: ${this.formats.size}`);
    console.log(`  ⚙️ Reglas inteligentes: ${this.smartRules.length}`);
  }

  private loadFormats(): Map<string, Format> {
    const formatMap = new Map<string, Format>();

    // Procesar formatos META
    if (formatsConfig.META) {
      Object.entries(formatsConfig.META).forEach(([key, format]: any) => {
        formatMap.set(`META-${key}`, {
          name: format.name,
          width: format.width,
          height: format.height,
          aspectRatio: format.aspectRatio,
          category: format.category,
          priority: format.priority,
          complexity: format.complexity,
        });
      });
    }

    // Procesar formatos DISPLAY
    if (formatsConfig.DISPLAY) {
      Object.entries(formatsConfig.DISPLAY).forEach(([key, format]: any) => {
        formatMap.set(`DISPLAY-${key}`, {
          name: format.name,
          width: format.width,
          height: format.height,
          aspectRatio: format.aspectRatio,
          category: format.category,
          priority: format.priority,
          complexity: format.complexity,
        });
      });
    }

    return formatMap;
  }

  /**
   * Punto de entrada principal del plugin
   * Analiza un frame actual y genera múltiples formatos
   */
  async resizeDesign(
    currentFrameData: any,
    selectedFormats?: string[],
    figmaContext?: any
  ): Promise<ResizeResult> {
    console.log("\n🔍 Analizando diseño actual...");

    // 1. Analizar frame actual
    const analysis = this.analyzer.analyzeFrame(currentFrameData);
    console.log("✅ Análisis completado");
    console.log(`  Tamaño original: ${analysis.originalSize.width}x${analysis.originalSize.height}`);
    console.log(`  Tipografía detectada: ${Object.keys(analysis.typography).length} tipos`);
    console.log(`  Colores detectados: Fondo=${analysis.colors.background}, Texto=${analysis.colors.text}`);
    console.log(`  Espaciado: Márgenes=${analysis.spacing.margins}px, Gaps=${analysis.spacing.gaps}px`);

    // 2. Determinar formatos a generar
    const formatsToGenerate = this.selectFormats(selectedFormats);
    console.log(`\n📋 Generando ${formatsToGenerate.length} formato(s)...`);

    // 3. Calcular frames para cada formato
    const calculatedFrames: GeneratedFrame[] = [];
    for (const format of formatsToGenerate) {
      const rule = this.findApplicableRule(format);
      if (rule) {
        const frame = this.calculator.calculateFrame(analysis, format, rule);
        calculatedFrames.push(frame);
        console.log(`  ✅ ${format.name}: ${format.width}x${format.height}`);
      }
    }

    // 4. Validar frames generados
    console.log("\n🔍 Validando frames...");
    let totalErrors = 0;
    for (const frame of calculatedFrames) {
      const errors = this.validator.validateFrame(frame, analysis, frame.format);
      if (errors.length > 0) {
        console.log(`  ⚠️ ${frame.name}:`);
        errors.forEach((error) => {
          console.log(`     ${error.severity === "error" ? "❌" : "⚠️"} ${error.issue}`);
          totalErrors++;
        });
      }
    }
    if (totalErrors === 0) {
      console.log("  ✅ Todas las validaciones pasaron");
    }

    // 5. Generar frames en Figma
    console.log("\n🎨 Generando frames en Figma...");
    const result = await this.generator.generateFrames(
      calculatedFrames,
      currentFrameData.id,
      figmaContext
    );

    console.log(this.generator.formatResult(result));

    return result;
  }

  private selectFormats(selectedFormats?: string[]): Format[] {
    if (selectedFormats && selectedFormats.length > 0) {
      // Retornar solo los formatos seleccionados
      return selectedFormats
        .map((key) => this.formats.get(key))
        .filter((format) => format !== undefined) as Format[];
    }

    // Si no hay selección, retornar todos los formatos ordenados por prioridad
    return Array.from(this.formats.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }

  private findApplicableRule(format: Format): SmartRule | null {
    // Evaluar cada regla contra las dimensiones del formato
    for (const rule of this.smartRules) {
      if (this.evaluateCondition(rule.condition, format)) {
        console.log(`    📋 Regla aplicada: "${rule.name}"`);
        return rule;
      }
    }

    // Si no hay regla específica, usar la default (full layout)
    console.log(`    📋 Regla aplicada: "Default"`);
    return this.smartRules[0] || null;
  }

  private evaluateCondition(condition: string, format: Format): boolean {
    // Reemplazar variables en la condición
    let evalCondition = condition
      .replace(/width/g, String(format.width))
      .replace(/height/g, String(format.height))
      .replace(/aspectRatio/g, String(format.aspectRatio));

    try {
      return eval(evalCondition);
    } catch (error) {
      console.error(`Error evaluando condición: ${condition}`, error);
      return false;
    }
  }

  /**
   * Retorna lista de formatos disponibles
   */
  getAvailableFormats(): Format[] {
    return Array.from(this.formats.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }

  /**
   * Retorna formatos filtrados por categoría
   */
  getFormatsByCategory(category: string): Format[] {
    return this.getAvailableFormats().filter((f) => f.category === category);
  }

  /**
   * Retorna formatos filtrados por nivel de complejidad
   */
  getFormatsByComplexity(complexity: "low" | "high" | "extreme"): Format[] {
    return this.getAvailableFormats().filter((f) => f.complexity === complexity);
  }

  /**
   * Obtiene las claves de formato para uso en UI
   */
  getFormatKeys(): string[] {
    return Array.from(this.formats.keys());
  }

  /**
   * Crea un formato personalizado
   */
  createCustomFormat(name: string, width: number, height: number): Format {
    const aspectRatio = width / height;
    return {
      name,
      width,
      height,
      aspectRatio,
      category: "custom",
      priority: 100,
      complexity: this.determineComplexity(width, height),
    };
  }

  private determineComplexity(
    width: number,
    height: number
  ): "low" | "high" | "extreme" {
    const aspectRatio = width / height;
    const area = width * height;

    if (aspectRatio > 5 || aspectRatio < 0.2 || area > 2000000) {
      return "extreme";
    }
    if (area < 100000 || aspectRatio > 3 || aspectRatio < 0.33) {
      return "high";
    }
    return "low";
  }
}

// Exportar para uso como módulo
export default SmartSizePlugin;
export { DesignAnalyzer, DesignCalculator, DesignValidator, DesignGenerator };
