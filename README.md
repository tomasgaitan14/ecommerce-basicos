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

Vite 8, React 19, TypeScript, Tailwind v4, React Router 8, Vitest + Testing Library y oxlint.

Sin backend ni base de datos: el catálogo es estático y el carrito vive en `localStorage`.

## Qué incluye

- Portada, catálogo por categoría con orden por precio, ficha de producto con color y talle,
  carrito lateral, checkout simulado y confirmación del pedido.
- Las prendas son dibujos SVG planos que se pintan con el color elegido: 14 dibujos para 20 productos.
- El checkout valida los datos y genera un pedido de prueba. No pide datos de tarjeta.

## Estructura

```
src/
  data/        catálogo, colores, dibujos de las prendas, guías de talles
  lib/         lógica pura: catálogo, precios, carrito, persistencia, checkout
  context/     estado del carrito
  components/  piezas de la interfaz
  pages/       una por ruta
tests/         lógica en la raíz, flujos de la interfaz en tests/ui
```

La tipografía es [Archivo](https://github.com/Omnibus-Type/Archivo), con licencia SIL Open Font License.
