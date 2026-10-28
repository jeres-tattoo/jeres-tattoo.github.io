{{-- Portada de la biblioteca. --}}
<p class="cover__name">{{ $jere['name'] }}</p>
<h2 class="cover__title">Diseños disponibles</h2>
<p class="cover__count">{{ count($designs) }} {{ count($designs) === 1 ? 'diseño' : 'diseños' }}</p>
