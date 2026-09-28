# Plan de medición

Qué mide la tienda, para qué sirve cada evento y cómo se prueba o se suma uno nuevo. La configuración
vive en las cuentas de Google Tag Manager y Google Analytics; el export del contenedor está en
[`gtm-container.json`](gtm-container.json).

## Cómo funciona

```
App (React) ──▶ dataLayer ──▶ GTM (GTM-KQT4NCMT) ──▶ GA4 (G-L4T9WL46PD)
```

- La app solo deja eventos en el `dataLayer` (`src/lib/analytics.ts`). Qué se manda y a dónde se
  decide en GTM, sin tocar código.
- GTM se carga solo si el build tiene `GTM_ID`. En Vercel está solo en Production: local, las
  previews y los tests no mandan datos.
- GTM guarda los valores del `dataLayer` entre eventos. Por eso, antes de cada evento de ecommerce la
  app manda `{ ecommerce: null }`, y antes de cada interacción, `{ interaction: null }`. Si no, un
  evento heredaría los productos o los parámetros del anterior.
- Nunca se mandan datos personales: ni email, nombre, teléfono o dirección, ni lo que se escribe en
  el checkout. Hay tests que lo verifican.

## Qué preguntas responde

| Pregunta | Eventos |
|---|---|
| ¿Cuánta gente entra y qué páginas mira? | `page_view` |
| ¿Dónde se cae la compra? | `view_item` → `add_to_cart` → `begin_checkout` → `purchase` |
| ¿Qué productos, colores y talles se venden? | `purchase`, con `item_variant` (color) e `item_size` (talle) |
| ¿Qué lista lleva más gente a los productos? | `view_item_list` y `select_item`, por lista |
| ¿Por qué no se puede agregar al carrito? | `add_to_cart_error` (`reason`) |
| ¿Qué campos del checkout fallan? | `checkout_error` (`error_fields`) |
| ¿Qué colores se miran sin entrar al producto? | `select_color` con `location=tarjeta` |
| ¿Se usa la guía de talles? | `view_size_guide` |
| ¿Se ordena el catálogo por precio? | `sort_catalog` |

## Eventos

### Visitas

| Evento | Cuándo | Dónde | Parámetros |
|---|---|---|---|
| `page_view` | Cambia la página. Cambiar `?color` u `?orden` no cuenta como otra página | `Layout` | `page_location`, `page_title` |

### Ecommerce (formato recomendado de GA4)

| Evento | Cuándo | Dónde | Datos |
|---|---|---|---|
| `view_item_list` | Se ve una lista de productos | `CatalogPage`, `HomePage`, `ProductPage` | `item_list_id`, `item_list_name` e ítems con `index` |
| `select_item` | Clic en una tarjeta | `ProductCard` | La lista y el ítem con `index` |
| `view_item` | Se abre una ficha: una vez, con el color con que se abrió | `ProductPage` | `value` (precio) e ítem con color |
| `add_to_cart` | "Agregar al carrito" o "+" en el carrito | `CartProvider` | `value` e ítem con color, talle y cantidad |
| `remove_from_cart` | "−" o "Quitar" | `CartProvider` | Lo mismo, con lo que se sacó |
| `view_cart` | La persona abre el carrito desde el encabezado y tiene productos | `CartProvider` | `value` (subtotal) e ítems |
| `begin_checkout` | Se entra al checkout con productos | `CheckoutPage` | `value` (subtotal) e ítems |
| `purchase` | Se confirma el pedido: en el submit, una sola vez | `CheckoutPage` | `transaction_id` (número de pedido), `value` (subtotal), `shipping` e ítems |

- **Listas:** `tienda` ("Toda la tienda"), `tienda-<categoría>` (una por categoría), `placard`
  ("Un placard resuelto", en la portada) y `combinalo-con` (en la ficha). Los nombres están fijos en
  `ITEM_LISTS`: si cambia el texto de la página, los informes no se cortan.
- **Ítems:** `item_id` (slug), `item_name`, `item_brand` (`basicos`), `item_category` (nombre de la
  categoría) y `price`; según el evento, `item_variant` (color), `item_size` (talle), `quantity` e
  `index`.
- **Carrito:** las cantidades se miden contra el estado real: si la línea llega al tope (el stock o
  10 unidades), se mide lo que entró de verdad. Vaciar el carrito después de comprar no es
  `remove_from_cart`.
- **Compras:** son pedidos de prueba, así que GA4 muestra ingresos ficticios. Se miden igual para
  que el embudo cierre.
- **`view_cart`:** el carrito que se abre solo al agregar no cuenta; eso ya es `add_to_cart`.

### Interacciones (eventos propios)

Los parámetros van dentro de `interaction` y sus valores están en español.

