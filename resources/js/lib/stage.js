// Bucle común de los lienzos de técnicas: tamaño con la densidad de la pantalla, un reloj que solo
// avanza con fotogramas pintados y con el lienzo a la vista (como el arcángel), y el puntero, ratón o
// dedo, en coordenadas del lienzo.
//
// La entrada de cada técnica arranca cuando el lienzo está a la vista en buena parte, no al rozar el
// borde de la pantalla, para que se vea entera.

import { loaded } from './image.js';

const START_RATIO = 0.35;

// Las fotos de las técnicas se piden cuando su sección se acerca a la pantalla, no al abrir la web:
// lo primero que tiene que llegar es el arcángel. Se piden todas a la vez para que, al bajar, cada
// lienzo ya tenga la suya.
export function loadNear(canvas) {
    return new Promise((resolve) => {
        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            io.disconnect();
            const img = new Image();
            img.src = canvas.dataset.src;
            loaded(img).then(() => resolve(img));
        }, { rootMargin: '100% 0px' });
        io.observe(canvas.closest('section') || canvas);
    });
}

export function createStage(canvas, { resize, draw }) {
    const ctx = canvas.getContext('2d');
    const stage = {
        ctx,
        width: 0,
        height: 0,
        dpr: 1,
        t: 0, // segundos de entrada realmente pintados
        pointer: { x: -1e4, y: -1e4, inside: false, speed: 0 },
        start,
    };

    let client = null; // última posición del puntero en la ventana
    let last = 0;
    let frame = 0;
    let running = false;
    let ready = false;
    let visible = false;
    let started = false;

    function start() {
        ready = true;
        fit();
        play();
    }

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
        const dt = last ? Math.min(now - last, 50) / 1000 : 0;
        last = now;
        if (started) stage.t += dt;
        aim(dt);
        draw(stage, dt);
        frame = requestAnimationFrame(tick);
    }

    // El puntero se recalcula cada fotograma: al hacer scroll el lienzo se mueve aunque el ratón no.
    function aim(dt) {
        const p = stage.pointer;
        if (!client) {
            p.inside = false;
            p.speed *= 0.9;
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const x = client.x - rect.left;
        const y = client.y - rect.top;
        const moved = p.inside ? Math.hypot(x - p.x, y - p.y) : 0;
        p.speed = p.speed * 0.8 + (dt ? moved / dt : 0) * 0.2;
        p.x = x;
        p.y = y;
        p.inside = x > -40 && y > -40 && x < rect.width + 40 && y < rect.height + 40;
    }

    function fit() {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        stage.dpr = dpr;
        stage.width = rect.width;
        stage.height = rect.height;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!ready) return;
        resize(stage);
        if (!running) draw(stage, 0);
    }

    new ResizeObserver(fit).observe(canvas);

    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (entry.intersectionRatio >= START_RATIO) started = true;
        if (visible) play();
        else pause();
    }, { threshold: [0, START_RATIO] }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

    // Igual que en el arcángel: el dedo va por eventos táctiles, que siguen llegando durante el scroll.
    addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') client = { x: e.clientX, y: e.clientY }; }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { client = null; });
    const follow = (e) => { if (e.touches.length) client = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    addEventListener('touchstart', follow, { passive: true });
    addEventListener('touchmove', follow, { passive: true });
    addEventListener('touchend', () => { client = null; }, { passive: true });
    addEventListener('touchcancel', () => { client = null; }, { passive: true });

    // En móvil, el dedo que empieza sobre la figura mueve el efecto, no la página. La figura es la
    // elipse del centro del lienzo; desde sus esquinas y desde el texto el scroll sigue como siempre.
    let holding = false;
    canvas.addEventListener('touchstart', (e) => {
        const rect = canvas.getBoundingClientRect();
        const dx = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
        const dy = (e.touches[0].clientY - rect.top) / rect.height - 0.5;
        holding = e.touches.length === 1 && (dx / 0.44) ** 2 + (dy / 0.46) ** 2 < 1;
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => { if (holding && e.cancelable) e.preventDefault(); }, { passive: false });

    return stage;
}
