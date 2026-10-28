{{-- Última página de la biblioteca, debajo de todas las hojas. --}}
<p class="page__kicker">¿Ninguno es para ti?</p>
<p class="page__lead">Jere también dibuja a medida. Cuéntale tu idea, la zona del cuerpo y un tamaño aproximado.</p>
@include('partials.dm-link', ['class' => 'page__cta', 'label' => 'Escribir a Jere por Instagram', 'message' => \App\Content\Dm::message('custom')])
