<?php

namespace App\Content;

// Diseños disponibles de config/jere.php con su imagen.
class Library
{
    public static function all(): array
    {
        return array_map(fn (array $d) => $d + [
            'title' => null,
            'text' => null,
            'img' => asset("img/biblioteca/{$d['id']}.jpg"),
        ], config('jere.library'));
    }
}
