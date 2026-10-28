{{-- Página izquierda de un pliego de la biblioteca: el dibujo, impreso sobre el papel. --}}
<figure class="page page--left page--figure">
    @if ($design)
        <img data-src="{{ $design['img'] }}" alt="{{ $design['title'] ?? 'Diseño disponible nº '.$number }}" decoding="async" draggable="false">
    @endif
</figure>
