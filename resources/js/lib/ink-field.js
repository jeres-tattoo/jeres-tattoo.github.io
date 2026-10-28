// Redibuja una foto de tatuaje como un campo de puntos de luz: donde hay tinta, hay estrella.
// Al cargar, los puntos llegan dispersos y se reúnen en la figura; el cursor (o el dedo en móvil)
// los aparta como una pequeña gravedad.
//
// El reloj de la reunión solo avanza con fotogramas pintados y con el hero a la vista: en móvil,
// con red lenta o el teléfono ocupado, Safari puede tardar en pintar o saltarse fotogramas, y con un
// reloj de pared la animación terminaría sin que nadie la viera. Se reproduce también con "Reducir movimiento":
// es una entrada única y corta, y es la identidad de la web.

// Recorte de la foto donde está la figura (fracciones del ancho y alto de la imagen).
const CROP = { x: 0.16, y: 0.17, w: 0.62, h: 0.72 };
const SAMPLE_W = 240;
const GATHER = 2.2; // segundos que tarda cada punto en llegar
const STARS = 240;

export function initInkField(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--hueso').trim() || '#ece8df';

    let width = 0;
    let height = 0;
    let samples = [];
    let dots = [];
    let stars = [];
    let pointer = { x: -1e4, y: -1e4 };
    let repel = 120;
    let elapsed = 0; // segundos de animación realmente pintados
    let last = 0;
    let frame = 0;
    let running = false;
    let ready = false;
    let visible = false;

    const img = new Image();
    img.src = canvas.dataset.src;
    loaded(img).then(() => {
        samples = sample(img);
        ready = true;
        resize();
        play();
    });

    function play() {
        if (running || !ready || !visible || document.hidden) return;
        running = true;
        last = 0;
        frame = requestAnimationFrame(tick);
    }

    function pause() {
        running = false;
        cancelAnimationFrame(frame);
    }

    function tick(now) {
        if (!running) return;
        // Como mucho 1/20 s por fotograma: si el navegador se para, la animación espera en vez de saltar.
        if (last) elapsed += Math.min(now - last, 50) / 1000;
        last = now;
        draw(elapsed);
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
                // Opacidad en 8 niveles: así se cambia globalAlpha 8 veces por frame y no miles.
                if (Math.random() < v * 0.95) out.push({ x, y, v, sw, sh, a: Math.round((0.35 + v * 0.65) * 8) / 8 });
            }
        }
        return out.sort((p, q) => p.a - q.a);
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
        // En pantallas estrechas la figura ocupa la parte de arriba, a plena luz, y el nombre va debajo.
        const narrow = width < 1024;
        const figH = narrow ? height * 0.62 : height * 0.92;
        const scale = Math.min(figH / sh, (narrow ? width * 0.98 : width * 0.55) / sw);
        const cx = narrow ? width * 0.52 : width * 0.68;
        const cy = narrow ? height * 0.37 : height * 0.52;
        repel = Math.max(100, sw * scale * 0.21);
        const left = cx - (sw * scale) / 2;
        const top = cy - (sh * scale) / 2;
        // Hasta que arranca la reunión, los puntos salen repartidos por todo el hero a su tamaño final.
        const fresh = !elapsed;

        dots = samples.map((s, i) => {
            const prev = dots[i];
            return {
                tx: left + (s.x + Math.random() - 0.5) * scale,
                ty: top + (s.y + Math.random() - 0.5) * scale,
                sx: fresh || !prev ? Math.random() * width : prev.sx,
                sy: fresh || !prev ? Math.random() * height : prev.sy,
                ox: prev ? prev.ox : 0,
                oy: prev ? prev.oy : 0,
                r: (0.6 + s.v * 0.9) * Math.max(scale / 2.6, 0.9),
                a: s.a,
                delay: fresh || !prev ? Math.random() * 0.9 : prev.delay,
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

        if (!running && elapsed) draw(Infinity);
    }

    function draw(t) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = ink;

        const still = !Number.isFinite(t);
        for (const s of stars) {
            ctx.globalAlpha = still ? s.a : s.a * (0.6 + 0.4 * Math.sin(t * 0.8 + s.phase));
            ctx.fillRect(s.x, s.y, s.r, s.r);
        }

        let alpha = -1;
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
                if (dist < repel && dist > 0.01) {
                    const push = (1 - dist / repel) ** 2 * 6;
                    d.ox += (dx / dist) * push;
                    d.oy += (dy / dist) * push;
                }
                d.ox *= 0.92;
                d.oy *= 0.92;
                x += d.ox;
                y += d.oy;
            }

            if (d.a !== alpha) ctx.globalAlpha = alpha = d.a;
            ctx.fillRect(x, y, d.r, d.r);
        }
        ctx.globalAlpha = 1;
    }

    new ResizeObserver(resize).observe(canvas);

    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) play();
        else pause();
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

    const aim = (x, y) => {
        const rect = canvas.getBoundingClientRect();
        pointer = { x: x - rect.left, y: y - rect.top };
    };
    const away = () => { pointer = { x: -1e4, y: -1e4 }; };

    // Ratón y lápiz. El dedo va por eventos táctiles: los pointer events se cancelan en cuanto el
    // navegador empieza a hacer scroll, y los táctiles siguen llegando mientras el dedo se mueve.
    addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') aim(e.clientX, e.clientY); }, { passive: true });
    document.documentElement.addEventListener('mouseleave', away);

    const follow = (e) => { if (e.touches.length) aim(e.touches[0].clientX, e.touches[0].clientY); };
    addEventListener('touchstart', follow, { passive: true });
    addEventListener('touchmove', follow, { passive: true });
    addEventListener('touchend', away, { passive: true });
    addEventListener('touchcancel', away, { passive: true });
}

// decode() decodifica fuera del hilo principal; si el navegador la rechaza, basta con que cargue.
function loaded(image) {
    const onload = () => new Promise((resolve, reject) => {
        if (image.complete && image.naturalWidth) return resolve();
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', reject, { once: true });
    });
    return image.decode ? image.decode().catch(onload) : onload();
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
