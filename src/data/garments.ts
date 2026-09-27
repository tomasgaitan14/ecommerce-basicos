// Geometrales: dibujos planos de frente de cada prenda, a ~3 px por cm, centrados en x = 200.
// El cuerpo y las piezas superpuestas se pintan con el color de la variante; el resto son líneas
// que se adaptan a ese color (ver src/lib/garmentInk.ts).
export interface GarmentDrawing {
  viewBox: readonly [number, number, number, number]
  body: string
  // Piezas encima del cuerpo (cuellos, capucha, presillas): color de la prenda con contorno.
  overlays?: readonly string[]
  // Zonas en sombra, como el interior del cuello.
  shades?: readonly string[]
  // Costuras: línea continua.
  seams?: readonly string[]
  // Pespuntes: línea punteada.
  stitches?: readonly string[]
  // Cordones: línea más gruesa.
  cords?: readonly string[]
  // Detalles rellenos con el color de las líneas, como el tirador del cierre.
  fills?: readonly string[]
  // Botones y ojalillos: [cx, cy, r].
  dots?: readonly (readonly [number, number, number])[]
}

const TEE_BODY =
  'M173 50 L131 65 L73.8 98 L98.8 141.3 L119 124 L119 266 L281 266 L281 124 L301.2 141.3 L326.2 98 L269 65 L227 50 Q200 62 173 50 Z'
const TEE_NECK_SHADE = 'M173 50 Q200 62 227 50 C224 84 176 84 173 50 Z'
const TEE_NECK_RIB = 'M166 52.5 C169 93 231 93 234 52.5'
const TEE_HEM_STITCH = 'M119 259.5 L281 259.5'
const SHORT_SLEEVE_HEMS = ['M80 96.7 L102.5 135.7', 'M320 96.7 L297.5 135.7']
const SET_IN_SLEEVES = ['M131 65 Q126 96 119 124', 'M269 65 Q274 96 281 124']
const LONG_SLEEVE_CUFFS = ['M77.5 230.9 L103 239.5', 'M322.5 230.9 L297 239.5']

const SWEAT_BODY =
  'M170 76 L116 92 L62 268 L93.5 277.7 L126 156 L126 262 L130 283 L270 283 L274 262 L274 156 L306.5 277.7 L338 268 L284 92 L230 76 Q200 88 170 76 Z'
const SWEAT_CUFFS = ['M68.2 247.9 L99.7 257.6', 'M331.8 247.9 L300.3 257.6']
const SWEAT_HEM_RIB = 'M126 262 L274 262'
const DROPPED_SHOULDERS = ['M116 92 Q122 124 126 156', 'M284 92 Q278 124 274 156']

const CHINO_BELT_LOOPS = ['M150 37 L156 37 L156 55 L150 55 Z', 'M244 37 L250 37 L250 55 L244 55 Z']
const CHINO_WAIST_AND_POCKETS = ['M136 52 L264 52', 'M152 52 L131 102', 'M248 52 L269 102']
const CHINO_FLY = 'M206 52 L206 104 Q206 116 198 121'
const CHINO_BUTTON = [200, 46, 2.6] as const

