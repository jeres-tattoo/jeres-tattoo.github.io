// Enlaces al chat de Instagram con mensaje (partials/dm-link). Instagram no siempre rellena el texto del
// enlace, así que al pulsarlo se copia y un aviso dice que basta con pegarlo.
export function initDm() {
    const links = document.querySelectorAll('a[data-dm]');
    if (!links.length) return;

    const toast = document.createElement('p');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
    let hide;

    links.forEach((link) => link.addEventListener('click', () => {
        navigator.clipboard?.writeText(link.dataset.dm).then(() => {
            toast.textContent = 'Mensaje copiado. Si el chat sale vacío, pégalo.';
            toast.classList.add('is-shown');
            clearTimeout(hide);
            hide = setTimeout(() => toast.classList.remove('is-shown'), 5000);
        }, () => {});
    }));
}
