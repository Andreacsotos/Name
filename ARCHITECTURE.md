# Smart Size - Arquitectura Técnica

## 🏗️ Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                         FIGMA PLUGIN UI                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  src/ui.html                                             │  │
│  │  - Selección de formatos                                 │  │
│  │  - Crear formatos personalizados                         │  │
│  │  - Botón de generación                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ postMessage
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIGMA PLUGIN CORE (plugin.ts)                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  onmessage listener                                      │  │
│  │  - ANALYZE_AND_RESIZE                                    │  │
│  │  - GET_FORMATS                                           │  │
│  │  - CREATE_CUSTOM_FORMAT                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SMART SIZE PLUGIN (index.ts)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SmartSizePlugin                                         │  │
│  │  - resizeDesign(frameData, selectedFormats)              │  │
│  │  - getAvailableFormats()                                 │  │
│  │  - createCustomFormat()                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
            │               │               │
    ┌───────┴───┐   ┌───────┴────┐   ┌───────┴────┐
    ▼           ▼   ▼            ▼   ▼            ▼
┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
│         │ │          │ │           │ │          │
│Analyzer │ │Calculator│ │Validator  │ │Generator │
│         │ │          │ │           │ │          │
└────┬────┘ └────┬─────┘ └─────┬─────┘ └────┬─────┘
     │           │             │            │
     │ Analysis  │ Calculated  │ Validated  │ Figma
     │           │ Frames      │ Errors     │ Frames
     ▼           ▼             ▼            ▼
┌──────────────────────────────────────────────────────┐
│              CONFIG FILES                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  formats.json      - Format definitions       │  │
│  │  smartRules.json   - Layout rules             │  │
│  │  types/index.ts    - Type definitions         │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## 📦 Módulos Principales

### 1. **Analyzer** (`src/analyzer.ts`)
**Responsabilidad:** Leer el diseño actual y extraer sus características

**Métodos:**
- `analyzeFrame(frameData)` → DesignAnalysis
- `extractTypography(children)` → Tipografías agrupadas
- `extractColors(frameData, children)` → Colores detectados
- `extractSpacing(frameData, children)` → Márgenes y gaps
- `analyzeElements(children)` → Información de elementos

**Input:** Frame de Figma (JSON)
**Output:** DesignAnalysis object
```typescript
{
  originalSize: { width: 1920, height: 1080 },
  typography: { headline, subheadline, body, legal },
  colors: { background, text, secondary },
  spacing: { margins: 40, gaps: 20 },
  elements: { hasImage: true, imageAspectRatio: 16/9, ... }
}
```

### 2. **Calculator** (`src/calculator.ts`)
**Responsabilidad:** Calcular nuevas dimensiones y posiciones

**Métodos:**
- `calculateFrame(analysis, format, smartRule)` → GeneratedFrame
- `calculateSpacing(...)` → Márgenes y gaps para el formato
- `calculateElement(...)` → Dimensiones del elemento
- `calculateTextElement(...)` → Tamaños de fuente y posiciones
- `calculateImage(...)` → Imagen redimensionada
- `calculatePosition(...)` → Posición XY del elemento

**Input:** DesignAnalysis, Format, SmartRule
**Output:** GeneratedFrame
```typescript
{
  name: "Instagram Square (1080x1080)",
  format: { width: 1080, height: 1080, ... },
  dimensions: { width: 1080, height: 1080 },
  appliedRule: SmartRule,
  elements: {
    logo: { visible: true, scale: 0.8, position: {x, y}, size: {w, h} },
    title: { visible: true, ... },
    ...
  }
}
```

### 3. **Validator** (`src/validator.ts`)
**Responsabilidad:** Validar que el frame cumple con reglas de diseño

**Métodos:**
- `validateFrame(frame, analysis, format)` → ValidationError[]
- `validateDimensions()` → Verifica dimensiones
- `validateElements()` → Verifica posicionamiento
- `validateTypography()` → Verifica legibilidad
- `validateSpacing()` → Verifica espaciado mínimo
- `validateColors()` → Verifica contraste

