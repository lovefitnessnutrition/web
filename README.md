# LFN – Nutrición y Entrenamiento

Web estática (Astro SSG) desplegada en **Cloudflare Pages** para un equipo de nutricionistas y entrenadores personales.

## Requisitos previos

- Node.js ≥ 18
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

La web estará disponible en `http://localhost:4321`.

> **Nota:** El endpoint `/api/reviews` solo funciona en Cloudflare Pages (Pages Functions). En desarrollo local no estará disponible a menos que uses `wrangler pages dev`.

### Probar la función de reseñas en local

```bash
npx wrangler pages dev ./dist --binding GOOGLE_MAPS_API_KEY=tu_api_key
```

## Build

```bash
npm run build
```

Los archivos estáticos se generan en `dist/`.

## Despliegue en Cloudflare Pages

### Opción A – Git conectado (recomendado)

1. Ve al [dashboard de Cloudflare](https://dash.cloudflare.com/) → **Compute (Workers) > Workers & Pages** → **Create** → pestaña **Pages** → conecta tu repositorio Git.
2. Configura el proyecto:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. En **Settings → Environment variables** añade:
   - `GOOGLE_MAPS_API_KEY` = tu clave de API de Google (con Places API habilitada)
4. Haz clic en **Save and Deploy**.

La carpeta `functions/` se detecta automáticamente para las Pages Functions.

### Opción B – CLI con Wrangler

```bash
# Previsualizar con Cloudflare Pages localmente (incluye Functions)
npm run pages:dev

# Desplegar manualmente
npm run pages:deploy
```

## Configuración

### `src/config/site.ts`

Archivo central con todos los datos configurables:

| Campo | Descripción |
|---|---|
| `siteName` | Nombre del sitio |
| `whatsappNumberMain` | Número WhatsApp principal (E164 sin "+") |
| `whatsappDefaultMessage` | Mensaje pre-rellenado al abrir WhatsApp |
| `addressText` | Dirección física |
| `googleMapsEmbedSrc` | URL del iframe de Google Maps ("Insertar mapa") |
| `googleMapsPlaceId` | Place ID de Google |
| `googleMapsProfileUrl` | Link al perfil en Google Maps |
| `calUrl` | URL de tu evento en Cal.com |
| `instagramProfileUrl` | URL del perfil de Instagram |
| `instagramWidgetEmbedHtml` | Snippet HTML del proveedor de widget de Instagram |
| `email` | Email de contacto |
| `phone` | Teléfono de contacto |

### Widget de Instagram

Pega el snippet HTML completo que te proporcione tu proveedor de widget en el campo `instagramWidgetEmbedHtml` de `src/config/site.ts`. El widget se cargará de forma lazy cuando el usuario haga scroll hasta esa sección.

### Cal.com

Cambia `calUrl` en `src/config/site.ts` por la URL de tu evento en Cal.com.

### WhatsApp

Cambia `whatsappNumberMain` por tu número en formato E164 sin "+" (ej: `34600111222`).

## Contenido

El contenido se gestiona mediante **Astro Content Collections** en `src/content/`:

- `planes/` – Planes de nutrición/entrenamiento (.md)
- `equipo/` – Miembros del equipo (.md)
- `faq/` – Preguntas frecuentes (.md)

### Fotos del equipo

Sustituye los placeholders en `public/team/` por las fotos reales (JPG/WebP). El nombre debe coincidir con el campo `photo` del archivo `.md` correspondiente.

## Estructura

```
functions/api/reviews.ts    → Cloudflare Pages Function (Google Reviews)
src/config/site.ts          → Configuración central
src/content/                → Content Collections (planes, equipo, faq)
src/components/             → Componentes Astro
src/pages/                  → Páginas (index, planes, equipo, faq, contacto)
src/utils/                  → Helpers (WhatsApp)
public/                     → Assets estáticos
```
