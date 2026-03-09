# Especificación lista para IA de programación (Astro + Cloudflare Pages)

## Objetivo
Construir una web **SSG (Astro)** para un equipo de nutricionistas y entrenadores con:

- **Home**: hero + CTAs (WhatsApp/Calendly), resumen de planes, reseñas, Instagram, FAQ, contacto + mapa.
- **Planes**: mensual / trimestral / primera visita.
- **Equipo**: perfiles con foto, rol, bio, especialidades y enlace directo a WhatsApp.
- **Contacto**: teléfono, email, WhatsApp, dirección, mapa Google, enlaces Instagram y Google.
- **FAQ**: acordeón ligero.
- **Instagram**: widget de terceros (lazy).
- **Google Reviews**: rating + 3–5 reseñas recientes (no todas) via Places API (New) mediante **Cloudflare Pages Function** con caché.

### Requisitos de performance
- HTML estático generado en build (Astro).
- JS solo donde haga falta: Calendly + widget Instagram + fetch reseñas.
- Carga **lazy** (IntersectionObserver) de Calendly e Instagram.
- Reseñas servidas desde `/api/reviews` same-origin.

---

## 0) Hosting target: Cloudflare Pages
- Deploy en **Cloudflare Pages**.
- **Pages Functions** activas usando carpeta `/functions` con file-based routing.
- Variable de entorno en Pages: `GOOGLE_MAPS_API_KEY`.

Referencia:
- https://developers.cloudflare.com/pages/functions/

---

## 1) Estructura del repo

```
/
  functions/
    api/
      reviews.ts
  src/
    components/
      Layout.astro
      Hero.astro
      PlanCard.astro
      TeamCard.astro
      FAQ.astro
      GoogleMapEmbed.astro
      CalendlyLazy.astro
      InstagramWidgetLazy.astro
      Reviews.astro
    content/
      planes/
        mensual.md
        trimestral.md
        primera-visita.md
      equipo/
        ...
      faq/
        ...
    pages/
      index.astro
      planes.astro
      equipo.astro
      contacto.astro
      faq.astro
    config/
      site.ts
    content.config.ts
  public/
    team/
    ...
  package.json
  astro.config.mjs
```


---

## 2) Config central (un solo archivo)

Crear `src/config/site.ts` con:

- `siteName: string`
- `whatsappNumberMain: string` (E164 sin “+”, ej `34600111222`)
- `whatsappDefaultMessage: string`
- `addressText: string`
- `googleMapsEmbedSrc: string` (URL iframe copiada desde Google Maps “Insertar mapa”)
- `googleMapsPlaceId: string` = `"ChIJ1ciLHn-KQQ0RBpdzQGpBshE"`
- `googleMapsProfileUrl: string` (link “Ver en Google”)
- `calendlyUrl: string` (ej. `https://calendly.com/...`)
- `instagramProfileUrl: string`
- `instagramWidgetEmbedHtml: string` (snippet del proveedor, como string)

---

## 3) WhatsApp helper

Implementar helper TS (por ejemplo `src/utils/whatsapp.ts`):

- `buildWhatsAppLink(number: string, text?: string): string`
- Formato: `https://wa.me/<number>?text=<urlencoded>`

Ejemplo:
- `https://wa.me/34600111222?text=Hola%20quiero%20info%20sobre%20planes`

---

## 4) Calendly embed (lazy)

### Componente: `src/components/CalendlyLazy.astro`

**Requisitos**
- Renderizar un contenedor (div) con:
  - `data-calendly-url="<calendlyUrl>"`
  - altura mínima (ej. 650px)
- Insertar el script de Calendly solo al entrar en viewport:
  - `https://assets.calendly.com/assets/external/widget.js`
- Inicializar inline widget:
  - `Calendly.initInlineWidget({ url, parentElement })`

**Lazy load (IntersectionObserver)**
- Observar el contenedor.
- Al entrar en viewport:
  - si el script no existe, crearlo y añadirlo (`async`).
  - cuando cargue, inicializar el widget.
  - si el script ya existe, inicializar directamente.

---

## 5) Instagram widget (lazy + ejecución de scripts)

### Componente: `src/components/InstagramWidgetLazy.astro`

**Props**
- `embedHtml: string` (snippet del proveedor)

**Render**
- `<div id="ig-widget-root"></div>` + placeholder opcional

**Lazy load**
- IntersectionObserver al root.
- Cuando sea visible:
  1. Crear un `<template>` y hacer `template.innerHTML = embedHtml`
  2. Insertar primero todos los nodos **no-script** en `#ig-widget-root`
  3. Para cada `<script>` dentro del template:
     - `const s = document.createElement("script")`
     - Copiar `src`, `async`, `defer`, y/o `textContent`
     - Añadirlo a `document.body` o al root para que se ejecute

> Nota: `innerHTML` no garantiza ejecución de scripts; recrearlos manualmente.

---

## 6) Google Maps embed (ligero)

### Componente: `src/components/GoogleMapEmbed.astro`
- `iframe` con:
  - `src={googleMapsEmbedSrc}`
  - `loading="lazy"`
  - `referrerpolicy="no-referrer-when-downgrade"`
  - `title` descriptivo

---

## 7) Google Reviews (3–5) con Places API (New) + Pages Function + caché

### 7.1 Endpoint
- Ruta: `GET /api/reviews`
- Archivo: `functions/api/reviews.ts` (Cloudflare Pages Functions => file-based routing)

Referencia routing:
- https://developers.cloudflare.com/pages/functions/routing/

### 7.2 Places API (New): Place Details
Endpoint:
- `GET https://places.googleapis.com/v1/places/{PLACE_ID}`

