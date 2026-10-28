// Ornamental: la serpiente aparece en negativo, como tinta que florece sobre papel mojado, desde la
// cabeza hacia la cola. El borde húmedo de cada mancha brilla en dorado. El cursor o el dedo apartan
// la tinta y la tinta vuelve a extenderse sola.
//
// Cada fotograma se compone en un lienzo auxiliar: primero la máscara (manchas menos huecos del
// cursor) y luego la tinta solo donde hay máscara (source-in).

import { createStage, loadNear } from '../stage.js';
import { inkMap, contain, clamp, smooth } from '../image.js';

const CROP = { x: 0.08, y: 0.14, w: 0.84, h: 0.74 };
const SAMPLE_W = 360;
const HEAD = { x: 0.68, y: 0.54 }; // la cabeza, en fracciones del recorte
const BLOOMS = 70;
const GROW = 1.5; // segundos que tarda en abrirse cada mancha
const SPREAD = 2.2; // segundos entre la primera mancha y la última
const HEAL = 1.8; // segundos que tarda la tinta en volver tras el cursor

export function initInkBloom(canvas) {
    let map = null;
    let art;
    let gold;
    let box;
    let scratch;
    let sctx;
    let blooms = [];
    let end = 0;
    let clock = 0;
    let dirty = true;
    let trail = [];

    const stage = createStage(canvas, { resize, draw });
    loadNear(canvas).then((img) => {
        prepare(img);
        stage.start();
    });

    function prepare(img) {
        map = inkMap(img, CROP, SAMPLE_W);
        art = paint([236, 232, 223]);
        gold = paint([227, 207, 155]);

        // Manchas donde hay tinta; abren antes cuanto más cerca de la cabeza.
        const far = Math.hypot(Math.max(HEAD.x, 1 - HEAD.x) * map.w, Math.max(HEAD.y, 1 - HEAD.y) * map.h);
        while (blooms.length < BLOOMS) {
            const x = Math.random() * map.w;
            const y = Math.random() * map.h;
            if (Math.random() > map.ink[Math.floor(y) * map.w + Math.floor(x)] * 1.6) continue;
            const reach = Math.hypot(x - HEAD.x * map.w, y - HEAD.y * map.h) / far;
            blooms.push({
                x, y,
                r: map.w * (0.09 + Math.random() * 0.08),
                start: 0.1 + reach * SPREAD + Math.random() * 0.25,
                p1: Math.random() * 6.3, p2: Math.random() * 6.3, p3: Math.random() * 6.3,
            });
        }
        end = Math.max(...blooms.map((b) => b.start)) + GROW;
    }

    // La tinta en negativo: color fijo y opacidad según la tinta del mapa.
    function paint([r, g, b]) {
        const c = document.createElement('canvas');
        c.width = map.w;
        c.height = map.h;
        const cctx = c.getContext('2d');
        const image = cctx.createImageData(map.w, map.h);
        for (let i = 0; i < map.ink.length; i++) {
            image.data[i * 4] = r;
            image.data[i * 4 + 1] = g;
            image.data[i * 4 + 2] = b;
            image.data[i * 4 + 3] = Math.min(255, map.ink[i] ** 0.8 * 290);
        }
        cctx.putImageData(image, 0, 0);
        return c;
    }

    function resize(s) {
        box = contain(map.w, map.h, s.width, s.height);
        scratch = document.createElement('canvas');
        scratch.width = canvas.width;
        scratch.height = canvas.height;
        sctx = scratch.getContext('2d');
        sctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
        dirty = true;
    }

    // Mancha de borde irregular, como la tinta al correr por el papel.
    function blob(c, x, y, r, b, wobble) {
        const steps = 30;
        c.moveTo(x + r, y);
        for (let k = 0; k <= steps; k++) {
            const a = (k / steps) * Math.PI * 2;
            const rr = r * (1 + 0.13 * Math.sin(3 * a + b.p1 + wobble) + 0.07 * Math.sin(7 * a + b.p2) + 0.04 * Math.sin(13 * a + b.p3));
            c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
    }

    // Radio del hueco que deja el cursor según su edad: se abre rápido y se cierra despacio.
    const hole = (h) => h.r * (Math.min(1, (clock - h.born) / 0.12) - smooth(0.35, HEAL, clock - h.born));

    function draw(s, dt) {
        const { ctx, pointer } = s;
        clock += dt;

        if (pointer.inside && s.t > 0.3 && pointer.speed > 20) {
            const last = trail[trail.length - 1];
            if (!last || Math.hypot(pointer.x - last.x, pointer.y - last.y) > 6 || clock - last.born > 0.05) {
                trail.push({ x: pointer.x, y: pointer.y, born: clock, r: Math.max(24, box.scale * map.w * 0.1), p1: Math.random() * 6.3, p2: Math.random() * 6.3, p3: Math.random() * 6.3 });
            }
        }
        const had = trail.length;
        trail = trail.filter((h) => clock - h.born < HEAL);
        if (had && !trail.length) dirty = true; // un fotograma más con la tinta ya cerrada

        const opening = s.t < end + 0.3;
        if (!opening && !trail.length && !dirty) return;
        dirty = false;

        const full = smooth(end - 0.9, end, s.t);
        const toCanvas = (b) => [box.left + b.x * box.scale, box.top + b.y * box.scale, b.r * box.scale];

        // 1. Máscara: manchas abiertas, al final todo, y los huecos del cursor quitados.
        sctx.clearRect(0, 0, s.width, s.height);
        sctx.globalCompositeOperation = 'source-over';
        sctx.fillStyle = '#fff';
        if (full > 0) {
            sctx.globalAlpha = full;
            sctx.fillRect(0, 0, s.width, s.height);
        }
        for (const b of blooms) {
            const p = clamp((s.t - b.start) / GROW);
            if (p <= 0 || full >= 1) continue;
            const [x, y, r] = toCanvas(b);
            const grown = 1 - (1 - p) ** 3;
            sctx.globalAlpha = 0.45;
            sctx.beginPath();
            blob(sctx, x, y, r * grown * 1.08, b, clock * 0.6);
            sctx.fill();
            sctx.globalAlpha = 1;
            sctx.beginPath();
            blob(sctx, x, y, r * grown, b, clock * 0.6);
            sctx.fill();
        }
        sctx.globalCompositeOperation = 'destination-out';
        for (const h of trail) {
            const r = hole(h);
            if (r <= 0) continue;
            sctx.globalAlpha = 0.5;
            sctx.beginPath();
            blob(sctx, h.x, h.y, r * 1.12, h, clock);
            sctx.fill();
            sctx.globalAlpha = 1;
            sctx.beginPath();
            blob(sctx, h.x, h.y, r, h, clock);
            sctx.fill();
        }
        // 2. La tinta, solo donde hay máscara.
        sctx.globalCompositeOperation = 'source-in';
        sctx.globalAlpha = 1;
        sctx.drawImage(art, box.left, box.top, map.w * box.scale, map.h * box.scale);

        ctx.clearRect(0, 0, s.width, s.height);
        ctx.drawImage(scratch, 0, 0, s.width, s.height);

        // 3. Bordes húmedos en dorado: anillos en el filo de las manchas que crecen y de los huecos que se cierran.
        sctx.globalCompositeOperation = 'source-over';
        sctx.clearRect(0, 0, s.width, s.height);
        sctx.strokeStyle = '#fff';
        let rims = false;
        for (const b of blooms) {
            const p = clamp((s.t - b.start) / GROW);
            if (p <= 0 || p >= 1) continue;
            const [x, y, r] = toCanvas(b);
            sctx.globalAlpha = (1 - p) * 0.9;
            sctx.lineWidth = r * 0.22;
            sctx.beginPath();
            blob(sctx, x, y, r * (1 - (1 - p) ** 3), b, clock * 0.6);
            sctx.stroke();
            rims = true;
        }
        for (const h of trail) {
            const r = hole(h);
            if (r <= 0) continue;
            sctx.globalAlpha = 0.8;
            sctx.lineWidth = h.r * 0.3;
            sctx.beginPath();
            blob(sctx, h.x, h.y, r, h, clock);
            sctx.stroke();
            rims = true;
        }
        if (!rims) return;
        sctx.globalCompositeOperation = 'source-in';
        sctx.globalAlpha = 1;
        sctx.drawImage(gold, box.left, box.top, map.w * box.scale, map.h * box.scale);
        ctx.drawImage(scratch, 0, 0, s.width, s.height);
    }
}
