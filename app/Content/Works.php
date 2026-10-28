<?php

namespace App\Content;

// Piezas de config/jere.php con su imagen y el enlace a la publicación de Instagram.
class Works
{
    public static function all(): array
    {
        return array_map(fn (array $w) => $w + [
            'img' => asset("img/obra/{$w['id']}.jpg"),
            'url' => "https://www.instagram.com/p/{$w['post']}/",
        ], config('jere.works'));
    }

    // Lo justo que necesita el visor de piezas en el navegador.
    public static function forViewer(array $works): array
    {
        return array_map(fn (array $w) => [
            'img' => $w['img'],
            'title' => $w['title'],
            'meta' => "{$w['place']}, {$w['date']}",
            'url' => $w['url'],
        ], $works);
    }
}