**Input:** GeneratedFrame, DesignAnalysis, Format
**Output:** Array de errores/advertencias
```typescript
[
  {
    element: "title",
    issue: "Título demasiado pequeño para ser legible",
    severity: "warning"
  }
]
```

### 4. **Generator** (`src/generator.ts`)
**Responsabilidad:** Crear frames en Figma

**Métodos:**
- `generateFrames(frames, figmaFrameId, figmaContext)` → ResizeResult
- `createFrame()` → Crea un frame vacío
- `createElements()` → Agrega elementos al frame
- `createLogoElement()` → Crea elemento logo
- `createImageElement()` → Crea elemento imagen
- `createTextElement()` → Crea elemento texto

**Input:** GeneratedFrame[], figmaContext
**Output:** ResizeResult
```typescript
{
  success: true,
  framesGenerated: [GeneratedFrame, ...],
  errors: ["Error 1", "Error 2"],
  warnings: ["Warning 1", ...]
}
```

## ⚙️ Configuración

### **formats.json**
Define todos los formatos disponibles

```json
{
  "META": {
    "1080x1080": {
      "name": "Instagram Square",
      "width": 1080,
      "height": 1080,
      "aspectRatio": 1,
      "category": "social",
      "priority": 1
    }
  }
}
```

**Campos:**
- `name` - Nombre legible
- `width`, `height` - Dimensiones en píxeles
- `aspectRatio` - Relación width/height
- `category` - Categoría (social, banner, custom)
- `priority` - Orden en lista
- `complexity` - Nivel de complejidad

### **smartRules.json**
Define reglas de layout para diferentes formatos

```json
{
  "name": "Small Banner (320x50)",
  "condition": "width >= 300 && width <= 350 && height <= 60",
  "layout": "extreme",
  "elements": {
    "logo": {
      "show": true,
      "scale": 0.3,
      "position": "left"
    },
    "title": {
      "show": true,
      "scale": 0.3,
      "minSize": 14,
      "maxSize": 16,
      "lines": 1
    },
    "image": {
      "show": false,
      "scale": 0
    }
  },
  "spacing": {
    "margins": 5,
    "gaps": 2
  }
}
```

**Campos:**
- `condition` - Expresión evaluable (width, height)
- `layout` - Tipo: "full", "minimal", "compact", "extreme", "vertical-extreme"
- `elements` - Config por elemento
  - `show` - Visible o no
  - `scale` - Escala relativa (0-1)
  - `minSize`, `maxSize` - Tamaños mínimos/máximos
  - `lines` - Líneas de texto
  - `position` - Posición (top-left, center, etc.)
- `spacing` - Márgenes y gaps
  - Número fijo o "proportional"

## 🔄 Flujo de Ejecución

### Paso 1: Usuario selecciona frame y formatos
```
UI → Plugin → SmartSizePlugin.resizeDesign()
```

### Paso 2: Análisis del diseño actual
```
Analyzer.analyzeFrame(frameData)
│
├─ extractTypography() → Sizes: [140, 80, 16, 10]
├─ extractColors() → #FFFFFF, #000000, #808080
├─ extractSpacing() → 40px margins, 20px gaps
└─ analyzeElements() → Image 16:9, centered, 60%
```

### Paso 3: Cálculo para cada formato
```
Para cada formato seleccionado:
  ├─ findApplicableRule() → Selecciona SmartRule
  ├─ Calculator.calculateFrame()
  │  ├─ calculateSpacing() → Márgenes ajustados
  │  ├─ calculateTextElement() → Fonts escalados
  │  ├─ calculateImage() → Imagen redimensionada
  │  └─ calculatePosition() → XY de cada elemento
  └─ return GeneratedFrame
```

### Paso 4: Validación
```
Para cada GeneratedFrame:
  Validator.validateFrame()
  ├─ validateDimensions() ✓
  ├─ validateElements() ✓
  ├─ validateTypography() ✓
  ├─ validateSpacing() ✓
  └─ validateColors() ✓
```

