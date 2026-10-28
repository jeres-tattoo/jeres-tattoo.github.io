import { initInkField } from '../lib/ink-field.js';
import { initDrift } from '../lib/drift.js';
import { initLightbox } from '../lib/lightbox.js';

initInkField(document.querySelector('[data-ink-field]'));
initDrift([...document.querySelectorAll('.field__item')]);
initLightbox(
    document.querySelector('.lightbox'),
    JSON.parse(document.getElementById('works-data').textContent),
    [...document.querySelectorAll('[data-piece]')],
);
