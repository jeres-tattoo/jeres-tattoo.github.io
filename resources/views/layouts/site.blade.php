<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@yield('title')</title>
<meta name="description" content="@yield('description')">
<meta name="theme-color" content="#080a16">
<link rel="icon" href="{{ asset('favicon.ico') }}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{{-- Las fuentes no bloquean el primer pintado: con red móvil lenta, Safari no pintaba nada hasta tenerlas.
     La entrada del texto espera a Gloock y Tenor Sans (html.fonts), como mucho 1,5 s, para no cambiar de letra a mitad. --}}
<script>
document.documentElement.classList.add('js');
window.fontsReady = function () { document.documentElement.classList.add('fonts'); };
setTimeout(window.fontsReady, 1500);
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&amp;family=Hanken+Grotesk:wght@400;500;600&amp;family=Tenor+Sans&amp;display=swap" media="print" onload="this.media='all'; (document.fonts ? Promise.all([document.fonts.load('1em Gloock'), document.fonts.load('1em \'Tenor Sans\'')]) : Promise.resolve()).then(fontsReady, fontsReady)">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&amp;family=Hanken+Grotesk:wght@400;500;600&amp;family=Tenor+Sans&amp;display=swap"></noscript>
@stack('head')
@vite($assets)
</head>
<body>
@yield('content')
</body>
</html>
