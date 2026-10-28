{{-- Título (si lo tiene), descripción y enlace para pedir un diseño de la biblioteca. --}}
@if ($design['title'])
    <h2 class="page__title">{{ $design['title'] }}</h2>
@endif
@if ($design['text'])
    <p class="page__text">{{ $design['text'] }}</p>
@endif
@include('partials.dm-link', ['class' => 'page__cta', 'label' => 'Pedir este diseño', 'message' => \App\Content\Dm::message('design', ['n' => $i + 1, 'text' => \Illuminate\Support\Str::limit(rtrim($design['title'] ?? $design['text'] ?? '', '.'), 60)])])
