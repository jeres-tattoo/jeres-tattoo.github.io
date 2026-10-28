// Lectura de fotos para los lienzos: carga, mapa de tinta y utilidades de animación.

// decode() decodifica fuera del hilo principal; si el navegador la rechaza, basta con que cargue.
export function loaded(image) {
    const onload = () => new Promise((resolve, reject) => {
        if (image.complete && image.naturalWidth) return resolve();
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', reject, { once: true });
    });
    return image.decode ? image.decode().catch(onload) : onload();
}

export function boxBlur(src, w, h, r) {
    const tmp = new Float32Array(src.length);
    const out = new Float32Array(src.length);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let sum = 0;
            let n = 0;
            for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) { sum += src[y * w + k]; n++; }
            tmp[y * w + x] = sum / n;
        }
    }
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let sum = 0;
            let n = 0;
            for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) { sum += tmp[k * w + x]; n++; }
            out[y * w + x] = sum / n;
        }
    }
    return out;
}

export const clamp = (v) => Math.min(1, Math.max(0, v));
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// Mapa de tinta de un recorte de la foto, a `width` columnas: 1 donde la aguja ha dejado más negro que
// la piel de alrededor, 0 en la piel limpia. `edge` apaga los bordes en elipse para que la figura flote.
export function inkMap(image, crop, width) {
    const w = width;
    const h = Math.round(w * (crop.h * image.naturalHeight) / (crop.w * image.naturalWidth));
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d', { willReadFrequently: true });
    octx.drawImage(
        image,
        crop.x * image.naturalWidth, crop.y * image.naturalHeight,
        crop.w * image.naturalWidth, crop.h * image.naturalHeight,
        0, 0, w, h,
    );
    const data = octx.getImageData(0, 0, w, h).data;

    const lum = new Float32Array(w * h);
    for (let i = 0; i < lum.length; i++) {
        lum[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
    }
    // Cada foto tiene su luz: la piel se mide con la propia foto, no con un valor fijo.
    const skin = [...lum].sort((a, b) => a - b)[Math.floor(lum.length * 0.6)];
    const mean = boxBlur(lum, w, h, Math.round(w / 20));

    const ink = new Float32Array(w * h);
    const edge = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = y * w + x;
            edge[i] = 1 - smooth(0.7, 1, Math.hypot((x / w - 0.5) * 2, (y / h - 0.5) * 2));
            ink[i] = clamp((mean[i] - lum[i]) * 4 + (skin - lum[i]) * 1.8) * edge[i];
        }
    }
    return { w, h, lum, ink, edge };
}

// Encaja un dibujo de w×h en el lienzo, centrado y con aire alrededor.
export function contain(w, h, width, height, pad = 0.04) {
    const scale = Math.min((width * (1 - pad * 2)) / w, (height * (1 - pad * 2)) / h);
    return { scale, left: (width - w * scale) / 2, top: (height - h * scale) / 2 };
}
