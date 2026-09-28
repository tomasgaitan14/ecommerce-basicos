# basicos

**En vivo:** https://tiendabasicosecommerce.vercel.app

E-commerce de ropa básica para hombre, con estética minimalista. Proyecto de portfolio: recorre
el flujo completo de una tienda (catálogo, producto, carrito, checkout y confirmación) sin
procesar pagos reales.

## Requisitos

- Node 24 (fijado en `.nvmrc`). Con nvm: `nvm use`.

## Setup

```bash
nvm use
npm install
npm run dev
```

## Variables de entorno

Dos, las dos opcionales (ver `.env.example`):

- `SITE_URL`: la URL pública del sitio para la preview del link al compartirlo (Open Graph). En
  Vercel no hace falta, porque sale de `VERCEL_PROJECT_PRODUCTION_URL`.
- `GTM_ID`: el contenedor de Google Tag Manager. Sin ella el sitio no carga GTM. En Vercel va solo en
  Production, así local y las previews no mandan datos a Analytics.

## Scripts

| Script | Qué hace |
|--------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Chequeo de tipos + build de producción en `dist/` |
| `npm run preview` | Sirve el build de `dist/` |
| `npm run lint` | oxlint |
| `npm test` | Tests (Vitest) una vez |
| `npm run test:watch` | Tests en modo watch |

## Stack

Vite 8, React 19, TypeScript, Tailwind v4, React Router 8, Vitest + Testing Library y oxlint.

Sin backend ni base de datos: el catálogo es estático y el carrito vive en `localStorage`.

## Qué incluye

- Portada, catálogo por categoría con orden por precio, ficha de producto con color y talle,
  carrito lateral, checkout simulado y confirmación del pedido.
- Las prendas son dibujos SVG planos que se pintan con el color elegido: 14 dibujos para 20 productos.
- El checkout valida los datos y genera un pedido de prueba. No pide datos de tarjeta.
- Medición con Google Tag Manager, solo en producción: la app deja los eventos en el `dataLayer` y
  el contenedor decide qué va a Google Analytics. Qué se mide y cómo probarlo está en el
  [plan de medición](docs/tracking-plan.md).
- El sitio lleva `noindex`: es una tienda ficticia y no debería aparecer en buscadores.
  La preview del link al compartirlo funciona igual.

## Estructura

```
src/
  data/        catálogo, colores, dibujos de las prendas, guías de talles
  lib/         lógica pura: catálogo, precios, carrito, persistencia, checkout, analytics
  context/     estado del carrito
  hooks/       un evento de medición por página
  components/  piezas de la interfaz
  pages/       una por ruta
tests/         lógica en la raíz, flujos de la interfaz en tests/ui
docs/          plan de medición y export del contenedor de GTM
```

## Deploy

Vercel, conectado a este repo: cada push a `main` deploya a producción. La configuración está en
`vercel.json`.

La tipografía es [Archivo](https://github.com/Omnibus-Type/Archivo), con licencia SIL Open Font License.
