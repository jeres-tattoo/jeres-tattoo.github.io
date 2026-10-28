<?php

namespace App\Content;

// Enlaces al chat de Instagram de Jere con un mensaje ya escrito. Instagram no garantiza rellenar el
// texto del enlace, así que al pulsarlo la página también lo copia (resources/js/lib/dm.js).
class Dm
{
    public static function url(string $message): string
    {
        return config('jere.dm').'?text='.rawurlencode($message);
    }

    // Mensaje de config/jere.php (`messages`) con sus huecos rellenos: :n, :text.
    public static function message(string $key, array $replace = []): string
    {
        return strtr(config("jere.messages.{$key}"), collect($replace)->mapWithKeys(fn ($v, $k) => [":{$k}" => $v])->all());
    }
}
