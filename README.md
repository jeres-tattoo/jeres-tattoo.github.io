# Jere Soriano

Portfolio de Jere Soriano ([@jeres.tattoo](https://www.instagram.com/jeres.tattoo/)), tatuador en Madrid y Múnich.

Laravel 12 + Blade + Vite, con CSS y JS vanilla por página. Sin base de datos: el contenido vive en `config/jere.php` y las fotos en `public/img/obra/`.

## En local

```bash
composer setup
npm run dev
```

La web queda en http://127.0.0.1:8010.

## Publicación

Cada push a `main` la publica en GitHub Pages (`.github/workflows/pages.yml`). Como Pages solo sirve archivos estáticos, el workflow compila los assets y exporta la portada a HTML con `php artisan site:export`.

## Añadir o cambiar piezas

1. Guarda la foto en `public/img/obra/{id}.jpg`.
2. Añade la pieza en `config/jere.php` con su título, zona, fecha, publicación de Instagram y profundidad (`depth`, de 0 a 1).
