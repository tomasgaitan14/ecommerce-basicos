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
| Analytics | Google Tag Manager → GA4. La app solo deja eventos en el `dataLayer`; etiquetas y destino se configuran en el contenedor |
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
(preview del link). 145 tests en verde (lógica + flujos de UI).

Analytics en producción desde el 2026-09-27, armado por partes: GTM (`GTM-KQT4NCMT`, versión 2
publicada) manda a GA4 (`G-L4T9WL46PD`) un `page_view` por página. Verificado en producción y en
GA4 → Tiempo real. Faltan los eventos de ecommerce y las interacciones (ver Próximos pasos).

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
- **Dos variables de entorno, las dos opcionales** (ver `.env.example`):
  - `SITE_URL`: las etiquetas Open Graph necesitan URLs absolutas; `vite/siteUrl.ts` las resuelve al
    compilar: `SITE_URL`, si no `VERCEL_PROJECT_PRODUCTION_URL` (Vercel la expone sola) y si no
    localhost. Una `SITE_URL` mal escrita corta el build.
  - `GTM_ID`: sin ella no se carga GTM, así local, las previews y los tests no mandan datos. En Vercel
    está solo en Production. Para probar GTM en local, en `.env.local`, y borrarla al terminar: con el
    contenedor publicado, cada `npm run dev` manda visitas reales a GA4. `vite/gtm.ts` la valida (un
    ID de GA4 pegado por error corta el build) e inyecta el snippet al principio del `<head>`, sin el
    `<noscript>`: la tienda no funciona sin JavaScript.
- **Analytics: GTM → GA4, armado por partes.** Contenedor `GTM-KQT4NCMT`; la etiqueta de GA4
  (`G-L4T9WL46PD`) y qué se manda viven en el contenedor, no en el código. La app solo deja eventos en
  el `dataLayer` (`src/lib/analytics.ts`). Un primer intento (ID fijo en el código, solo el
  contenedor) se borró a propósito, con sus cuentas, para rehacerlo desde cero (revert `3a49b75`).
- **`page_view` propio, uno por página** (`Layout`): cambiar el color (`?color`) o el orden
  (`?orden`) cambia la URL pero no es otra página. Por eso en GA4 están apagadas las page views
  automáticas por cambios del historial (medición mejorada): si se prenden, se cuentan dobles. En
  desarrollo StrictMode corre los efectos dos veces; una ref evita contar dos veces la misma página.
- **Contenedor GTM:** variable constante `GA4 - ID de medición` (el ID en un solo lugar), variables de
  capa de datos `DLV - page_location` y `DLV - page_title`, activador `CE - page_view` y etiquetas
  `GA4 - Etiqueta de Google` (`send_page_view=false`, en Initialization - All Pages) y
  `GA4 - page_view`. La versión 1 es el contenedor vacío: republicarla es el rollback.
- **GA4:** zona horaria Argentina, pesos, retención de datos de 14 meses. En la medición mejorada
  quedan scroll, clics de salida y descargas; las interacciones con formularios están apagadas
  (contaban como envío cada intento fallido del checkout).
- **Probar GTM:** con la Vista previa (Tag Assistant) en Chrome sin bloqueadores. Los bloqueadores de
  trackers (Brave Shields, uBlock) frenan `gtm.js` y `/g/collect`, y Tag Assistant dice "no se ha
  encontrado" aunque el snippet esté bien. Tag Assistant muestra el `page_view` propio como "Cambio
  en el historial". Los hits se confirman en GA4 (DebugView o Tiempo real): la pestaña de red de la
  extensión muestra 503 en `/g/collect` aunque lleguen.
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
- **ScrollRestoration con `getKey`:** en cargas iniciales la clave es la URL. Sin eso, abrir una
  URL desde la barra de direcciones heredaba el scroll guardado de otra página (bug real visto en Chrome).

## Skills

- Construcción: `frontend-design` (dirección visual) + `tdd` (lógica: catálogo, precios, carrito,
  validación del checkout).
- Pasada final: `ui-ux-pro-max` (checklist de UX y accesibilidad) + `seo` (title, meta y Open
  Graph para la preview del link).

## Próximos pasos

Analytics, por partes y con el OK de Tom en cada una:

1. Eventos de ecommerce de GA4: listas, ficha, carrito, checkout y compra. Antes, decidir si se mide
   `purchase` con los pedidos de prueba y cómo se nombran las listas (catálogo, "Un placard
   resuelto", "Combinalo con").
2. Interacciones: color, guía de talles, orden del catálogo y errores al agregar o en el checkout.
3. Plan de medición documentado y export del contenedor al repo.

Si se suma un dominio propio, definir `SITE_URL` en Vercel para que la preview del link use ese dominio.

## Archivos clave

- `src/data/` — catálogo (`products.ts`), colores, categorías, dibujos (`garments.ts`), guías de
  talles, provincias y contenido de la portada. Los tests de integridad viven en `tests/catalog.test.ts`.
- `src/lib/` — lógica pura: `catalog`, `pricing` (envío gratis desde $150.000, 3 cuotas), `cart`
  (reducer), `cartStorage` (localStorage), `checkout` (validación + pedido), `garmentInk`,
  `analytics` (eventos para el `dataLayer` de GTM).
- `src/context/` — `CartProvider` (estado + persistencia) y `useCart`.
- `src/components/` y `src/pages/` — interfaz. `src/routes.tsx` define las rutas; `src/paths.ts`, las URLs.
- `src/index.css` — tokens de diseño, roles tipográficos y utilidades (`button-primary`, `text-action`, `drawer`).
- `tests/` — Vitest. `tests/ui/` monta la app completa con `tests/support/renderApp.tsx`.
- `vite.config.ts` — plugins de React y Tailwind, completa `%SITE_URL%` en `index.html`, inyecta GTM
  si hay `GTM_ID` y configura Vitest (jsdom, `tests/setup.ts`).
- `vite/siteUrl.ts` — resuelve la URL pública al compilar (se testea en `tests/siteUrl.test.ts`).
- `vite/gtm.ts` — valida `GTM_ID` y arma el snippet de GTM (se testea en `tests/gtm.test.ts`).
- `vercel.json` — build, rewrite de la SPA y headers para Vercel.
- `index.html` — title, meta, Open Graph y `noindex`. `public/` — favicon, ícono de iOS, `og.png` y `robots.txt`.
- `.nvmrc` — Node 24.

## Notas / contexto extra

- Las pruebas en navegador van por Claude in Chrome, nunca Playwright (regla global).
