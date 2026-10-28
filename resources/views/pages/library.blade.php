@extends('layouts.site', ['assets' => ['resources/css/pages/library.css', 'resources/js/pages/library.js']])

@section('title', 'Biblioteca de diseños disponibles, Jere Soriano')
@section('description', 'Diseños de Jere Soriano ya dibujados y listos para tatuar, en un libro que se hojea página a página.')

@section('content')
<a class="skip" href="#libro">Saltar al libro</a>

@include('partials.top')

<main class="library">
    <div class="library__head">
        <h1 class="title">Biblioteca</h1>
        <p>Diseños ya dibujados y listos para tatuar. Pasa las páginas y, si uno es para ti, pídeselo a Jere.</p>
    </div>

    <div id="libro">
        {{-- Libro (ordenador): cada hoja tiene dos caras. Delante, la página derecha de un pliego; detrás, la
             izquierda del siguiente. Así cada diseño ocupa un pliego entero: el dibujo a la izquierda y su texto
             a la derecha. Lo mueve resources/js/lib/book.js. --}}
        <section class="book book--spread" aria-label="Libro de diseños" data-book="libro" data-axis="y">
            <div class="book__pages">
                {{-- Contraportada interior: queda debajo de todas las hojas y se ve al llegar al final. --}}
                <div class="page page--right page--end">
                    @include('partials.library-end')
                </div>

                {{-- Portada. --}}
                <div class="leaf" data-leaf>
                    <div class="page page--right page--cover">
                        @include('partials.library-cover')
                    </div>
                    @include('partials.design-figure', ['design' => $designs[0] ?? null, 'number' => 1])
                </div>

                @foreach ($designs as $i => $design)
                    <div class="leaf" data-leaf>
                        <div class="page page--right page--text">
                            <p class="page__number">Nº {{ str_pad($i + 1, 2, '0', STR_PAD_LEFT) }}</p>
                            @include('partials.design-copy')
                        </div>
                        @if (isset($designs[$i + 1]))
                            @include('partials.design-figure', ['design' => $designs[$i + 1], 'number' => $i + 2])
                        @else
                            <div class="page page--left page--colophon">
                                <p class="page__kicker">Fin del libro</p>
                                <p class="page__text">Cada diseño se tatúa una sola vez. Cuando alguien lo reserva, sale del libro.</p>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>

            @include('partials.library-nav')
        </section>

        {{-- Libreta (móvil): una página por diseño, con el dibujo arriba y su texto al pie. Las hojas están
             cosidas por arriba y se levantan hacia arriba; detrás solo hay papel. --}}
        <section class="book book--pad" aria-label="Libreta de diseños" data-book="libreta" data-axis="x">
            <div class="book__pages">
                <div class="page page--end">
                    @include('partials.library-end')
                </div>

                <div class="leaf" data-leaf>
                    <div class="page page--cover">
                        @include('partials.library-cover')
                    </div>
                    <div class="page page--back"></div>
                </div>

                @foreach ($designs as $i => $design)
                    <div class="leaf" data-leaf>
                        <article class="page page--sheet">
                            <figure class="sheet__figure">
                                <img data-src="{{ $design['img'] }}" alt="{{ $design['title'] ?? 'Diseño disponible nº '.($i + 1) }}" decoding="async">
                            </figure>
                            <div class="sheet__caption">
                                <p class="page__number">Nº {{ str_pad($i + 1, 2, '0', STR_PAD_LEFT) }}</p>
                                @include('partials.design-copy')
                            </div>
                        </article>
                        <div class="page page--back"></div>
                    </div>
                @endforeach
            </div>

            @include('partials.library-nav')
        </section>
    </div>
</main>

@include('partials.foot')
@endsection
