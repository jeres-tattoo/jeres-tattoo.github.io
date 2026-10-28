// Parallax del campo de obra: cada pieza flota a su propia profundidad (data-depth, 0–1).
// Se mide el <li> y se mueve su hijo, para que el desplazamiento no altere la medida.
export function initDrift(items) {
    if (!items.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let queued = false;

    function update() {
        queued = false;
        const mid = innerHeight / 2;
        const strength = innerWidth < 760 ? 0.08 : 0.2;
        for (const item of items) {
            const rect = item.getBoundingClientRect();
            if (rect.bottom < -200 || rect.top > innerHeight + 200) continue;
            const offset = (rect.top + rect.height / 2 - mid) * Number(item.dataset.depth) * -strength;
            item.firstElementChild.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        }
    }

    function queue() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    }

    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    update();
}
