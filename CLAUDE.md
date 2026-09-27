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
| Deploy | Vercel, proyecto `tiendabasicosecommerce` en el equipo `tomasg-projects`, conectado a GitHub: cada push a `main` deploya |

Dependencias de runtime: solo `react`, `react-dom` y `react-router`.

## Proyectos relacionados

Ninguno. No tiene backend, flujos de n8n ni base de datos.

## Estado actual

Tienda completa (2026-09-27): portada, catálogo por categoría con orden,
ficha de producto, carrito lateral, checkout simulado, confirmación y 404. Build y lint limpios.
Revisada en Chrome en escritorio y en 375, 390, 768 y 1024 px.

Pasada final hecha (2026-09-27) con `ui-ux-pro-max` (zonas táctiles, foco, formularios) y `seo`
(preview del link). 135 tests en verde (lógica + flujos de UI), sumando Google Tag Manager.

**En producción desde el 2026-09-27:** https://tiendabasicosecommerce.vercel.app
Repo público: https://github.com/tomasgaitan14/ecommerce-basicos (cuenta `tomasgaitan14`).

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
- **Una sola variable de entorno, opcional: `SITE_URL`** (ver `.env.example`). Las etiquetas Open
  Graph necesitan URLs absolutas; `vite/siteUrl.ts` las resuelve al compilar: `SITE_URL`, si no
  `VERCEL_PROJECT_PRODUCTION_URL` (Vercel la expone sola) y si no localhost. Una `SITE_URL` mal
  escrita corta el build.
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
- **`noindex` a propósito.** Es una tienda ficticia con precios y checkout: que no aparezca en
  Google como si vendiera. La preview del link (Open Graph) no depende de eso. Por lo mismo no hay
  sitemap, datos estructurados ni canonical. Para indexarla, sacar la meta `robots` de `index.html`.
- **Preview del link:** `public/og.png` (1200×630) reproduce la portada con los mismos trazados y
  colores. Se generó con un script fuera del repo (Quick Look de macOS): si cambian el título o los
  colores de la remera clásica, hay que regenerarla.
- **Zonas táctiles** (pasada con `ui-ux-pro-max`, medidas en Chrome a 390 px): 44 px en controles,
  links sueltos (`text-action`) y botones de cantidad; nada por debajo de 24 px (WCAG 2.2 AA).
  Excepción consciente: las muestras de color de las tarjetas miden 28 px, porque ocho de 44 px no
  entran en una tarjeta de mobile.
- **Tarjetas de producto y líneas del carrito: un solo link** cuyo `::after` cubre toda la
  superficie. Las muestras de color, la cantidad y "Quitar" quedan encima con `z-1` (no `z-10`:
  pisarían el encabezado fijo al scrollear).
- **Texto de 15 px, campos de 16 px:** con menos de 16 px, Safari de iOS hace zoom al enfocar.
- **Checkout:** valida cada campo al salir si tiene datos; los obligatorios vacíos se avisan al enviar.
- **Repo público con el mail `noreply` de GitHub** (`54362598+tomasgaitan14@users.noreply.github.com`,
  configurado en este repo). Antes del primer push se reescribió el historial para que no quedara el
  mail personal en ningún commit; los mails de prueba usan `@example.com`, dominio reservado.
- **`vercel.json` explícito:** framework, comando de build y carpeta `dist`. El proyecto se creó con
  la CLI (`vercel project add`) sin preset y buscaba `build`: el primer deploy falló por eso.
  También hace el rewrite de la SPA a `index.html`, suma `nosniff` y `Referrer-Policy`, y da caché
  inmutable a `/assets` (los nombres llevan hash). Node 24 queda fijado con `engines` en `package.json`.
- **Google Tag Manager (`GTM-5FZ7G4WN`) solo en producción:** `vite/gtm.ts` inyecta el snippet
  oficial al compilar cuando `VERCEL_ENV=production`. Local y previews no lo cargan, para no
  mezclar visitas de prueba con las reales; se prueba con Tag Assistant sobre el sitio en vivo.
  Solo el contenedor, sin eventos de e-commerce en el `dataLayer` (decisión de Tom, se pueden sumar
  después). La app no recarga entre páginas: para contar visitas por ruta, en GA4 usar la medición
  mejorada de cambios de historial o el activador "History Change" de GTM.
- **ScrollRestoration con `getKey`:** en cargas iniciales la clave es la URL. Sin eso, abrir una
  URL desde la barra de direcciones heredaba el scroll guardado de otra página (bug real visto en Chrome).

## Skills

- Construcción: `frontend-design` (dirección visual) + `tdd` (lógica: catálogo, precios, carrito,
  validación del checkout).
- Pasada final: `ui-ux-pro-max` (checklist de UX y accesibilidad) + `seo` (title, meta y Open
  Graph para la preview del link).

## Próximos pasos

Nada pendiente del alcance acordado. Si se suma un dominio propio, definir `SITE_URL` en Vercel
para que la preview del link use ese dominio.

## Archivos clave

- `src/data/` — catálogo (`products.ts`), colores, categorías, dibujos (`garments.ts`), guías de
  talles, provincias y contenido de la portada. Los tests de integridad viven en `tests/catalog.test.ts`.
- `src/lib/` — lógica pura: `catalog`, `pricing` (envío gratis desde $150.000, 3 cuotas), `cart`
  (reducer), `cartStorage` (localStorage), `checkout` (validación + pedido), `garmentInk`.
- `src/context/` — `CartProvider` (estado + persistencia) y `useCart`.
- `src/components/` y `src/pages/` — interfaz. `src/routes.tsx` define las rutas; `src/paths.ts`, las URLs.
- `src/index.css` — tokens de diseño, roles tipográficos y utilidades (`button-primary`, `text-action`, `drawer`).
- `tests/` — Vitest. `tests/ui/` monta la app completa con `tests/support/renderApp.tsx`.
- `vite.config.ts` — plugins de React y Tailwind, completa `%SITE_URL%` en `index.html` y configura
  Vitest (jsdom, `tests/setup.ts`).
- `vite/siteUrl.ts` — resuelve la URL pública al compilar (se testea en `tests/siteUrl.test.ts`).
- `vite/gtm.ts` — snippet de Google Tag Manager, solo en producción (se testea en `tests/gtm.test.ts`).
- `vercel.json` — build, rewrite de la SPA y headers para Vercel.
- `index.html` — title, meta, Open Graph y `noindex`. `public/` — favicon, ícono de iOS, `og.png` y `robots.txt`.
- `.nvmrc` — Node 24.

## Notas / contexto extra

- Las pruebas en navegador van por Claude in Chrome, nunca Playwright (regla global).
