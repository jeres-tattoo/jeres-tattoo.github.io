// Realismo en negro y gris: el busto a oscuras y una lámpara que lo recorre. El relieve sale de los
// grises de la propia foto, así que con luz rasante la piel se vuelve mármol. Al entrar, la luz sube
// desde abajo como un amanecer; luego da vueltas despacio, o sigue al cursor o al dedo.

import { createStage, loadNear } from '../stage.js';
import { inkMap, contain, boxBlur, clamp, easeInOut } from '../image.js';

const CROP = { x: 0.05, y: 0.16, w: 0.64, h: 0.66 };
const SAMPLE_W = 240;
const DAWN = 2.6; // segundos que tarda la luz en llegar
const RELIEF = 7; // cuánto relieve sacan los grises

export function initRelight(canvas) {
    let map = null;
    let normals;
    let albedo;
    let buffer;
    let bctx;
    let pixels;
    let box;
    const light = { x: 0, y: 0 }; // en píxeles del mapa

    const stage = createStage(canvas, { resize, draw });
    loadNear(canvas).then((img) => {
        prepare(img);
        stage.start();
    });

    function prepare(img) {
        map = inkMap(img, CROP, SAMPLE_W);
        const { w, h, lum, edge } = map;
        const height = boxBlur(lum, w, h, 1);
        const sorted = [...lum].sort((a, b) => a - b);
        const lo = sorted[Math.floor(sorted.length * 0.02)];
        const hi = sorted[Math.floor(sorted.length * 0.98)];

        normals = new Float32Array(w * h * 3);
        albedo = new Float32Array(w * h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = y * w + x;
                const dx = height[y * w + Math.min(w - 1, x + 1)] - height[y * w + Math.max(0, x - 1)];
                const dy = height[Math.min(h - 1, y + 1) * w + x] - height[Math.max(0, y - 1) * w + x];
                const nx = -dx * RELIEF;
                const ny = -dy * RELIEF;
                const n = Math.hypot(nx, ny, 1);
                normals[i * 3] = nx / n;
                normals[i * 3 + 1] = ny / n;
                normals[i * 3 + 2] = 1 / n;
                albedo[i] = clamp((lum[i] - lo) / (hi - lo)) ** 1.15 * edge[i];
            }
        }

        buffer = document.createElement('canvas');
        buffer.width = w;
        buffer.height = h;
        bctx = buffer.getContext('2d');
        pixels = bctx.createImageData(w, h);
        light.x = w * 0.15;
        light.y = h * 1.1;
    }

    function resize(s) {
        box = contain(map.w, map.h, s.width, s.height);
    }

    function draw(s, dt) {
        const { w, h } = map;
        const { ctx, pointer } = s;
        const dawn = easeInOut(clamp(s.t / DAWN));

        // Adónde va la luz: el cursor si está encima; si no, una vuelta lenta alrededor de la cara.
        const idleX = w * (0.52 + 0.3 * Math.cos(s.t * 0.42));
        const idleY = h * (0.4 + 0.2 * Math.sin(s.t * 0.57));
        let tx = w * 0.15 + (idleX - w * 0.15) * dawn;
        let ty = h * 1.1 + (idleY - h * 1.1) * dawn;
        if (pointer.inside && dawn > 0.5) {
            tx = (pointer.x - box.left) / box.scale;
            ty = (pointer.y - box.top) / box.scale;
        }
        const follow = dt ? Math.min(1, dt * 5) : 1;
        light.x += (tx - light.x) * follow;
        light.y += (ty - light.y) * follow;

        const power = dawn;
        const lz = w * 0.26;
        const r2 = (w * 0.6) ** 2;
        const data = pixels.data;
        for (let y = 0, i = 0; y < h; y++) {
            const ly = light.y - y;
            for (let x = 0; x < w; x++, i++) {
                const o = i * 4;
                const a = albedo[i];
                if (a < 0.004 || !power) {
                    data[o + 3] = 0;
                    continue;
                }
                const lx = light.x - x;
                const flat = lx * lx + ly * ly;
                const inv = 1 / Math.sqrt(flat + lz * lz);
                const nx = normals[i * 3];
                const ny = normals[i * 3 + 1];
                const nz = normals[i * 3 + 2];
                const ndl = Math.max(0, (nx * lx + ny * ly + nz * lz) * inv);
                const att = 1 / (1 + flat / r2);
                // Brillo de mármol (Blinn-Phong) con la vista de frente.
                const hx = lx * inv;
                const hy = ly * inv;
                const hz = lz * inv + 1;
                let spec = Math.max(0, (nx * hx + ny * hy + nz * hz) / Math.sqrt(hx * hx + hy * hy + hz * hz));
                spec *= spec; spec *= spec; spec *= spec; spec *= spec; // ^16
                const v = power * (a * (0.06 + ndl * att * 1.45) + spec * att * a * 0.5);
                // Cerca de la lámpara la luz calienta hacia el halo; lejos, hueso frío.
                const warm = att * att * power;
                data[o] = 236 - 9 * warm;
                data[o + 1] = 232 - 25 * warm;
                data[o + 2] = 223 - 68 * warm;
                data[o + 3] = Math.min(255, v * 255);
            }
        }
        bctx.putImageData(pixels, 0, 0);

        ctx.clearRect(0, 0, s.width, s.height);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(buffer, box.left, box.top, w * box.scale, h * box.scale);

        // La lámpara misma, un resplandor pequeño donde está la luz.
        const lx = box.left + light.x * box.scale;
        const ly = box.top + light.y * box.scale;
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 46);
        glow.addColorStop(0, `rgba(227, 207, 155, ${0.32 * power})`);
        glow.addColorStop(1, 'rgba(227, 207, 155, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(lx - 46, ly - 46, 92, 92);
    }
}
