<?php

namespace App\Content;

// Técnicas de config/jere.php con la foto de su pieza y su posición en el visor de piezas.
class Techniques
{
    public static function all(array $works): array
    {
        $index = array_flip(array_column($works, 'id'));

        return array_map(fn (array $t) => $t + [
            'img' => $works[$index[$t['work']]]['img'],
            'title' => $works[$index[$t['work']]]['title'],
            'piece' => $index[$t['work']],
        ], config('jere.techniques'));
    }
}
