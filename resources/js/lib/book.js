// Libro de la biblioteca. El mismo motor mueve dos formatos:
// - libro (data-axis="y", ordenador): cada hoja gira sobre el lomo; delante lleva la página derecha de
//   un pliego y detrás la izquierda del siguiente.
// - libreta (data-axis="x", móvil): hojas de una sola página cosidas por arriba que se levantan hacia
//   arriba y desaparecen por encima.
// Se pasa con los botones, las flechas del teclado, pulsando una página o deslizando el dedo.
//
// Mientras gira, la hoja se cambia por una copia partida en franjas; cada franja se adelanta un poco a
// la anterior, así la página se curva como papel blando en vez de girar como una tabla.

const STRIPS = 8;
const BEND = 0.22; // cuánto se adelanta el borde libre al lomo, en fracción del giro
const ease = (p) => (1 - Math.cos(Math.PI * p)) / 2;
const clamp = (v) => Math.min(1, Math.max(0, v));

export function initBook(book) {
    if (!book) return null;

    const axis = book.dataset.axis === 'x' ? 'x' : 'y';
    const pages = book.querySelector('.book__pages');
    const leaves = [...book.querySelectorAll('[data-leaf]')];
    const end = book.querySelector('.page--end');
    const where = book.querySelector('[data-where]');
    const [prev, next] = book.querySelectorAll('[data-turn]');
    const designs = leaves.length - 1;
    const duration = parseFloat(getComputedStyle(book).getPropertyValue('--turn')) * 1000 || 900;
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const turning = new Set();
    let current = 0; // hojas ya pasadas
    let lift = 0;
    const shown = () => book.offsetParent !== null;

    // Las hojas quietas se apilan como en un libro de verdad; la que gira va en su copia, por encima.
    // Solo se pintan las que pueden verse en el siguiente giro (la anterior a la izquierda, la abierta y la
    // siguiente) y la primera, que hace de canto del montón izquierdo. Las demás quedan tapadas, y como
    // cada hoja es una capa 3D, pintarlas todas agotaba la memoria del iPhone y Safari recargaba la página.
    function stack() {
        leaves.forEach((leaf, i) => {
            leaf.style.zIndex = i < current ? i + 1 : leaves.length - i;
            leaf.classList.toggle('is-away', i > 0 && (i < current - 2 || i > current + 1));
        });
    }

    // Solo se cargan los dibujos de las hojas cercanas a la que está abierta, y del libro que se ve.
    function load() {
        if (!shown()) return;
        leaves.slice(Math.max(0, current - 2), current + 3).forEach((leaf) => {
            leaf.querySelectorAll('img[data-src]:not([src])').forEach((img) => { img.src = img.dataset.src; });
        });
    }

    function render() {
        book.classList.toggle('is-open', current > 0);
        prev.disabled = current === 0;
        next.disabled = current === leaves.length;
        where.textContent = current === 0 ? 'Portada' : current > designs ? 'Final' : `Diseño ${current} de ${designs}`;
        // Solo se puede llegar con el teclado a las páginas que se ven.
        leaves.forEach((leaf, i) => {
            const [front, back] = leaf.children;
            front.inert = i !== current;
            back.inert = axis === 'x' || i !== current - 1;
        });
        end.inert = current !== leaves.length;
        stack();
        load();
    }

    function go(step) {
        const to = current + step;
        if (to < 0 || to > leaves.length) return;
        const leaf = leaves[step > 0 ? current : to];
        if (turning.has(leaf)) return;
        current = to;
        render();
        turn(leaf, step > 0);
    }

    // Copia de una cara recortada a una franja: `offset` es dónde empieza la franja dentro de la página.
    function face(page, offset, size, cross, back) {
        const wrap = document.createElement('div');
        wrap.className = back ? 'fold__face fold__face--back' : 'fold__face';
        const copy = page.cloneNode(true);
        copy.querySelectorAll('img[data-src]:not([src])').forEach((img) => { img.src = img.dataset.src; });
        copy.style.cssText = axis === 'y'
            ? `left:${-offset}px;top:0;width:${size}px;height:${cross}px`
            : `top:${-offset}px;left:0;height:${size}px;width:${cross}px`;
        const shade = document.createElement('div');
        shade.className = 'fold__shade';
        wrap.append(copy, shade);
        return wrap;
    }

    function turn(leaf, forward) {
        const finish = () => {
            leaf.classList.toggle('is-turned', forward);
            leaf.classList.remove('is-turning');
            turning.delete(leaf);
            stack();
        };
        if (still.matches) return finish();

        const [front, back] = leaf.children;
        const size = axis === 'y' ? leaf.offsetWidth : leaf.offsetHeight;
        const cross = axis === 'y' ? leaf.offsetHeight : leaf.offsetWidth;
        const strip = size / STRIPS;

        const root = document.createElement('div');
        root.className = 'fold';
        root.setAttribute('aria-hidden', 'true');
        root.style.cssText = `left:${leaf.offsetLeft}px;top:${leaf.offsetTop}px;width:${leaf.offsetWidth}px;height:${leaf.offsetHeight}px;z-index:${leaves.length + 2 + ++lift}`;

        // Franjas anidadas: cada una cuelga del borde de la anterior y gira un poco más.
        const strips = [];
        let parent = root;
        for (let k = 0; k < STRIPS; k++) {
            const el = document.createElement('div');
            el.className = 'fold__strip';
            el.style.cssText = axis === 'y'
                ? `left:${k ? strip : 0}px;top:0;width:${strip}px;height:${cross}px`
                : `top:${k ? strip : 0}px;left:0;height:${strip}px;width:${cross}px`;
            const faces = [face(front, k * strip, size, cross, false), face(back, (STRIPS - k - 1) * strip, size, cross, true)];
            el.append(...faces);
            parent.append(el);
            parent = el;
            strips.push({ el, faces });
        }

        turning.add(leaf);
        leaf.classList.add('is-turning');
        pages.append(root);

        const rotate = axis === 'y' ? (a) => `rotateY(${-a}deg)` : (a) => `rotateX(${a}deg)`;
        const dir = forward ? 1 : -1;
        const t0 = performance.now();

        function frame(now) {
            const t = clamp((now - t0) / duration);
            const p = forward ? t : 1 - t;
            // El borde libre va por delante del lomo en el sentido del giro y se juntan al final.
            const angles = strips.map((_, k) => 180 * ease(clamp(p + BEND * (k / (STRIPS - 1)) * Math.sin(Math.PI * p) * dir)));
            // Cuanto más de canto queda el papel, menos luz recibe. La sombra se calcula en cada pliegue y
            // se funde a lo ancho de la franja, para que la curva se lea entera y no a bandas.
            const dark = (a) => (0.38 * (1 - Math.abs(Math.cos((a * Math.PI) / 180)))).toFixed(3);
            const seams = angles.map((a, k) => dark(k ? (a + angles[k - 1]) / 2 : a));
            seams.push(dark(angles[STRIPS - 1]));
            const toward = axis === 'y' ? 'to right' : 'to bottom';
            let before = 0;
            strips.forEach(({ el, faces }, k) => {
                const angle = angles[k];
                el.style.transform = rotate(angle - before);
                before = angle;
                const up = angle < 90;
                faces[0].style.visibility = up ? 'visible' : 'hidden';
                faces[1].style.visibility = up ? 'hidden' : 'visible';
                // La cara de detrás está dada la vuelta: su principio es el final de la franja.
                const [from, to] = up ? [seams[k], seams[k + 1]] : [seams[k + 1], seams[k]];
                faces[up ? 0 : 1].lastChild.style.background = `linear-gradient(${toward}, rgb(11 13 28 / ${from}), rgb(11 13 28 / ${to}))`;
            });
            // La hoja se despega un poco del papel mientras gira; en la libreta se pierde por arriba.
            root.style.transform = `translateZ(${Math.sin(Math.PI * p) * 18}px)`;
            if (axis === 'x') root.style.opacity = clamp((178 - before) / 60);
            if (t < 1) requestAnimationFrame(frame);
            else {
                root.remove();
                finish();
            }
        }
        requestAnimationFrame(frame);
    }

    // Salta a una hoja sin animación (al cambiar entre libro y libreta).
    function set(to) {
        current = Math.min(leaves.length, Math.max(0, to));
        leaves.forEach((leaf, i) => leaf.classList.toggle('is-turned', i < current));
        stack();
        render();
    }

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    leaves.forEach((leaf) => leaf.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        go(leaf.classList.contains('is-turned') ? -1 : 1);
    }));

    addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey || !shown()) return;
        if (e.key === 'ArrowRight' || (axis === 'x' && e.key === 'ArrowDown')) go(1);
        if (e.key === 'ArrowLeft' || (axis === 'x' && e.key === 'ArrowUp')) go(-1);
    });

    // Deslizar: hacia la izquierda o hacia arriba avanza; al revés, vuelve.
    let start = null;
    pages.addEventListener('touchstart', (e) => { start = e.touches.length === 1 ? e.touches[0] : null; }, { passive: true });
    pages.addEventListener('touchend', (e) => {
        if (!start) return;
        const dx = e.changedTouches[0].clientX - start.clientX;
        const dy = e.changedTouches[0].clientY - start.clientY;
        start = null;
        const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        if (Math.abs(d) < 40) return;
        e.preventDefault(); // que el deslizamiento no acabe también en un toque
        go(d < 0 ? 1 : -1);
    }, { passive: false });

    stack();
    render();

    return { set, get current() { return current; } };
}
