// Los dibujos de Jere no se pueden arrastrar ni guardar con el menú del botón derecho o la pulsación larga.
// No impide una captura de pantalla, pero quita el atajo de «Guardar imagen».
export function initGuard() {
    const art = (e) => e.target.closest?.('img, canvas');
    addEventListener('contextmenu', (e) => { if (art(e)) e.preventDefault(); });
    addEventListener('dragstart', (e) => { if (art(e)) e.preventDefault(); });
}
