<?php

// Contenido del portfolio. Sin base de datos: todo vive aquí y las fotos en public/img/obra/{id}.jpg.
return [

    'name' => 'Jere Soriano',
    'instagram' => 'jeres.tattoo',
    'dm' => 'https://ig.me/m/jeres.tattoo',
    'available' => 'https://www.instagram.com/stories/highlights/17936686530153731/',

    'studios' => [
        ['city' => 'Madrid', 'name' => 'Holdfast', 'instagram' => 'holdfast_es', 'role' => 'Residente'],
        ['city' => 'Múnich', 'name' => 'Tattoo Noir', 'instagram' => 'tattoo_noir_munich', 'role' => 'Invitado'],
    ],

    // Orden del campo de obra. `depth` (0–1) es lo lejos que flota la pieza al hacer scroll.
    'works' => [
        ['id' => 'guantelete', 'title' => 'Guantelete con flor', 'place' => 'Antebrazo', 'date' => 'octubre 2026', 'post' => 'DfChF78CH3D', 'depth' => 0.2],
        ['id' => 'laureada', 'title' => 'Busto laureado', 'place' => 'Hombro', 'date' => 'octubre 2026', 'post' => 'DfADAW8CPHU', 'depth' => 0.7],
        ['id' => 'eros-y-psique', 'title' => 'Eros y Psique', 'place' => 'Antebrazo', 'date' => 'octubre 2026', 'post' => 'DehqPhrCN5e', 'depth' => 0.4],
        ['id' => 'gorrion', 'title' => 'Gorrión y farol', 'place' => 'Brazo', 'date' => 'octubre 2026', 'post' => 'De9LflRCCAr', 'depth' => 0.9],
        ['id' => 'mascaras', 'title' => 'Dos rostros', 'place' => 'Brazo', 'date' => 'octubre 2026', 'post' => 'Deqy95VCCT2', 'depth' => 0.3],
        ['id' => 'golondrinas', 'title' => 'Golondrinas', 'place' => 'Antebrazo', 'date' => 'octubre 2026', 'post' => 'DeMt6GGCKjq', 'depth' => 0.6],
        ['id' => 'serpiente', 'title' => 'Serpiente', 'place' => 'Pecho y hombro', 'date' => 'octubre 2026', 'post' => 'DeEmtz-iDwa', 'depth' => 0.25],
        ['id' => 'tucan', 'title' => 'Tucán', 'place' => 'Muslo', 'date' => 'octubre 2026', 'post' => 'Dd_jbNxCAWL', 'depth' => 0.8],
        ['id' => 'arcangel', 'title' => 'Arcángel', 'place' => 'Brazo', 'date' => 'julio 2025', 'post' => 'DMYUw-ItxV4', 'depth' => 0.45],
        ['id' => 'corazon', 'title' => 'Beso en un corazón', 'place' => 'Antebrazo', 'date' => 'julio 2025', 'post' => 'DMc1IFqoHTt', 'depth' => 0.65],
    ],

];
