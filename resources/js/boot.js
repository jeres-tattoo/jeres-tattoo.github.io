(function () {
    var root = document.documentElement;
    root.classList.add('js');
    // Nadie puede meter la web dentro de la suya en un marco: si pasa, se abre sola o no se ve.
    try { if (top !== self) top.location = self.location.href; } catch (e) { root.style.display = 'none'; }
    var ready = function () { root.classList.add('fonts'); };
    setTimeout(ready, 1500);
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = document.currentScript.dataset.fonts;
    link.onload = function () {
        (document.fonts ? Promise.all([document.fonts.load('1em Gloock'), document.fonts.load("1em 'Tenor Sans'")]) : Promise.resolve()).then(ready, ready);
    };
    document.head.append(link);
})();
