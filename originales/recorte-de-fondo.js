const sharp = require('C:/Users/dukes/AppData/Roaming/npm/node_modules/netlify-cli/node_modules/sharp');

const ORIGEN = 'C:/Users/dukes/Desktop/CLINICA VETERINARIA ISERN/vetmove.7.jpeg';
const DESTINO = 'C:/Users/dukes/Desktop/CLINICA VETERINARIA ISERN/img/mascotas-fundadora.jpg';

// Verde de marca: --teal #0E7B76
const VERDE = [0x0E, 0x7B, 0x76];
const UMBRAL = 18;   // luminancia por debajo de la cual se considera fondo
const SUAVE = 1.2;   // desenfoque del borde, en píxeles

(async () => {
  const { data, info } = await sharp(ORIGEN).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;

  const lum = i => 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

  // --- Relleno por inundación desde los bordes ---
  // Solo se marca como fondo el negro conectado con el exterior, así que
  // los negros interiores (hocicos, pupilas, sombras del pelo) se conservan.
  const fondo = new Uint8Array(W * H);
  const cola = new Int32Array(W * H);
  let ini = 0, fin = 0;

  const empujar = i => { if (!fondo[i] && lum(i) < UMBRAL) { fondo[i] = 1; cola[fin++] = i; } };

  for (let x = 0; x < W; x++) { empujar(x); empujar((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { empujar(y * W); empujar(y * W + W - 1); }

  while (ini < fin) {
    const i = cola[ini++];
    const x = i % W, y = (i / W) | 0;
    if (x > 0) empujar(i - 1);
    if (x < W - 1) empujar(i + 1);
    if (y > 0) empujar(i - W);
    if (y < H - 1) empujar(i + W);
  }

  let nFondo = 0;
  for (let i = 0; i < W * H; i++) if (fondo[i]) nFondo++;
  console.log(`Fondo detectado: ${(100 * nFondo / (W * H)).toFixed(1)}% de la imagen`);

  // --- Suavizar el borde de la máscara ---
  const mascara = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) mascara[i] = fondo[i] ? 255 : 0;

  // Ojo: al desenfocar, sharp devuelve la máscara en 3 canales aunque
  // entre con 1. Hay que leerla con su paso real, no de byte en byte.
  const desenf = await sharp(mascara, { raw: { width: W, height: H, channels: 1 } })
    .blur(SUAVE).raw().toBuffer({ resolveWithObject: true });
  const paso = desenf.info.channels;
  const suave = desenf.data;
  console.log(`Máscara desenfocada: ${desenf.info.width}x${desenf.info.height}, ${paso} canal(es)`);

  // --- Recomposición ---
  // La foto está sobre negro puro, así que equivale a color premultiplicado:
  //   pixel = sujeto * cobertura
  // Por tanto basta sumar el verde por la parte no cubierta. Así no queda
  // el halo oscuro típico de recortar sobre fondo negro.
  const salida = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    const f = suave[i * paso] / 255;
    for (let c = 0; c < 3; c++) {
      const v = data[i * C + c] + VERDE[c] * f;
      salida[i * 3 + c] = v > 255 ? 255 : v;
    }
  }

  await sharp(salida, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(DESTINO);

  const m = await sharp(DESTINO).metadata();
  const fs = require('fs');
  console.log(`Guardada: ${m.width} x ${m.height}, ${Math.round(fs.statSync(DESTINO).size / 1024)} KB`);
})();
