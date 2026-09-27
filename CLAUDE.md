# ecommerce-basicos

## Descripción

E-commerce de **basicos**, una marca (ficticia) de ropa básica para hombre: remeras, chombas,
camisas, buzos, camperas, pantalones, bermudas y ropa interior, todo liso. Estética minimalista.

Es un **proyecto de portfolio**: recorre el flujo completo de una tienda (catálogo → producto →
carrito → checkout → confirmación) pero no vende de verdad ni procesa pagos.

## Contexto

Personal (portfolio).

## Stack usado en este proyecto

| Capa | Elección |
|------|----------|
| Build | Vite 8 + React 19 + TypeScript |
| Estilos | Tailwind v4 (tokens en `@theme`, sin `tailwind.config.js`). Íconos SVG propios, sin librería |
| Rutas | React Router 8 en modo data (`createBrowserRouter`), por `ScrollRestoration` |
| Estado | Carrito con Context + `useReducer`, persistido en `localStorage` |
| Datos | Catálogo estático tipado en `src/data/`. Sin backend ni DB |
| Tests | Vitest + Testing Library + jsdom, en `tests/` |
| Lint | oxlint |
| Node | 24 LTS, fijado en `.nvmrc` |
| Deploy | **Todavía ninguno.** Vercel como sitio estático cuando esté listo |

Dependencias de runtime: solo `react`, `react-dom` y `react-router`.

## Proyectos relacionados

Ninguno. No tiene backend, flujos de n8n ni base de datos.

## Estado actual

Scaffold listo (Vite + Tailwind + Vitest + oxlint). Build y lint pasan. `src/App.tsx` todavía
es un placeholder.

## Decisiones tomadas

- **Solo portfolio.** Nada de pagos reales, cuentas de usuario ni panel admin.
- **Referencia: clubbasico.com** (Tiendanube). De ahí salen el concepto (básicos de hombre,
  "prendas simples, bien hechas"), la estructura de tienda y el tono en voseo directo. El diseño
  va más minimalista que la referencia, que es bastante promocional (3×2, % OFF, liquidación).
  No se copian textos, imágenes ni marca.
- **Imágenes de producto: ilustraciones SVG generadas por código**, coloreadas con el color de la
  variante. Un básico es la misma prenda en N colores; con fotos de stock el color elegido nunca
  coincide con la foto. Costo aceptado: se ve menos "real" que una foto.
- **El checkout no pide datos de tarjeta.** Se elige el medio de pago y se simula. Un sitio
  público con campos de tarjeta invita a que alguien cargue una real.
- **Vitest en vez de Jest**, a propósito: es el estándar en Vite, con la misma API. Mismo criterio
  que `horas-crean` y `sinfalta-landing`.
- **React Router en modo data** y no declarativo: `ScrollRestoration` solo funciona así, y volver
  al catálogo en la misma posición de scroll es parte de la experiencia de compra.
- **Node 24 solo en este proyecto.** El `default` de nvm quedó en 22.11.0 para no afectar a los
  otros proyectos. Correr `nvm use` antes de cualquier comando de npm.
- **Sin `.env.example`**: no hay variables de entorno. Se crea cuando aparezca la primera.

## Skills

- Construcción: `frontend-design` (dirección visual) + `tdd` (lógica: catálogo, precios, carrito,
  validación del checkout).
- Pasada final: `ui-ux-pro-max` (checklist de UX y accesibilidad) + `seo` (title, meta y Open
  Graph para la preview del link).

## Próximos pasos

1. Plan de diseño con `frontend-design` (paleta, tipografía, layout) → aprobación de Tom.
2. Lógica con TDD: catálogo, precios y envío, carrito, validación del checkout.
3. Componentes y páginas: home, catálogo, producto, carrito, 404.
4. Checkout simulado + confirmación.
5. Revisión final con `ui-ux-pro-max` + `seo`.
6. Repo en GitHub (cuenta `tomasgaitan14`, **preguntar público o privado**) y deploy en Vercel
   (cuenta `tomasgaitans-projects`), con el checklist pre-deploy del CLAUDE.md global.

## Archivos clave

- `vite.config.ts` — plugins de React y Tailwind + configuración de Vitest (jsdom, `tests/`).
- `.nvmrc` — Node 24.
- `src/main.tsx` — punto de entrada.

## Notas / contexto extra

- Las pruebas en navegador van por Claude in Chrome, nunca Playwright (regla global).
