// Línea fina: las golondrinas dibujadas solo con líneas horizontales, como un grabado. Cada línea
// engorda y se levanta donde hay tinta; una pluma dorada las traza de izquierda a derecha, de arriba
// abajo. El cursor o el dedo las ondulan como agua.

import { createStage, loadNear } from '../stage.js';
import { inkMap, contain, clamp, easeInOut } from '../image.js';

const CROP = { x: 0.08, y: 0.2, w: 0.72, h: 0.68 };
const SAMPLE_W = 220;
const STEP = 2; // px entre puntos de una línea
const STROKE = 1.3; // segundos que tarda cada línea
const STAGGER = 1.8; // segundos entre la primera línea y la última
const WAVE = 150; // radio de la onda del cursor

export function initEngrave(canvas) {
    let map = null;
    let lines = [];
    let gap = 4;
    let ink;
    let clock = 0;
    let energy = 0;
    let dirty = true;

    const stage = createStage(canvas, { resize, draw });
    loadNear(canvas).then((img) => {
        map = inkMap(img, CROP, SAMPLE_W);
        ink = getComputedStyle(document.documentElement).getPropertyValue('--hueso').trim() || '#ece8df';
        stage.start();
    });

    // Lee el mapa en un punto con interpolación bilineal, para que las líneas no salgan en escalera.
    function at(field, u, v) {
        const x = Math.min(map.w - 1.001, Math.max(0, u));
        const y = Math.min(map.h - 1.001, Math.max(0, v));
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const fx = x - x0;
        const fy = y - y0;
        const i = y0 * map.w + x0;
        const top = field[i] * (1 - fx) + field[i + 1] * fx;
        const bottom = field[i + map.w] * (1 - fx) + field[i + map.w + 1] * fx;
        return top * (1 - fy) + bottom * fy;
    }

    function resize(s) {
        const box = contain(map.w, map.h, s.width, s.height);
        const drawnH = map.h * box.scale;
        gap = Math.max(3.4, drawnH / 150);
        const count = Math.floor(drawnH / gap);
        const steps = Math.floor((map.w * box.scale) / STEP);
        lines = Array.from({ length: count }, (_, n) => {
            const y = box.top + (n + 0.5) * gap;
            const v = (y - box.top) / box.scale;
            const inks = new Float32Array(steps);
            const edges = new Float32Array(steps);
            for (let k = 0; k < steps; k++) {
                const u = (k * STEP) / box.scale;
                inks[k] = at(map.ink, u, v);
                edges[k] = at(map.edge, u, v);
            }
            return { y, x0: box.left, inks, edges, delay: (n / count) * STAGGER };
        });
        dirty = true;
    }

    function draw(s, dt) {
        const { ctx, pointer } = s;
        clock += dt;
        const target = pointer.inside ? Math.min(1, 0.3 + pointer.speed / 700) : 0;
        energy += (target - energy) * Math.min(1, dt * 3);

        const drawing = s.t < STAGGER + STROKE + 0.1;
        if (!drawing && energy < 0.005 && !dirty) return;
        dirty = !drawing && energy >= 0.005; // un último fotograma limpio cuando la onda se calma

        ctx.clearRect(0, 0, s.width, s.height);
        ctx.fillStyle = ink;
        ctx.globalAlpha = 0.92;
        const lift = gap * 0.9;
        const weight = gap / 4;
        const heads = [];

        for (const line of lines) {
            const p = easeInOut(clamp((s.t - line.delay) / STROKE));
            if (p <= 0) continue;
            const n = Math.max(2, Math.ceil(p * line.inks.length));
            const top = new Float32Array(n);
            const half = new Float32Array(n);
            for (let k = 0; k < n; k++) {
                const x = line.x0 + k * STEP;
                const v = line.inks[k];
                let y = line.y - v * lift;
                if (energy > 0.005) {
                    const dx = x - pointer.x;
                    const dy = line.y - pointer.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < WAVE * WAVE) {
                        const d = Math.sqrt(d2);
                        y += Math.sin(d * 0.11 - clock * 7) * 6 * energy * (1 - d / WAVE) ** 2;
                    }
                }
                top[k] = y;
                half[k] = (line.edges[k] * 0.16 + v * 0.95) * weight;
            }
            ctx.beginPath();
            ctx.moveTo(line.x0, top[0] - half[0]);
            for (let k = 1; k < n; k++) ctx.lineTo(line.x0 + k * STEP, top[k] - half[k]);
            for (let k = n - 1; k >= 0; k--) ctx.lineTo(line.x0 + k * STEP, top[k] + half[k]);
            ctx.closePath();
            ctx.fill();
            if (p < 1) heads.push([line.x0 + (n - 1) * STEP, top[n - 1]]);
        }

        // Las plumas: un punto dorado al final de cada línea que se está trazando.
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(227, 207, 155, .85)';
        for (const [x, y] of heads) {
            ctx.beginPath();
            ctx.arc(x, y, 1.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
