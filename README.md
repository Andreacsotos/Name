# Smart Size - Intelligent Design Resizer

**Smart Size** es un plugin de Figma que redimensiona inteligentemente diseños a múltiples formatos automáticamente. Ideal para adaptaciones de redes sociales, banners publicitarios y cualquier diseño responsivo.

## 🎯 Características

- ✅ **Análisis Automático**: Extrae tipografía, colores, espaciado y elementos del diseño actual
- ✅ **Formatos Predefinidos**: Soporta 11 formatos para redes sociales y publicidad
- ✅ **Reglas Inteligentes**: Aplica reglas específicas según el formato (full, minimal, compact, extreme)
- ✅ **Genérico**: Funciona con cualquier marca sin configuración adicional
- ✅ **Formato Personalizado**: Crea formatos a medida
- ✅ **Escalado Proporcional**: Mantiene proporciones y legibilidad de texto
- ✅ **Ubicación Local**: Alojado en tu computadora

## 📋 Formatos Soportados

### META (Redes Sociales)
- **1080×1080** - Instagram Square / Facebook (1:1)
- **1080×1350** - Instagram Feed (0.8:1)
- **1000×1000** - Facebook Square (1:1)
- **1080×1920** - Instagram Story / TikTok (9:16)
- **1920×1080** - YouTube Thumbnail / Widescreen (16:9)

### DISPLAY (Publicidad)
- **300×250** - Medium Rectangle IAB
- **300×600** - Half Page Ad IAB
- **320×250** - Mobile Rectangle
- **160×1600** - Wide Skyscraper
- **300×50** - Mobile Banner
- **320×50** - Mobile Banner Standard

## 🚀 Instalación

### Requisitos
- Node.js 16+ 
- npm o yarn
- Figma (desktop o web)

### Pasos

1. **Clonar o descargar el repositorio**
   ```bash
   cd ~/Smart-Size
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Compilar el plugin**
   ```bash
   npm run build
   ```

4. **En Figma**
   - Abre Figma (app o web)
   - Ve a **Plugins** > **Development** > **New plugin**
   - Selecciona **Link existing plugin**
   - Navega a la carpeta del proyecto y selecciona **manifest.json**

## 💻 Uso

### Flujo Básico

1. **Selecciona un frame** en tu diseño de Figma
2. **Abre el plugin** (Plugins > Development > Smart Size)
3. **Selecciona formatos** o categorías que desees
4. **Haz clic en "Generar Variantes"**
5. **¡Listo!** Los nuevos frames se crearán en tu página

### Crear Formato Personalizado

1. Completa los campos en la sección "Formato Personalizado"
   - Nombre: Ej. "Mi Banner Custom"
   - Ancho: Ej. 1200
   - Alto: Ej. 300
2. Haz clic en "+ Añadir Formato"
3. Selecciona y genera

## ⚙️ Configuración

### Formatos (config/formats.json)
Define dimensiones, categorías y prioridades:
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

### Reglas Inteligentes (config/smartRules.json)
Define cómo adaptar elementos según el formato:
```json
{
  "name": "Small Banner (320x50)",
  "condition": "width >= 300 && width <= 350 && height <= 60",
  "layout": "extreme",
  "elements": {
    "logo": { "show": true, "scale": 0.3 },
    "title": { "show": true, "scale": 0.3, "minSize": 14, "maxSize": 16 },
    "image": { "show": false }
  }
}
```

## 🛠️ Desarrollo

### Estructura del Proyecto
```
Smart-Size/
├── src/
│   ├── analyzer.ts      # Análisis del diseño actual
│   ├── calculator.ts    # Cálculo de nuevas dimensiones
│   ├── validator.ts     # Validación de reglas de diseño
│   ├── generator.ts     # Generación en Figma
│   ├── index.ts         # Orquestación principal
│   ├── types/
│   │   └── index.ts     # Definiciones de tipos
│   ├── plugin.ts        # Entrada del plugin Figma
│   └── ui.html          # Interfaz del usuario
├── config/
│   ├── formats.json     # Formatos disponibles
│   └── smartRules.json  # Reglas inteligentes
├── scripts/
│   └── build-ui.js      # Script para compilar UI
├── dist/                # Salida compilada
├── manifest.json        # Manifiesto del plugin
├── package.json
└── README.md
```

### Scripts Disponibles

```bash
# Desarrollo con watch
npm run dev

