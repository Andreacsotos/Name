# Smart Size - Guía Rápida

## 🚀 Comienza en 3 minutos

### 1️⃣ Preparar (1 minuto)
```bash
# Ir a la carpeta del proyecto
cd ~/Name

# Instalar dependencias
npm install
```

### 2️⃣ Compilar (30 segundos)
```bash
# Compilar el plugin
npm run build
```

### 3️⃣ Instalar en Figma (1.5 minutos)

**Opción A: Figma Desktop App**
1. Abre Figma Desktop
2. Ve a **Plugins** > **Development** > **New plugin**
3. Selecciona **Link existing plugin**
4. Navega a tu carpeta de proyecto
5. Selecciona **manifest.json**
6. ¡Listo! El plugin aparecerá en tu menú de plugins

**Opción B: Figma Web**
1. Abre https://figma.com
2. Ve a **Plugins** > **Development** > **New plugin**
3. Similar a Desktop App

## 📖 Uso Básico

### Paso 1: Preparar tu diseño
- Crea o abre un diseño en Figma
- Asegúrate de que sea un **Frame**
- Selecciona el frame

### Paso 2: Abrir Smart Size
- Ve a **Plugins** > **Development** > **Smart Size**

### Paso 3: Seleccionar formatos
- Elige entre categorías: **Todos**, **Social**, **Banner**
- O selecciona formatos individuales
- Usa **Todos** para seleccionar todos
- Usa **Ninguno** para deseleccionar

### Paso 4: Generar
- Haz clic en **🚀 Generar Variantes**
- El plugin analizará tu diseño
- Creará frames para cada formato seleccionado

### Resultado
Los nuevos frames aparecerán en tu página actual, organizados junto al original.

## 🎨 Ejemplo: Adaptando un Poster a Instagram

**Supongamos que tienes:**
- Un poster 1920×1080 (16:9)
- Con logo, imagen hero, título y texto

**Quieres:**
- Versión Instagram Square (1080×1080)
- Versión Instagram Feed (1080×1350)

**Solución:**
1. Selecciona el frame con tu poster
2. Abre Smart Size
3. Ve a **Social**
4. Selecciona ✓ Instagram Square y ✓ Instagram Feed
5. Haz clic **🚀 Generar Variantes**
6. ¡Magia! Tienes 2 nuevos frames adaptados automáticamente

## ⚙️ Opciones Avanzadas

### Crear Formato Personalizado
Si necesitas un tamaño especial:
1. Completa los campos en la sección inferior
   - Nombre: "Mi Custom Banner"
   - Ancho: 1200
   - Alto: 300
2. Haz clic **+ Añadir Formato**
3. Aparecerá en tu lista de formatos

### Filtrar por Complejidad
Los formatos muestran su complejidad:
- 🟢 **low**: Fácil de adaptar
- 🟠 **high**: Moderado, algunos ajustes
- 🔴 **extreme**: Muy diferente, requiere rediseño

## 🔧 Desarrollo Local

### Compilación en tiempo real
```bash
npm run watch
```
El código se recompila automáticamente cuando haces cambios.

### Acceder a la consola del plugin
En Figma:
- **Plugins** > **Development** > **Open Console**

Ahí verás mensajes de depuración del plugin.

### Editar configuraciones

**Agregar nuevo formato:**
Edita `config/formats.json` y recompila:
```bash
npm run build
```

**Editar reglas de diseño:**
Edita `config/smartRules.json` y recompila.

## 🆘 Problemas Comunes

### "No hay frame seleccionado"
**Solución:** Asegúrate de seleccionar un frame (no un grupo o forma)

### Plugin no aparece después de instalar
**Solución:** 
- Cierra completamente Figma
- Abre nuevamente
- Ve a Plugins > Development > Smart Size

### Textos se ven demasiado pequeños
**Solución:** 
- Edita `config/smartRules.json`
- Aumenta `minSize` en los elementos de texto

### Imágenes se recortan en formato pequeño
**Solución:**
- Es normal en formatos "extreme"
- Puedes ocultar la imagen en la regla del formato

## 📊 Cómo el Plugin Analiza tu Diseño

1. **Tipografía**: Encuentra todos los textos, agrupa por tamaño
2. **Colores**: Detecta fondo, texto, colores secundarios
3. **Espaciado**: Mide márgenes y distancia entre elementos
4. **Elementos**: Identifica imágenes, posición, proporciones

Luego, para cada formato:
- Aplica la regla correspondiente
- Escala proporcional manteniendo proporciones
- Posiciona elementos automáticamente
- Genera el nuevo frame

## 🎯 Casos de Uso

### Marketing
- Crear anuncios para múltiples plataformas
- Adaptar banners publicitarios
- Generar posts para redes sociales

### E-commerce
- Adaptaciones de productos
- Banners de promoción
- Headers de categoría

### Diseño Editorial
- Portadas para distintos formatos
- Headers de artículos
- Cartas de presentación

### Branding
- Adaptaciones de logos
- Variaciones de posters
- Elementos de marca para diferentes medios

## 💡 Tips & Tricks

### Tip 1: Comienza simple
Prueba primero con formatos similares al original (misma proporción).

### Tip 2: Revisa el análisis
Abre la consola (Plugins > Open Console) para ver qué detectó.

### Tip 3: Reutiliza configuraciones
Si un ajuste funciona bien, puedes copiarlo a otras reglas.

### Tip 4: Combina formatos
Genera todos de una vez en lugar de uno por uno.

### Tip 5: Usa formatos personalizados
Para tamaños específicos de tu cliente o plataforma.

## 📞 Siguiente Paso

¿Listo para profundizar? Lee:
- **README.md** - Documentación completa
- **config/formats.json** - Todos los formatos disponibles
- **config/smartRules.json** - Cómo funcionan las reglas

¡Disfruta adaptando tus diseños! 🎨
