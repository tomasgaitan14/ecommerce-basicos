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

Tienda completa y funcionando en local (2026-09-27): portada, catálogo por categoría con orden,
ficha de producto, carrito lateral, checkout simulado, confirmación y 404. 118 tests en verde
(lógica + flujos de UI), build y lint limpios. Revisada en Chrome en escritorio y a 390 px.

**Sin deploy y sin remoto de git todavía.** Commits locales: scaffold, lógica, UI y docs. El repo usa la identidad personal con el mail noreply de GitHub, no la global de trabajo.

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
- **Dirección visual** (plan aprobado con `frontend-design`): el único color de la página es el de
  la ropa; la interfaz es blanco, negro y gris "lona". Tipografía Archivo (una sola familia, el
  ancho variable separa marca y títulos del resto), servida desde `src/assets/fonts` (OFL).
  Tailwind solo expone los tokens de marca (`--color-*: initial` en `index.css`).
- **Portada:** la remera clásica en sus 8 colores. El título se escala con container queries
  (`12cqi`): "Todo combina." mide 8,06 em, medido en Chrome, y así entra en dos líneas en cualquier ancho.
- **Dibujos:** 14 geometrales en `src/data/garments.ts` (varios productos comparten dibujo). Las
  líneas se adaptan al color de la prenda (`lib/garmentInk.ts`); el gris melange lleva textura.
- **Color destacado** = primer color de cada producto, alternado a propósito para que la grilla
  no sea toda negra. La remera clásica mantiene su orden porque es el de la franja de portada.
- **Stock:** 12 unidades por variante salvo excepciones cargadas a mano (agotados y últimas
  unidades para mostrar esos estados). Una excepción con clave mal escrita corta la carga.
- **`<dialog>` nativo** para el carrito y la guía de talles (foco, Escape y fondo inerte gratis).
  jsdom no implementa `showModal()`: se completa en `tests/setup.ts`; el foco y Escape se
  verifican en Chrome.
- **ScrollRestoration con `getKey`:** en cargas iniciales la clave es la URL. Sin eso, abrir una
  URL desde la barra de direcciones heredaba el scroll guardado de otra página (bug real visto en Chrome).

## Skills

- Construcción: `frontend-design` (dirección visual) + `tdd` (lógica: catálogo, precios, carrito,
  validación del checkout).
- Pasada final: `ui-ux-pro-max` (checklist de UX y accesibilidad) + `seo` (title, meta y Open
  Graph para la preview del link).

## Próximos pasos

1. Revisión final con `ui-ux-pro-max` (checklist de UX y accesibilidad) + `seo` (title, meta y
   Open Graph para la preview del link).
2. Repo en GitHub (cuenta `tomasgaitan14`, **preguntar público o privado**) y deploy en Vercel
   (cuenta `tomasgaitans-projects`), con el checklist pre-deploy del CLAUDE.md global. Es una SPA:
   Vercel necesita un rewrite de todas las rutas a `index.html` para que los links directos funcionen.

## Archivos clave

- `src/data/` — catálogo (`products.ts`), colores, categorías, dibujos (`garments.ts`), guías de
  talles, provincias y contenido de la portada. Los tests de integridad viven en `tests/catalog.test.ts`.
- `src/lib/` — lógica pura: `catalog`, `pricing` (envío gratis desde $150.000, 3 cuotas), `cart`
  (reducer), `cartStorage` (localStorage), `checkout` (validación + pedido), `garmentInk`.
- `src/context/` — `CartProvider` (estado + persistencia) y `useCart`.
- `src/components/` y `src/pages/` — interfaz. `src/routes.tsx` define las rutas; `src/paths.ts`, las URLs.
- `src/index.css` — tokens de diseño, roles tipográficos y utilidades (`button-primary`, `drawer`).
- `tests/` — Vitest. `tests/ui/` monta la app completa con `tests/support/renderApp.tsx`.
- `vite.config.ts` — plugins de React y Tailwind + configuración de Vitest (jsdom, `tests/setup.ts`).
- `.nvmrc` — Node 24.

## Notas / contexto extra

- Las pruebas en navegador van por Claude in Chrome, nunca Playwright (regla global).