### Paso 5: Generación en Figma
```
Generator.generateFrames()
├─ Para cada frame validado:
│  ├─ createFrame() → Frame en Figma
│  ├─ createElements() → Agrega elementos
│  │  ├─ createLogoElement()
│  │  ├─ createImageElement()
│  │  ├─ createTextElement() × 4
│  │  └─ Posiciona cada uno
│  └─ Apply styles & colors
└─ return ResizeResult
```

## 🔌 Interfaz Plugin-UI

### Mensajes UI → Plugin

```typescript
// Analizar y redimensionar
{
  type: "ANALYZE_AND_RESIZE",
  selectedFormats: ["META-1080x1080", "META-1080x1350"]
}

// Obtener formatos
{
  type: "GET_FORMATS"
}

// Crear formato personalizado
{
  type: "CREATE_CUSTOM_FORMAT",
  name: "Mi Banner",
  width: 1200,
  height: 300
}
```

### Mensajes Plugin → UI

```typescript
// Generación completada
{
  type: "RESIZE_COMPLETE",
  success: true,
  framesGenerated: [
    { name: "Instagram Square (1080x1080)", width: 1080, height: 1080 }
  ],
  errors: [],
  warnings: []
}

// Lista de formatos
{
  type: "FORMATS_LIST",
  formats: [
    {
      key: "META-1080x1080",
      name: "Instagram Square",
      width: 1080,
      height: 1080,
      category: "social",
      complexity: "low"
    }
  ]
}

// Error
{
  type: "ERROR",
  message: "Por favor selecciona un frame primero"
}
```

## 📊 Tipos de Datos

Ver `src/types/index.ts` para definiciones completas:

- `Format` - Definición de un formato
- `DesignAnalysis` - Análisis extraído
- `GeneratedFrame` - Frame calculado
- `SmartRule` - Regla de layout
- `ElementRule` - Regla de elemento
- `FontInfo` - Información de fuente
- `ResizeResult` - Resultado de generación
- `ValidationError` - Error de validación

## 🛠️ Extensibilidad

### Agregar nuevo tipo de regla
1. Edita `config/smartRules.json`
2. Agrega nueva regla con condition
3. Recompila: `npm run build`

### Agregar nuevo formato
1. Edita `config/formats.json`
2. Agregalo bajo META o DISPLAY
3. Opcionalmente, crea regla en smartRules.json

### Personalizar análisis
Edita `src/analyzer.ts`:
- `extractTypography()` para detectar más fuentes
- `extractColors()` para análisis de color avanzado
- `analyzeElements()` para detectar más tipos de elementos

### Personalizar cálculos
Edita `src/calculator.ts`:
- Cambia lógica de escalado
- Ajusta posicionamiento
- Modifica validaciones de tamaño

## 🚀 Roadmap Técnico

- [ ] Soporte para componentes de Figma (component sets)
- [ ] Análisis de estilos (colores, fuentes de Figma)
- [ ] Integración con variables de Figma
- [ ] Historial de generaciones
- [ ] Exportación de CSS/JSON
- [ ] API REST para batch processing
- [ ] Integración con Claude API para análisis avanzado
- [ ] Soporte para documentación automática
- [ ] Cache de análisis para performance

## 📝 Notas Técnicas

### Performance
- El análisis es O(n) en número de children
- Calculator es O(n) en número de formatos
- Validator es O(n) en reglas
- Generación depende de Figma API

### Limitaciones Actuales
- No soporta componentes nested complejos
- Análisis básico de tipografía (no detecta todas las fuentes)
- Colores: solo fill sólido detectado
- Posicionamiento: estimado, no absoluto

### Mejoras Futuras
- Usar Figma API avanzada para componentes
- Integrar con variable system de Figma
- Análisis de estilos y tokens
- Machine learning para reglas automáticas
