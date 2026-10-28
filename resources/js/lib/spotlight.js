// En pantallas táctiles no hay hover: la pieza que pasa por el centro de la pantalla al hacer scroll
// se ve en color, igual que al pasar el cursor en el ordenador.
export function initSpotlight(items) {
    if (!items.length || !matchMedia('(hover: none)').matches) return;

    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) entry.target.classList.toggle('is-lit', entry.isIntersecting);
    }, { rootMargin: '-38% 0px -38% 0px' });
    items.forEach((item) => io.observe(item));
}
