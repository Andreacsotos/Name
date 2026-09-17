import SmartSizePlugin from "./index.js";

// Inicializar el plugin
const plugin = new SmartSizePlugin();

// Configurar listeners para mensajes desde la UI
figma.ui.onmessage = async (msg) => {
  console.log("📨 Mensaje recibido del UI:", msg.type);

  switch (msg.type) {
    case "ANALYZE_AND_RESIZE": {
      try {
        const selectedNode = figma.currentPage.selection[0];

        if (!selectedNode) {
          figma.ui.postMessage({
            type: "ERROR",
            message: "Por favor selecciona un frame primero",
          });
          return;
        }

        if (selectedNode.type !== "FRAME") {
          figma.ui.postMessage({
            type: "ERROR",
            message: "El elemento seleccionado debe ser un frame",
          });
          return;
        }

        // Ejecutar resize con formatos seleccionados
        const result = await plugin.resizeDesign(
          selectedNode,
          msg.selectedFormats,
          figmaContext(selectedNode)
        );

        // Enviar resultado a la UI
        figma.ui.postMessage({
          type: "RESIZE_COMPLETE",
          success: result.success,
          framesGenerated: result.framesGenerated.map((f) => ({
            name: f.name,
            width: f.dimensions.width,
            height: f.dimensions.height,
          })),
          errors: result.errors,
          warnings: result.warnings,
        });
      } catch (error: any) {
        figma.ui.postMessage({
          type: "ERROR",
          message: error.message || "Error desconocido",
        });
      }
      break;
    }

    case "GET_FORMATS": {
      const formats = plugin.getAvailableFormats();
      figma.ui.postMessage({
        type: "FORMATS_LIST",
        formats: formats.map((f) => ({
          key: `${f.category}-${f.width}x${f.height}`,
          name: f.name,
          width: f.width,
          height: f.height,
          category: f.category,
          complexity: f.complexity,
          priority: f.priority,
        })),
      });
      break;
    }

    case "GET_FORMATS_BY_CATEGORY": {
      const formats = plugin.getFormatsByCategory(msg.category);
      figma.ui.postMessage({
        type: "FORMATS_LIST",
        formats: formats.map((f) => ({
          key: `${f.category}-${f.width}x${f.height}`,
          name: f.name,
          width: f.width,
          height: f.height,
        })),
      });
      break;
    }

    case "CREATE_CUSTOM_FORMAT": {
      try {
        const customFormat = plugin.createCustomFormat(
          msg.name,
          msg.width,
          msg.height
        );
        figma.ui.postMessage({
          type: "CUSTOM_FORMAT_CREATED",
          format: customFormat,
        });
      } catch (error: any) {
        figma.ui.postMessage({
          type: "ERROR",
          message: `Error al crear formato personalizado: ${error.message}`,
        });
      }
      break;
    }

    default:
      console.warn("Tipo de mensaje desconocido:", msg.type);
  }
};

// Crear contexto de Figma para crear elementos
function figmaContext(frame: any) {
  return {
    createFrame: (options: any) => {
      const newFrame = figma.createFrame();
      newFrame.name = options.name;
      newFrame.resize(options.width, options.height);
      frame.parent.appendChild(newFrame);
      return newFrame;
    },
    createRectangle: () => {
      return figma.createRectangle();
    },
    createText: () => {
      return figma.createText();
    },
    colors: {
      background: "#FFFFFF",
      text: "#000000",
      secondary: "#CCCCCC",
    },
  };
}

// Mostrar UI
figma.showUI(__html__, { width: 320, height: 600 });

console.log("✅ Smart Size Plugin cargado");