| Evento | Cuándo | Dónde | Parámetros |
|---|---|---|---|
| `select_color` | Se cambia el color | `ProductPage`, `ProductCard` | `product_id`, `color`, `location` (`ficha` o `tarjeta`) y, en las tarjetas, `list_id` |
| `view_size_guide` | Se abre la guía de talles | `ProductPage` | `product_id` |
| `add_to_cart_error` | "Agregar al carrito" sin talle o sin stock | `ProductPage` | `product_id`, `reason` (`sin_talle` o `sin_stock`) |
| `sort_catalog` | Se cambia el orden del catálogo | `CatalogPage` | `list_id`, `sort_order` (`destacados`, `precio-asc` o `precio-desc`) |
| `checkout_error` | Se envía el checkout con errores | `CheckoutPage` | `error_fields`: los nombres de los campos, en el orden del formulario |

## GTM (versión 4)

| Tipo | Nombre | Qué hace |
|---|---|---|
| Etiqueta | `GA4 - Etiqueta de Google` | Carga GA4 en todas las páginas, con `send_page_view=false` |
| Etiqueta | `GA4 - page_view` | Manda `page_view` con `page_location` y `page_title` |
| Etiqueta | `GA4 - ecommerce` | Manda `{{Event}}` con los datos de ecommerce de la capa de datos |
| Etiqueta | `GA4 - interacciones` | Manda `{{Event}}` con los 7 parámetros de `interaction`; los que el evento no trae no se mandan |
| Activador | `CE - page_view` | Evento `page_view` |
| Activador | `CE - ecommerce` | Regex con los 8 eventos de ecommerce |
| Activador | `CE - interacciones` | Regex con las 5 interacciones |
| Variable | `GA4 - ID de medición` | Constante con `G-L4T9WL46PD` |
| Variables | `DLV - page_location`, `DLV - page_title` y `DLV - interaction.*` | Leen el `dataLayer` |

Para volver atrás: en GTM, **Versiones**, republicar la versión anterior. La versión 1 es el
contenedor vacío.

## GA4

- Propiedad "Basicos Tienda", flujo web "Basicos web" (`G-L4T9WL46PD`): zona horaria Argentina,
  pesos y retención de datos de 14 meses.
- Medición mejorada: quedan scroll, clics de salida, búsqueda en el sitio, videos y descargas (la
  tienda no tiene buscador ni videos, así que esas dos no disparan nada). Las interacciones con
  formularios están apagadas: contaban como envío cada intento fallido del checkout.
- Las page views automáticas están apagadas: la de la carga, con `send_page_view=false` en la
  etiqueta de Google, y las de cambios del historial, en la medición mejorada. Las manda la app.
- `purchase` es key event por defecto.
- Dimensiones personalizadas:

| Dimensión | Ámbito | Parámetro |
|---|---|---|
| Talle | Ítem | `item_size` |
| Producto | Evento | `product_id` |
| Color | Evento | `color` |
| Ubicación | Evento | `location` |
| Lista | Evento | `list_id` |
| Motivo | Evento | `reason` |
| Orden | Evento | `sort_order` |
| Campos con error | Evento | `error_fields` |

## Cómo probar

1. Crear `.env.local` con `GTM_ID=GTM-KQT4NCMT` y correr `npm run dev`.
2. En GTM, **Vista previa** con `http://localhost:5173`.
3. Usar Chrome sin bloqueadores de trackers: Brave Shields o uBlock frenan `gtm.js` y `/g/collect`, y
   Tag Assistant dice "no se ha encontrado" aunque el snippet esté bien.
4. Confirmar en GA4 → **Tiempo real**. DebugView a veces tarda en mostrar el dispositivo, y la pestaña
   de red de algunas extensiones marca 503 en `/g/collect` aunque los hits lleguen.
5. Borrar `.env.local` al terminar: con el contenedor publicado, cada `npm run dev` manda visitas
   reales a GA4.

Tag Assistant muestra el `page_view` como "Cambio en el historial" y los `{ ecommerce: null }` y
`{ interaction: null }` como "Mensaje".

## Cómo sumar un evento

1. En `src/lib/analytics.ts`: el nombre en `ANALYTICS_EVENTS`, el tipo y la función que lo arma, con
   su test.
2. Llamarlo desde el componente con `pushToDataLayer`, o con `useTrackOnce` si es "una vez por página".
3. En GTM: sumarlo a la regex del activador que corresponda y, si trae parámetros nuevos, crear la
   variable `DLV - interaction.<parámetro>` y sumar el parámetro a la etiqueta.
4. En GA4: una dimensión personalizada por cada parámetro nuevo.
5. Probar con la Vista previa, publicar el contenedor, deployar y verificar en Tiempo real.
6. Actualizar este plan y el export del contenedor.

## Comportamientos conocidos

- En cada página, los eventos de ecommerce salen antes que el `page_view`, porque React corre primero
  los efectos de los componentes hijos. No afecta los datos: cada hit lleva la URL y el título.
- Fuera de la Vista previa, GA4 junta varios eventos en un solo envío.
- Las dimensiones personalizadas no son retroactivas: aparecen con los datos nuevos.
- Quien navega con bloqueadores de trackers no se mide.
