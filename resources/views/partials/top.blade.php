{{-- Cabecera de todas las páginas. Fuera de la portada, las secciones enlazan a la portada. --}}
@php($home = request()->routeIs('home') ? '' : route('home').'/')
<header class="top">
    <nav class="top__nav" aria-label="Secciones">
        <a href="{{ $home }}#obra">Obra</a>
        <a href="{{ $home }}#tecnicas">Técnicas</a>
        <a href="{{ route('library') }}" @if (request()->routeIs('library')) aria-current="page" @endif>Biblioteca</a>
        <a href="{{ $home }}#jere">Sobre Jere</a>
        <a href="{{ $home }}#cita">Pedir cita</a>
    </nav>
    <a class="top__ig" href="https://www.instagram.com/{{ $jere['instagram'] }}/" rel="noopener noreferrer">{{ '@'.$jere['instagram'] }}</a>
</header>
