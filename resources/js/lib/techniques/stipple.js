// Punteado: varias agujas recorren el gorrión y lo rellenan punto a punto, cada una por su zona.
// El cursor o el dedo levantan los puntos como polvo de tinta, y las agujas vuelven a ponerlos.
//
// Los puntos ya puestos viven en una capa aparte; cada fotograma solo se pintan los nuevos, el polvo
// que vuela y el destello dorado de cada aguja.

import { createStage, loadNear } from '../stage.js';
import { inkMap, contain } from '../image.js';

const CROP = { x: 0.17, y: 0.04, w: 0.68, h: 0.64 };
const SAMPLE_W = 200;
const NEEDLES = 5;
const BUILD = 3.6; // segundos hasta terminar el dibujo
const DENSITY = 1.7; // puntos por píxel del mapa con tinta plena
const CELL = 14; // lado de la rejilla para encontrar puntos bajo el cursor
const GLINT = 0.35; // segundos que brilla un punto recién puesto

export function initStipple(canvas) {
    let map = null;
    let dots = [];
    let chunks = [];
    let box;
    let layer;
    let lctx;
    let grid = new Map();
    let ink;
    let halo;
    let clock = 0;
    let dirty = true;
    const glints = [];
    const dust = [];
    const waiting = [];

    const stage = createStage(canvas, { resize, draw });
    loadNear(canvas).then((img) => {
        prepare(img);
        stage.start();
    });

    function prepare(img) {
        map = inkMap(img, CROP, SAMPLE_W);
        const css = getComputedStyle(document.documentElement);
        ink = css.getPropertyValue('--hueso').trim() || '#ece8df';
        halo = css.getPropertyValue('--halo').trim() || '#e3cf9b';

        for (let y = 0; y < map.h; y++) {
            for (let x = 0; x < map.w; x++) {
                const v = map.ink[y * map.w + x];
                const k = v * DENSITY;
                const n = Math.floor(k) + (Math.random() < k % 1 ? 1 : 0);
                for (let j = 0; j < n; j++) {
                    const u = x + Math.random();
                    const w = y + Math.random();
                    dots.push({ u, v: w, size: 0.5 + v * 0.6, a: 0.6 + v * 0.4, key: hilbert(u / map.w, w / map.h), placed: false });
                }
            }
        }
        // Orden de curva de Hilbert: puntos seguidos en la lista están cerca en el dibujo, así cada
        // aguja avanza por una zona en vez de saltar.
        dots.sort((p, q) => p.key - q.key);
        const per = Math.ceil(dots.length / NEEDLES);
        chunks = Array.from({ length: NEEDLES }, (_, i) => ({ from: i * per, to: Math.min(dots.length, (i + 1) * per), done: 0 }));
    }

    function resize(s) {
        box = contain(map.w, map.h, s.width, s.height);
        const r = Math.max(0.6, box.scale * 0.42);
        grid = new Map();
        dots.forEach((d, i) => {
            d.x = box.left + d.u * box.scale;
            d.y = box.top + d.v * box.scale;
            d.r = d.size * r;
            const key = cell(d.x, d.y);
            if (!grid.has(key)) grid.set(key, []);
            grid.get(key).push(i);
        });

        layer = document.createElement('canvas');
        layer.width = canvas.width;
        layer.height = canvas.height;
        lctx = layer.getContext('2d');
        lctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
        lctx.fillStyle = ink;
        for (const d of dots) if (d.placed) put(d);
        dirty = true;
    }

    function put(d) {
        lctx.globalAlpha = d.a;
        lctx.beginPath();
        lctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        lctx.fill();
    }

    function place(d) {
        d.placed = true;
        put(d);
        glints.push({ x: d.x, y: d.y, r: d.r, born: clock });
    }

    // Levanta los puntos bajo el cursor: los de dentro salen volando y todos vuelven en un momento.
    function lift(px, py, radius, vx, vy) {
        const reach = radius + 2;
        let hit = false;
        for (let cx = Math.floor((px - reach) / CELL); cx <= Math.floor((px + reach) / CELL); cx++) {
            for (let cy = Math.floor((py - reach) / CELL); cy <= Math.floor((py + reach) / CELL); cy++) {
                for (const i of grid.get(`${cx},${cy}`) || []) {
                    const d = dots[i];
                    if (!d.placed) continue;
                    const dx = d.x - px;
                    const dy = d.y - py;
                    const dist = Math.hypot(dx, dy);
                    if (dist > radius + d.r) continue;
                    d.placed = false;
                    hit = true;
                    waiting.push({ d, back: clock + 0.45 + Math.random() * 0.9 });
                    if (dist < radius && dust.length < 1800) {
                        const push = 40 + Math.random() * 110;
                        dust.push({
                            x: d.x, y: d.y, r: d.r, a: d.a, born: clock,
                            vx: (dx / (dist || 1)) * push + vx * 0.25,
                            vy: (dy / (dist || 1)) * push + vy * 0.25,
                        });
                    }
                }
            }
        }
        if (!hit) return;
        lctx.save();
        lctx.globalCompositeOperation = 'destination-out';
        lctx.globalAlpha = 1;
        lctx.beginPath();
        lctx.arc(px, py, radius, 0, Math.PI * 2);
        lctx.fill();
        lctx.restore();
    }

    let prev = null;
    function draw(s, dt) {
        const { ctx, pointer } = s;
        clock += dt;

        // Agujas: cada una pone los puntos de su tramo a ritmo constante.
        let busy = false;
        const heads = [];
        chunks.forEach((c, n) => {
            const p = Math.min(1, Math.max(0, (s.t - n * 0.12) / BUILD));
            const target = Math.floor(p * (c.to - c.from));
            while (c.done < target) place(dots[c.from + c.done++]);
            if (p > 0 && p < 1) {
                busy = true;
                heads.push(dots[c.from + Math.max(0, c.done - 1)]);
            }
        });

        if (pointer.inside && s.t > 0.3) {
            const radius = Math.max(20, box.scale * 11);
            const vx = prev ? (pointer.x - prev.x) / (dt || 1) : 0;
            const vy = prev ? (pointer.y - prev.y) / (dt || 1) : 0;
            if (pointer.speed > 30) lift(pointer.x, pointer.y, radius, vx, vy);
            prev = { x: pointer.x, y: pointer.y };
        } else {
            prev = null;
        }

        for (let i = waiting.length - 1; i >= 0; i--) {
            if (clock < waiting[i].back) continue;
            const { d } = waiting[i];
            waiting.splice(i, 1);
            if (!d.placed) place(d);
        }

        if (!busy && !dirty && !glints.length && !dust.length && !waiting.length) return;
        dirty = false;

        ctx.clearRect(0, 0, s.width, s.height);
        ctx.drawImage(layer, 0, 0, s.width, s.height);

        ctx.fillStyle = ink;
        for (let i = dust.length - 1; i >= 0; i--) {
            const p = dust[i];
            const age = clock - p.born;
            if (age > 0.9) {
                dust.splice(i, 1);
                continue;
            }
            p.vx *= 0.93;
            p.vy *= 0.93;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            ctx.globalAlpha = p.a * (1 - age / 0.9);
            ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        }

        ctx.fillStyle = halo;
        for (let i = glints.length - 1; i >= 0; i--) {
            const g = glints[i];
            const age = clock - g.born;
            if (age > GLINT) {
                glints.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = 1 - age / GLINT;
            ctx.beginPath();
            ctx.arc(g.x, g.y, g.r * 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        for (const d of heads) {
            const glow = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 14);
            glow.addColorStop(0, 'rgba(227, 207, 155, .7)');
            glow.addColorStop(1, 'rgba(227, 207, 155, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(d.x - 14, d.y - 14, 28, 28);
        }
    }
}

const cell = (x, y) => `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;

// Posición en la curva de Hilbert de un punto del cuadrado unidad (rejilla de 256×256).
function hilbert(u, v) {
    const n = 256;
    let x = Math.min(n - 1, Math.floor(u * n));
    let y = Math.min(n - 1, Math.floor(v * n));
    let d = 0;
    for (let s = n / 2; s > 0; s /= 2) {
        const rx = (x & s) > 0 ? 1 : 0;
        const ry = (y & s) > 0 ? 1 : 0;
        d += s * s * ((3 * rx) ^ ry);
        if (ry === 0) {
            if (rx === 1) {
                x = s - 1 - x;
                y = s - 1 - y;
            }
            [x, y] = [y, x];
        }
    }
    return d;
}
