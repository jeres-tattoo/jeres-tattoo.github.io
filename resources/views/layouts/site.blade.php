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
     La entrada del texto espera a Gloock y Tenor Sans (html.fonts), como mucho 1,5 s, para no cambiar de letra a mitad.
     resources/js/boot.js las carga y va en línea; la política de seguridad solo deja correr ese script por su huella. --}}
@php($boot = trim(file_get_contents(resource_path('js/boot.js'))))
@unless (\Illuminate\Support\Facades\Vite::isRunningHot())
{{-- Seguridad: solo se cargan scripts, estilos, fuentes e imágenes de la propia web y de Google Fonts;
     no se puede enviar ningún formulario ni cambiar la base de los enlaces. --}}
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-{{ base64_encode(hash('sha256', $boot, true)) }}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'">
@endunless
<meta name="referrer" content="strict-origin-when-cross-origin">
<script data-fonts="https://fonts.googleapis.com/css2?family=Gloock&amp;family=Hanken+Grotesk:wght@400;500;600&amp;family=Tenor+Sans&amp;display=swap">{!! $boot !!}</script>
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&amp;family=Hanken+Grotesk:wght@400;500;600&amp;family=Tenor+Sans&amp;display=swap"></noscript>
@stack('head')
@vite($assets)
</head>
<body>
@yield('content')
</body>
</html>