Headers:
- `X-Goog-Api-Key: <API_KEY>`
- `X-Goog-FieldMask: rating,userRatingCount,reviews`

PlaceId fijo:
- `ChIJ1ciLHn-KQQ0RBpdzQGpBshE`

Referencia Place Details:
- https://developers.google.com/maps/documentation/places/web-service/place-details

### 7.3 Caché
Responder con header:
- `Cache-Control: public, s-maxage=21600, stale-while-revalidate=86400`

Referencia SWR en Cloudflare:
- https://developers.cloudflare.com/cache/concepts/revalidation/

---

## 7.4 Código listo para Cloudflare Pages Functions

**Archivo: `functions/api/reviews.ts`**

```ts
export interface Env {
  GOOGLE_MAPS_API_KEY: string;
}

type ReviewOut = {
  authorName?: string;
  rating?: number;
  text?: string;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  profilePhotoUrl?: string;
};

type ResponseOut = {
  placeId: string;
  rating?: number;
  userRatingCount?: number;
  reviews: ReviewOut[];
  fetchedAt: string;
};

const PLACE_ID = "ChIJ1ciLHn-KQQ0RBpdzQGpBshE";
const MAX_REVIEWS = 5;

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.GOOGLE_MAPS_API_KEY) {
    return json(
      { error: "Missing GOOGLE_MAPS_API_KEY" },
      500,
      "public, s-maxage=60"
    );
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
    PLACE_ID
  )}`;

  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return json(
      { error: "Places API error", status: res.status, body: text.slice(0, 500) },
      502,
      "public, s-maxage=300"
    );
  }

  const data = (await res.json()) as any;

  const reviewsRaw: any[] = Array.isArray(data.reviews) ? data.reviews : [];
  // Orden por publishTime desc si existe
  reviewsRaw.sort((a, b) => {
    const ta = Date.parse(a.publishTime ?? 0) || 0;
    const tb = Date.parse(b.publishTime ?? 0) || 0;
    return tb - ta;
  });

  const reviews: ReviewOut[] = reviewsRaw.slice(0, MAX_REVIEWS).map((r) => ({
    authorName: r.authorAttribution?.displayName,
    profilePhotoUrl: r.authorAttribution?.photoUri,
    rating: r.rating,
    text: r.text?.text, // Places New suele devolver text:{text,languageCode}
    relativePublishTimeDescription: r.relativePublishTimeDescription,
    publishTime: r.publishTime,
  }));

  const out: ResponseOut = {
    placeId: PLACE_ID,
    rating: data.rating,
    userRatingCount: data.userRatingCount,
    reviews,
    fetchedAt: new Date().toISOString(),
  };

  return json(out, 200, "public, s-maxage=21600, stale-while-revalidate=86400");
};

function json(body: unknown, status = 200, cacheControl?: string) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
  });
  if (cacheControl) headers.set("Cache-Control", cacheControl);
  return new Response(JSON.stringify(body), { status, headers });
}
```

Notas
- Endpoint same-origin evita CORS.
- Si Google devuelve pocas reseñas, es aceptable (requisito: “unas pocas”).

## 8) Componente `Reviews.astro` (client fetch + skeleton)

**Requisitos**
- Render inicial: skeleton / “Cargando reseñas…”
- `fetch('/api/reviews')` al montar
- Mostrar:
  - `rating` con estrellas (ej. ★)
  - `userRatingCount` (“X reseñas”)
  - 3–5 cards con:
    - autor
    - fecha relativa (si existe)
    - texto (truncado a 200–300 chars)
- Botón: “Ver todas en Google” -> `googleMapsProfileUrl`


## 9) Contenido (editable por el dev)

### Opción recomendada: Astro Content Collections
Crear `src/content.config.ts` con colecciones:

- `planes`:
  - `title: string`
  - `price: string`
  - `period: string`
  - `features: string[]`
  - `ctaLabel: string`
  - `ctaHref: string`

- `equipo`:
  - `name: string`
  - `role: string`
  - `bio: string`
  - `specialties: string[]`
  - `photo: string`
  - `whatsappNumber: string`

- `faq`:
  - `question: string`
  - `answer: string` (markdown o texto)

Referencia:
- https://docs.astro.build/en/guides/content-collections/


## 10) Páginas (composición)

### `src/pages/index.astro`
Secciones:
1) Hero + CTA WhatsApp + CTA Reservar (scroll a Calendly)
2) Planes (3 cards)
3) Equipo (grid)
4) Reseñas (Reviews.astro)
5) Instagram (InstagramWidgetLazy.astro)
6) FAQ (FAQ.astro)
7) Contacto + mapa

### `src/pages/planes.astro`
- Listar los planes desde content collection

### `src/pages/equipo.astro`
- Grid de miembros desde content collection

### `src/pages/faq.astro`
- Listado completo de preguntas

### `src/pages/contacto.astro`
- WhatsApp principal + email + dirección + mapa + links IG/Google


## 11) Estilos y SEO (mínimo)

- CSS simple (sin framework) para ligereza.
- `loading="lazy"` en imágenes e iframe.
- Evitar fuentes externas (usar stack de sistema).
- Opcional: sitemap/robots.


## 12) Variables de entorno en Cloudflare Pages

En Cloudflare Pages:
- Settings → Environment variables:
  - `GOOGLE_MAPS_API_KEY` = tu API key

README debe documentar:
- cómo correr local (`npm i`, `npm run dev`)
- cómo desplegar en Pages
- dónde pegar el snippet del widget Instagram
- cómo configurar Calendly y WhatsApp