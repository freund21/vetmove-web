const sharp = require('C:/Users/dukes/AppData/Roaming/npm/node_modules/netlify-cli/node_modules/sharp');
const fs = require('fs');

const BASE = 'C:/Users/dukes/Desktop/CLINICA VETERINARIA ISERN/';
const ORIGEN = BASE + 'originales/mascotas-fundadora-fondo-negro.jpeg';
const DESTINO = BASE + 'img/mascotas-fundadora.jpg';

const UMBRAL = 18;
const SUAVE = 1.2;

// Sombra de apoyo
const SOMBRA_DESPL = 16;    // cuánto baja respecto al animal
const SOMBRA_DIFUM = 34;    // difuminado
const SOMBRA_FUERZA = 0.30; // 0 = nada, 1 = negro

(async () => {
  const { data, info } = await sharp(ORIGEN).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const lum = i => 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

  // ---------- 1. Máscara del fondo por inundación ----------
  const fondo = new Uint8Array(W * H);
  const cola = new Int32Array(W * H);
  let ini = 0, fin = 0;
  const empujar = i => { if (!fondo[i] && lum(i) < UMBRAL) { fondo[i] = 1; cola[fin++] = i; } };
  for (let x = 0; x < W; x++) { empujar(x); empujar((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { empujar(y * W); empujar(y * W + W - 1); }
  while (ini < fin) {
    const i = cola[ini++], x = i % W, y = (i / W) | 0;
    if (x > 0) empujar(i - 1);
    if (x < W - 1) empujar(i + 1);
    if (y > 0) empujar(i - W);
    if (y < H - 1) empujar(i + W);
  }

  const mascara = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) mascara[i] = fondo[i] ? 255 : 0;
  const des = await sharp(mascara, { raw: { width: W, height: H, channels: 1 } })
    .blur(SUAVE).raw().toBuffer({ resolveWithObject: true });
  const paso = des.info.channels, suave = des.data;

  // ---------- 2. Fondo de estudio: degradado cálido de la marca ----------
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="g" cx="50%" cy="42%" r="78%">
        <stop offset="0%"   stop-color="#FDFBF7"/>
        <stop offset="55%"  stop-color="#F6F2EA"/>
        <stop offset="100%" stop-color="#E6DCCC"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
  </svg>`;
  const grad = await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer();

  // ---------- 3. Sombra de apoyo ----------
  // Se parte de la silueta, se baja y se difumina mucho.
  const silueta = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) silueta[i] = fondo[i] ? 0 : 255;

  const desplazada = Buffer.alloc(W * H);
  for (let y = 0; y < H; y++) {
    const orig = y - SOMBRA_DESPL;
    if (orig < 0) continue;
    silueta.copy(desplazada, y * W, orig * W, orig * W + W);
  }
  const sb = await sharp(desplazada, { raw: { width: W, height: H, channels: 1 } })
    .blur(SOMBRA_DIFUM).raw().toBuffer({ resolveWithObject: true });
  const pasoS = sb.info.channels, sombra = sb.data;

  // ---------- 4. Composición ----------
  const salida = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    const cobertura = 1 - suave[i * paso] / 255;      // 1 = animal
    const s = (sombra[i * pasoS] / 255) * SOMBRA_FUERZA * (1 - cobertura);
    for (let c = 0; c < 3; c++) {
      const bg = grad[i * 3 + c] * (1 - s);           // fondo oscurecido por la sombra
      const v = data[i * C + c] + bg * (1 - cobertura);
      salida[i * 3 + c] = v > 255 ? 255 : v;
    }
  }

  await sharp(salida, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 90, mozjpeg: true }).toFile(DESTINO);

  console.log(`Guardada: ${W}x${H}, ${Math.round(fs.statSync(DESTINO).size / 1024)} KB`);
})();
