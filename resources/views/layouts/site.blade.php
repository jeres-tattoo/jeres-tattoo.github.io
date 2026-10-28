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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&amp;family=Hanken+Grotesk:wght@400;500;600&amp;display=swap">
@vite($assets)
</head>
<body>
@yield('content')
</body>
</html>
