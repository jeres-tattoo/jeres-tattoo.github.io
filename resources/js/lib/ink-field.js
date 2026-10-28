// Redibuja una foto de tatuaje como un campo de puntos de luz: donde hay tinta, hay estrella.
// Al cargar, los puntos llegan dispersos y se reúnen en la figura; el cursor los aparta como una
// pequeña gravedad. Con movimiento reducido se pinta la figura quieta, sin llegada ni cursor.

// Recorte de la foto donde está la figura (fracciones del ancho y alto de la imagen).
const CROP = { x: 0.16, y: 0.17, w: 0.62, h: 0.72 };
const SAMPLE_W = 240;
const REPEL = 120;
const GATHER = 2.2; // segundos que tarda cada punto en llegar
const STARS = 240;

export function initInkField(canvas) {
    if (!canvas) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--hueso').trim() || '#ece8df';

    let width = 0;
    let height = 0;
    let samples = [];
    let dots = [];
    let stars = [];
    let pointer = { x: -1e4, y: -1e4 };
    let start = 0;
    let frame = 0;
    let running = false;

    const img = new Image();
    img.src = canvas.dataset.src;
    img.decode().then(() => {
        samples = sample(img);
        resize();
        if (reduce) {
            draw(Infinity);
            return;
        }
        start = performance.now();
        play();
    });

    function play() {
        if (running) return;
        running = true;
        frame = requestAnimationFrame(tick);
    }

    function pause() {
        running = false;
        cancelAnimationFrame(frame);
    }

    function tick(now) {
        if (!running) return;
        draw((now - start) / 1000);
        frame = requestAnimationFrame(tick);
    }

    // Lee la foto en baja resolución y se queda con los píxeles más oscuros que su entorno.
    function sample(image) {
        const sw = SAMPLE_W;
        const sh = Math.round(sw * (CROP.h * image.naturalHeight) / (CROP.w * image.naturalWidth));
        const off = document.createElement('canvas');
        off.width = sw;
        off.height = sh;
        const octx = off.getContext('2d', { willReadFrequently: true });
        octx.drawImage(
            image,
            CROP.x * image.naturalWidth, CROP.y * image.naturalHeight,
            CROP.w * image.naturalWidth, CROP.h * image.naturalHeight,
            0, 0, sw, sh,
        );
        const data = octx.getImageData(0, 0, sw, sh).data;

        const lum = new Float32Array(sw * sh);
        for (let i = 0; i < lum.length; i++) {
            lum[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
        }
        const mean = boxBlur(lum, sw, sh, 12);

        const out = [];
        for (let y = 0; y < sh; y++) {
            for (let x = 0; x < sw; x++) {
                const i = y * sw + x;
                const dark = clamp((mean[i] - lum[i]) * 5 + (0.52 - lum[i]) * 1.6);
                // Bordes del recorte en elipse para que la figura no acabe en un rectángulo.
                const dx = (x / sw - 0.5) * 2;
                const dy = (y / sh - 0.5) * 2;
                const edge = 1 - smooth(0.72, 1, Math.hypot(dx, dy));
                const v = dark * edge;
                if (Math.random() < v * 0.95) out.push({ x, y, v, sw, sh });
            }
        }
        return out;
    }

    function resize() {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (!samples.length) return;
        const { sw, sh } = samples[0];
        const narrow = width < 1024;
        const figH = narrow ? height * 0.78 : height * 0.92;
        const scale = Math.min(figH / sh, (narrow ? width * 1.05 : width * 0.55) / sw);
        const cx = narrow ? width * 0.55 : width * 0.68;
        const cy = narrow ? height * 0.36 : height * 0.52;
        const left = cx - (sw * scale) / 2;
        const top = cy - (sh * scale) / 2;
        const fresh = dots.length === 0;

        dots = samples.map((s, i) => {
            const prev = dots[i];
            return {
                tx: left + (s.x + Math.random() - 0.5) * scale,
                ty: top + (s.y + Math.random() - 0.5) * scale,
                sx: fresh ? Math.random() * width : prev.sx,
                sy: fresh ? Math.random() * height : prev.sy,
                ox: prev?.ox ?? 0,
                oy: prev?.oy ?? 0,
                r: (0.6 + s.v * 0.9) * Math.max(scale / 2.6, 0.9),
                a: (narrow ? 0.5 : 1) * (0.35 + s.v * 0.65),
                delay: fresh ? Math.random() * 0.9 : prev.delay,
                phase: Math.random() * Math.PI * 2,
            };
        });

        stars = Array.from({ length: STARS }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 0.9 + 0.25,
            a: Math.random() * 0.5 + 0.1,
            phase: Math.random() * Math.PI * 2,
        }));

        if (reduce) draw(Infinity);
    }

    function draw(t) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = ink;

        const still = !Number.isFinite(t);
        for (const s of stars) {
            ctx.globalAlpha = still ? s.a : s.a * (0.6 + 0.4 * Math.sin(t * 0.8 + s.phase));
            ctx.fillRect(s.x, s.y, s.r, s.r);
        }

        for (const d of dots) {
            let x = d.tx;
            let y = d.ty;

            if (!still) {
                const p = easeInOut(clamp((t - d.delay) / GATHER));
                x = d.sx + (d.tx - d.sx) * p + Math.sin(t * 0.7 + d.phase) * 0.6;
                y = d.sy + (d.ty - d.sy) * p + Math.cos(t * 0.6 + d.phase) * 0.6;

                const dx = x + d.ox - pointer.x;
                const dy = y + d.oy - pointer.y;
                const dist = Math.hypot(dx, dy);
                if (dist < REPEL && dist > 0.01) {
                    const push = (1 - dist / REPEL) ** 2 * 6;
                    d.ox += (dx / dist) * push;
                    d.oy += (dy / dist) * push;
                }
                d.ox *= 0.92;
                d.oy *= 0.92;
                x += d.ox;
                y += d.oy;
            }

            ctx.globalAlpha = d.a;
            ctx.fillRect(x, y, d.r, d.r);
        }
        ctx.globalAlpha = 1;
    }

    new ResizeObserver(resize).observe(canvas);

    if (reduce) return;

    new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause())).observe(canvas);

    window.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, { passive: true });
    document.addEventListener('pointerleave', () => { pointer = { x: -1e4, y: -1e4 }; });
}

function boxBlur(src, w, h, r) {
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

const clamp = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
