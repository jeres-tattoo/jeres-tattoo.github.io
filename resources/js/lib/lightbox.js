// Visor de piezas: abre la pieza pulsada en grande y en color, con anterior/siguiente y teclado.
export function initLightbox(dialog, works, triggers) {
    if (!dialog || !works.length) return;

    const img = dialog.querySelector('.lightbox__img');
    const title = dialog.querySelector('.lightbox__title');
    const meta = dialog.querySelector('.lightbox__meta');
    const post = dialog.querySelector('.lightbox__post');
    let current = 0;

    function show(index) {
        current = (index + works.length) % works.length;
        const work = works[current];
        img.src = work.img;
        img.alt = work.title;
        title.textContent = work.title;
        meta.textContent = work.meta;
        post.href = work.url;
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            show(Number(trigger.dataset.piece));
            dialog.showModal();
        });
    });

    dialog.addEventListener('click', (e) => {
        const step = e.target.closest('[data-step]');
        if (step) show(current + Number(step.dataset.step));
        else if (e.target.closest('[data-close]') || e.target === dialog) dialog.close();
    });

    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') show(current + 1);
        if (e.key === 'ArrowLeft') show(current - 1);
    });
}