# Compilar para producción
npm run build

# Ver cambios en tiempo real
npm run watch

# Ejecutar código compilado
npm start
```

### Agregar Nuevos Formatos

1. Edita `config/formats.json`
2. Agrégalo bajo META o DISPLAY
3. Opcionalmente, agrega una regla en `config/smartRules.json`
4. Recompila: `npm run build`

### Agregar Nuevas Reglas

1. Edita `config/smartRules.json`
2. Crea una nueva regla con:
   - **name**: Nombre descriptivo
   - **condition**: Expresión JavaScript (width, height)
   - **layout**: Tipo de disposición
   - **elements**: Configuración de elementos
   - **spacing**: Márgenes y gaps
3. Recompila: `npm run build`

## 📊 Cómo Funciona

### 1. Análisis (Analyzer)
- Extrae tipografías del frame actual
- Detecta colores (fondo, texto, secundario)
- Calcula espaciado (márgenes, gaps)
- Identifica imágenes y su posición

### 2. Cálculo (Calculator)
- Toma el análisis del diseño actual
- Para cada formato seleccionado:
  - Encuentra la regla aplicable
  - Calcula escalas proporcionales
  - Determina tamaños de fuente legibles
  - Calcula posiciones de elementos

### 3. Validación (Validator)
- Verifica dimensiones correctas
- Valida que elementos no se desborden
- Verifica contraste de colores
- Revisa espaciado mínimo
- Reporta errores y advertencias

### 4. Generación (Generator)
- Crea frames en Figma
- Posiciona elementos
- Aplica colores y estilos
- Retorna resultado de generación

## 🎨 Principios de Diseño

### Escalado de Tipografía
- Mantiene ratios de tamaño relativo
- Respeta tamaños mínimos para legibilidad
- Ajusta lineHeight proporcionalmente

### Espaciado
- Proporcional: Escala con el formato
- Fijo: Usa valores específicos en reglas
- Mínimos: Nunca por debajo de límites

### Elemento Imagen
- Preserva aspect ratio
- Centra o posiciona según regla
- Oculta si no cabe en formato extremo

## ❓ Preguntas Frecuentes

**P: ¿Funciona con cualquier marca?**  
R: Sí, es completamente genérico. Analiza automáticamente el diseño actual.

**P: ¿Puedo modificar las reglas?**  
R: Sí, edita `config/smartRules.json` y recompila.

**P: ¿Cómo agrego nuevos formatos?**  
R: Edita `config/formats.json` con el nuevo formato y sus dimensiones.

**P: ¿Qué pasa con formatos muy pequeños?**  
R: Usa la regla "extreme" que oculta elementos no esenciales.

**P: ¿Puedo crear formatos sin guardar en config?**  
R: Sí, usa la UI para crear formatos personalizados sin editar archivos.

## 🤝 Contribuir

Para mejorar Smart Size:

1. Haz cambios en el código
2. Prueba con `npm run build`
3. Verifica en Figma
4. Commit y push

## 📝 Licencia

MIT License - Libre para usar y modificar

## 🎯 Roadmap

- [ ] Soporte para componentes de Figma
- [ ] Exportación de estilos
- [ ] Presets de marcas
- [ ] Historial de generaciones
- [ ] Cloud sync de configuraciones
- [ ] API REST para automatización
- [ ] Soporte para variables de Figma
- [ ] Generación con IA (Claude API)

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Figma esté actualizado
2. Recompila: `npm run build`
3. Revisa la consola del plugin (Plugins > Development > Open Console)
4. Consulta la estructura del proyecto

---

**Hecho con ❤️ para diseñadores que quieren automatizar su flujo responsivo**
