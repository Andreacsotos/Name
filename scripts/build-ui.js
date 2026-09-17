import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

// Leer el archivo HTML
const uiPath = path.join(projectRoot, "src/ui.html");
const distPath = path.join(projectRoot, "dist");

// Crear el directorio dist si no existe
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Leer el contenido del HTML
const htmlContent = fs.readFileSync(uiPath, "utf-8");

// Copiar el HTML a dist
const outputPath = path.join(distPath, "ui.html");
fs.writeFileSync(outputPath, htmlContent);

console.log("✅ UI compilado: dist/ui.html");
