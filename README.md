# basicos

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

Vite 8 · React 19 · TypeScript · Tailwind v4 · React Router 8 · Vitest + Testing Library · oxlint

Sin backend ni base de datos: el catálogo es estático y el carrito vive en `localStorage`.
