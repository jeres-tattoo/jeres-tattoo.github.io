{{-- Título (si lo tiene), descripción y enlace para pedir un diseño de la biblioteca. --}}
@if ($design['title'])
    <h2 class="page__title">{{ $design['title'] }}</h2>
@endif
@if ($design['text'])
    <p class="page__text">{{ $design['text'] }}</p>
@endif
<a class="page__cta" href="{{ $jere['dm'] }}" rel="noopener">Pedir este diseño</a>
