@extends('layouts.site', ['assets' => ['resources/css/pages/home.css', 'resources/js/pages/home.js']])

@section('title', 'Jere Soriano, tatuador en Madrid')
@section('description', 'Realismo en negro y gris: escultura clásica, aves y ornamento. Jere Soriano tatúa en Madrid y por temporadas en Múnich.')

@section('content')
<a class="skip" href="#obra">Saltar a la obra</a>

@include('partials.top')

<main>
    {{-- Hero: el arcángel redibujado como un campo de puntos (resources/js/lib/ink-field.js). --}}
    <section class="hero" aria-labelledby="hero-title">
        <canvas class="hero__field" data-ink-field data-src="{{ asset('img/obra/arcangel.jpg') }}" aria-hidden="true"></canvas>
        <div class="hero__copy">
            <h1 id="hero-title" class="hero__name">
                <span>Jere</span>
                <span>Soriano</span>
            </h1>
            <p class="hero__lead">Realismo en negro y gris. Escultura clásica, aves y ornamento, construidos punto a punto sobre la piel.</p>
            <p class="hero__where">Madrid, en Holdfast. Por temporadas en Múnich, en Tattoo Noir.</p>
            <a class="button" href="#cita">Pedir cita</a>
        </div>
        <p class="hero__hint" aria-hidden="true">
            <span class="hero__hint-mouse">Mueve el cursor por el arcángel</span>
            <span class="hero__hint-touch">Pasa el dedo por el arcángel</span>
        </p>
    </section>

    <section id="obra" class="obra" aria-labelledby="obra-title">
        <div class="obra__head">
            <h2 id="obra-title" class="title">Obra</h2>
            <p>Piezas recientes. Pulsa una para verla en color y a mayor tamaño.</p>
        </div>

        <ul class="field" role="list">
            @foreach ($works as $i => $work)
                <li class="field__item" style="--d: {{ $work['depth'] }}" data-depth="{{ $work['depth'] }}">
                    <button class="piece" type="button" data-piece="{{ $i }}" aria-haspopup="dialog">
                        <img src="{{ $work['img'] }}" alt="{{ $work['title'] }}, tatuaje en negro y gris en {{ mb_strtolower($work['place']) }}" width="512" height="640" loading="lazy" decoding="async">
                        <span class="piece__title">{{ $work['title'] }}</span>
                        <span class="piece__meta">{{ $work['place'] }}, {{ $work['date'] }}</span>
                    </button>
                </li>
            @endforeach
        </ul>
    </section>

    {{-- Cada técnica dibujada en vivo a partir de una de sus piezas (resources/js/lib/techniques/). --}}
    <section id="tecnicas" class="tecnicas" aria-labelledby="tecnicas-title">
        <div class="tecnicas__head">
            <h2 id="tecnicas-title" class="title">Técnicas</h2>
            <p>Las cuatro maneras de trabajar de Jere, dibujadas en vivo con sus propias piezas.</p>
        </div>

        <div class="tecnicas__row">
            @foreach ($techniques as $technique)
                <article class="tecnica" aria-labelledby="tecnica-{{ $technique['id'] }}">
                    <canvas class="tecnica__canvas" data-technique="{{ $technique['effect'] }}" data-src="{{ $technique['img'] }}" aria-hidden="true"></canvas>
                    <div class="tecnica__copy">
                        <h3 id="tecnica-{{ $technique['id'] }}" class="tecnica__name">{{ $technique['name'] }}</h3>
                        <p>{{ $technique['text'] }}</p>
                        <p class="tecnica__hint" aria-hidden="true">
                            <span class="hint-mouse">{{ $technique['mouse'] }}</span>
                            <span class="hint-touch">{{ $technique['touch'] }}</span>
                        </p>
                        <button class="link tecnica__piece" type="button" data-piece="{{ $technique['piece'] }}" aria-haspopup="dialog">Ver la pieza: {{ $technique['title'] }}</button>
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <section id="jere" class="jere" aria-labelledby="jere-title">
        {{-- Retrato como planeta; Madrid y Múnich son sus dos lunas. --}}
        <div class="orbit" aria-hidden="true">
            <img class="orbit__planet" src="{{ asset('img/jere.jpg') }}" alt="" width="480" height="640" loading="lazy">
            <div class="orbit__ring">
                @foreach ($jere['studios'] as $studio)
                    <span class="orbit__moon" style="--i: {{ $loop->index }}"><span>{{ $studio['city'] }}</span></span>
                @endforeach
            </div>
        </div>
        <div class="jere__copy">
            <h2 id="jere-title" class="title">Sobre Jere</h2>
            <p>Jere trabaja con aguja fina y punteado. Cada sombra se construye con puntos, uno al lado del otro, hasta que la piel parece mármol, pluma o metal.</p>
            <p>Dibuja cada pieza para la zona del cuerpo donde va a vivir. Casi todo parte de la escultura clásica, de las aves y del ornamento.</p>
            <dl class="studios">
                @foreach ($jere['studios'] as $studio)
                    <div>
                        <dt>{{ $studio['city'] }}</dt>
                        <dd>{{ $studio['role'] }} en <a href="https://www.instagram.com/{{ $studio['instagram'] }}/" rel="noopener noreferrer">{{ $studio['name'] }}</a></dd>
                    </div>
                @endforeach
            </dl>
        </div>
    </section>

    <section id="cita" class="cita" aria-labelledby="cita-title">
        <h2 id="cita-title" class="title">Pedir cita</h2>
        <ol class="steps">
            <li>Escríbele por Instagram con tu idea, la zona del cuerpo y un tamaño aproximado.</li>
            <li>Jere te responde con presupuesto y las fechas libres en Madrid o en Múnich.</li>
        </ol>
        <p class="cita__aside">También tiene diseños ya dibujados y listos para tatuar. Están todos en la biblioteca.</p>
        <div class="cita__actions">
            @include('partials.dm-link', ['class' => 'button', 'label' => 'Escribir a Jere por Instagram', 'message' => \App\Content\Dm::message('cita')])
            <a class="link" href="{{ route('library') }}">Ver diseños disponibles</a>
        </div>
    </section>
</main>

@include('partials.foot')

<dialog class="lightbox" aria-labelledby="lightbox-title" tabindex="-1">
    <figure class="lightbox__figure">
        <img class="lightbox__img" src="" alt="">
        <figcaption>
            <span id="lightbox-title" class="lightbox__title"></span>
            <span class="lightbox__meta"></span>
            <a class="link lightbox__post" href="" target="_blank" rel="noopener noreferrer">Ver en Instagram</a>
        </figcaption>
    </figure>
    <div class="lightbox__controls">
        <button type="button" data-step="-1">Anterior</button>
        <button type="button" data-step="1">Siguiente</button>
        <button type="button" data-close>Cerrar</button>
    </div>
</dialog>

<script type="application/json" id="works-data">@json($viewer)</script>
@endsection
