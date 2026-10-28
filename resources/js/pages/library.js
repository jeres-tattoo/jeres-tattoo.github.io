import { initBook } from '../lib/book.js';
import { initDm } from '../lib/dm.js';
import { initGuard } from '../lib/guard.js';

// En ordenador se hojea un libro abierto; en móvil, una libreta de una página. Al cruzar de un tamaño
// al otro, el que aparece se abre por el mismo diseño.
const book = initBook(document.querySelector('[data-book="libro"]'));
const pad = initBook(document.querySelector('[data-book="libreta"]'));
const small = matchMedia('(max-width: 640px)');

small.addEventListener('change', () => {
    if (small.matches) pad.set(book.current);
    else book.set(pad.current);
});

initDm();
initGuard();