const garments = {
  remera: {
    viewBox: [54, 30, 292, 256],
    body: TEE_BODY,
    shades: [TEE_NECK_SHADE],
    seams: [TEE_NECK_RIB, ...SET_IN_SLEEVES],
    stitches: [...SHORT_SLEEVE_HEMS, TEE_HEM_STITCH],
  },
  remeraMangaLarga: {
    viewBox: [52, 30, 296, 256],
    body: 'M173 50 L131 65 L72 248 L100.5 257.3 L119 124 L119 266 L281 266 L281 124 L299.5 257.3 L328 248 L269 65 L227 50 Q200 62 173 50 Z',
    shades: [TEE_NECK_SHADE],
    seams: [TEE_NECK_RIB, ...SET_IN_SLEEVES, ...LONG_SLEEVE_CUFFS],
    stitches: [TEE_HEM_STITCH],
  },
  musculosa: {
    viewBox: [100, 28, 200, 260],
    body: 'M170 48 L148 52 C146 96 138 128 122 140 L122 268 L278 268 L278 140 C262 128 254 96 252 52 L230 48 Q200 62 170 48 Z',
    shades: ['M170 48 Q200 62 230 48 C229 110 171 110 170 48 Z'],
    seams: [
      'M165 49 C166 118 234 118 235 49',
      'M154 51 C152 100 142 132 122 147',
      'M246 51 C248 100 258 132 278 147',
    ],
    stitches: ['M122 261.5 L278 261.5'],
  },
  chomba: {
    viewBox: [54, 30, 292, 256],
    body: TEE_BODY,
    overlays: ['M175 47 Q190 60 199 75 L184 100 Q168 80 158 60 Z', 'M225 47 Q210 60 201 75 L216 100 Q232 80 242 60 Z'],
    shades: ['M175 47 Q200 56 225 47 L201 75 L199 75 Z'],
    seams: [...SET_IN_SLEEVES, ...SHORT_SLEEVE_HEMS, 'M191 75 L191 140 L209 140 L209 75'],
    stitches: [TEE_HEM_STITCH],
    dots: [
      [200, 92, 2.4],
      [200, 108, 2.4],
      [200, 124, 2.4],
    ],
  },
  camisa: {
    viewBox: [52, 30, 296, 256],
    body: 'M173 50 L131 65 L72 248 L100.5 257.3 L119 124 L119 258 Q140 276 200 276 Q260 276 281 258 L281 124 L299.5 257.3 L328 248 L269 65 L227 50 Q200 62 173 50 Z',
    overlays: ['M176 46 Q189 60 198 76 L181 96 Q166 74 159 57 Z', 'M224 46 Q211 60 202 76 L219 96 Q234 74 241 57 Z'],
    shades: ['M176 46 Q200 55 224 46 L202 76 L198 76 Z'],
    seams: [
      ...SET_IN_SLEEVES,
      ...LONG_SLEEVE_CUFFS,
      'M194 76 L194 275.6',
      'M206 76 L206 275.6',
      'M222 120 L252 120 L252 148 L237 154 L222 148 Z',
    ],
    stitches: ['M222 125 L252 125'],
    dots: [92, 124, 156, 188, 220, 252].map((y) => [200, y, 2.2] as const),
  },
  buzo: {
    viewBox: [42, 56, 316, 244],
    body: SWEAT_BODY,
    shades: ['M170 76 Q200 88 230 76 C226 108 174 108 170 76 Z'],
    seams: ['M163 78 C166 118 234 118 237 78', ...SWEAT_CUFFS, SWEAT_HEM_RIB, ...DROPPED_SHOULDERS],
    stitches: ['M193 110 L200 119 L207 110'],
  },
  buzoCapucha: {
    viewBox: [40, 2, 320, 298],
    body: SWEAT_BODY,
    overlays: ['M148 100 C138 62 156 20 200 18 C244 20 262 62 252 100 L200 126 Z'],
    shades: ['M170 104 C164 70 178 40 200 38 C222 40 236 70 230 104 L200 120 Z'],
    seams: [
      ...SWEAT_CUFFS,
      SWEAT_HEM_RIB,
      ...DROPPED_SHOULDERS,
      'M136 262 L136 236 Q142 206 152 196 L248 196 Q258 206 264 236 L264 262',
    ],
    stitches: ['M140 262 L140 238 Q146 211 155 201 L245 201 Q254 211 260 238 L260 262'],
    cords: ['M186 116 L183 172', 'M214 116 L217 172'],
  },
  campera: {
    viewBox: [42, 56, 316, 244],
    body: SWEAT_BODY,
    shades: ['M170 76 Q200 88 230 76 C226 106 174 106 170 76 Z'],
    seams: [
      'M162 78 C165 122 235 122 238 78',
      ...SWEAT_CUFFS,
      SWEAT_HEM_RIB,
      ...DROPPED_SHOULDERS,
      'M200 99 L200 283',
      'M146 204 L160 236',
      'M150 202 L164 234',
      'M254 204 L240 236',
      'M250 202 L236 234',
    ],
    stitches: ['M195 108 L195 262', 'M205 108 L205 262'],
    fills: ['M197 104 L203 104 L203 118 L197 118 Z'],
  },
  camperaAcolchada: {
    viewBox: [42, 40, 316, 260],
    body: 'M170 76 L116 92 L62 268 L93.5 277.7 L126 156 Q121 220 126 283 L274 283 Q279 220 274 156 L306.5 277.7 L338 268 L284 92 L230 76 Q200 88 170 76 Z',
    overlays: ['M166 88 L168 56 Q200 62 232 56 L234 88 Q200 98 166 88 Z'],
    shades: ['M168 56 Q200 62 232 56 Q200 68 168 56 Z'],
    seams: [
      'M200 62 L200 283',
      'M124 124 L276 124',
      'M125 164 L275 164',
      'M125 204 L275 204',
      'M125 244 L275 244',
      'M97.1 153.6 L122.1 170.6',
      'M86.3 188.8 L113 204.7',
      'M75.5 224 L103.9 238.8',
      'M302.9 153.6 L277.9 170.6',
      'M313.7 188.8 L287 204.7',
      'M324.5 224 L296.1 238.8',
      ...SWEAT_CUFFS,
      ...DROPPED_SHOULDERS,
    ],
    fills: ['M197 66 L203 66 L203 80 L197 80 Z'],
  },
  pantalon: {
    viewBox: [100, 20, 200, 350],
    body: 'M137 40 L263 40 L264 52 C270 70 272 90 272 110 L260 352 L209 352 L202 132 Q200 126 198 132 L191 352 L140 352 L128 110 C128 90 130 70 136 52 Z',
    overlays: CHINO_BELT_LOOPS,
    seams: CHINO_WAIST_AND_POCKETS,
    stitches: [CHINO_FLY, 'M139.7 346 L191.2 346', 'M208.8 346 L260.3 346'],
    dots: [CHINO_BUTTON],
  },
  jogger: {
    viewBox: [100, 22, 200, 346],
    body: 'M143 40 L257 40 L258 58 C268 78 272 96 270 116 L252 326 L250 350 L214 350 L212 326 L203 134 Q200 128 197 134 L188 326 L186 350 L150 350 L148 326 L130 116 C128 96 132 78 142 58 Z',
    seams: [
      'M142 58 L258 58',
      'M150 60 L136 104',
      'M250 60 L264 104',
      'M148 326 L188 326',
      'M212 326 L252 326',
      ...[154, 166, 178, 222, 234, 246].map((x) => `M${x} 43 L${x} 55`),
    ],
    cords: ['M196 50 L190 86', 'M204 50 L210 86'],
    dots: [
      [195, 49, 1.8],
      [205, 49, 1.8],
    ],
  },
  bermuda: {
    viewBox: [104, 17, 192, 193],
    body: 'M137 40 L263 40 L264 52 C270 70 272 90 272 110 L268 190 L204 190 L202 132 Q200 126 198 132 L196 190 L132 190 L128 110 C128 90 130 70 136 52 Z',
    overlays: CHINO_BELT_LOOPS,
    seams: CHINO_WAIST_AND_POCKETS,
    stitches: [CHINO_FLY, 'M132.2 184 L196.4 184', 'M203.6 184 L267.8 184'],
    dots: [CHINO_BUTTON],
  },
  boxer: {
    viewBox: [106, 40, 188, 192],
    body: 'M140 60 L260 60 L262 82 C268 100 270 112 270 128 L268 204 L204 210 L202 168 Q200 160 198 168 L196 210 L132 204 L130 128 C130 112 132 100 138 82 Z',
    seams: ['M138 82 L262 82', 'M182 84 C182 130 194 158 200 162 C206 158 218 130 218 84'],
    stitches: ['M140 66 L260 66', 'M140 76 L260 76', 'M133 198 L196.2 204', 'M203.8 204 L267 198'],
  },
  medias: {
    viewBox: [140, 20, 184, 282],
    body: 'M168 40 L214 40 L214 222 C214 230 222 236 232 236 L276 236 C294 236 300 252 300 262 C300 274 290 282 276 282 L200 282 C178 282 164 268 164 246 Z',
    seams: ['M168 64 L214 64', 'M168 214 C188 220 200 250 206 282', 'M262 236 C254 250 254 270 262 282'],
    stitches: [176, 184, 192, 200, 208].map((x) => `M${x} 43 L${x} 61`),
  },
} satisfies Record<string, GarmentDrawing>

export type GarmentType = keyof typeof garments

export const GARMENTS: Readonly<Record<GarmentType, GarmentDrawing>> = garments
