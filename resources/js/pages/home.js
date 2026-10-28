import { initInkField } from '../lib/ink-field.js';
import { initDrift } from '../lib/drift.js';
import { initLightbox } from '../lib/lightbox.js';
import { initSpotlight } from '../lib/spotlight.js';
import { initRelight } from '../lib/techniques/relight.js';
import { initStipple } from '../lib/techniques/stipple.js';
import { initEngrave } from '../lib/techniques/engrave.js';
import { initInkBloom } from '../lib/techniques/ink-bloom.js';
import { initDm } from '../lib/dm.js';
import { initGuard } from '../lib/guard.js';

const techniques = { relight: initRelight, stipple: initStipple, engrave: initEngrave, 'ink-bloom': initInkBloom };

initInkField(document.querySelector('[data-ink-field]'));
document.querySelectorAll('[data-technique]').forEach((canvas) => techniques[canvas.dataset.technique](canvas));
initDrift([...document.querySelectorAll('.field__item')]);
initSpotlight([...document.querySelectorAll('.field__item')]);
initLightbox(
    document.querySelector('.lightbox'),
    JSON.parse(document.getElementById('works-data').textContent),
    [...document.querySelectorAll('[data-piece]')],
);

initDm();
initGuard();
