<?php

// Contenido del portfolio. Sin base de datos: todo vive aquí y las fotos en public/img/obra/{id}.jpg.
return [

    'name' => 'Jere Soriano',
    'instagram' => 'jeres.tattoo',
    'dm' => 'https://ig.me/m/jeres.tattoo',

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

    // Biblioteca: diseños ya dibujados y disponibles para tatuar, uno por cada doble página del libro.
    // Sale de sus historias destacadas «DISPONIBLES 26» y «AVAILABLE DSGN». Imagen en
    // public/img/biblioteca/{id}.jpg, recortada de su lámina; `title` y `text` son opcionales. El id
    // lleva el número que el diseño tiene en la lámina (d26-13) o el orden de la historia (av-04).
    'library' => [
        ['id' => 'd26-01', 'text' => 'Retrato femenino partido en franjas desplazadas, con un marco fino.'],
        ['id' => 'd26-02', 'text' => 'Rostro de mujer fragmentado en planos, con círculos y un marco fino.'],
        ['id' => 'd26-03', 'text' => 'Jarrón con una flor de trazo blanco y una mariposa delante.'],
        ['id' => 'd26-04', 'text' => 'Una figura diminuta en equilibrio sobre los dedos de una mano.'],
        ['id' => 'd26-05', 'text' => 'Busto clásico femenino con un petirrojo sobre la cabeza.'],
        ['id' => 'd26-06', 'text' => 'Busto clásico de perfil con un pájaro posado en el pelo.'],
        ['id' => 'd26-07', 'text' => 'Mujer de espaldas con trenza; de su cabeza brotan magnolias.'],
        ['id' => 'd26-08', 'text' => 'Vasija rota de la que sale una rosa con un ojo.'],
        ['id' => 'd26-09', 'text' => 'Ánfora y rostro masculino unidos por un trazo negro y un círculo.'],
        ['id' => 'd26-10', 'text' => 'Pez de colas largas dentro de un marco fino.'],
        ['id' => 'd26-11', 'text' => 'Rostro masculino cortado por una línea negra a mano alzada.'],
        ['id' => 'd26-13', 'text' => 'Rostro de virgen llorando, con una flor de trazo encima.'],
        ['id' => 'd26-14', 'text' => 'Columna clásica dentro de un marco inclinado.'],
        ['id' => 'd26-15', 'text' => 'Pez dorado atravesando un círculo negro.'],
        ['id' => 'd26-16', 'text' => 'Vasija partida con un caracol y una flor blanca de trazo.'],
        ['id' => 'd26-17', 'text' => 'Orca saltando delante de un jarrón, dentro de un marco.'],
        ['id' => 'd26-19', 'text' => 'Retrato femenino con un círculo blanco y una esfera, dentro de un marco.'],
        ['id' => 'd26-20', 'text' => 'Dos rostros abrazados dentro de un marco inclinado.'],
        ['id' => 'd26-21', 'text' => 'Chico con gorra que se tapa un ojo con una gerbera.'],
        ['id' => 'd26-22', 'text' => 'Mariposa monarca posada en el borde de una vasija.'],
        ['id' => 'd26-23', 'text' => 'Cuervo sobre una vasija agrietada.'],
        ['id' => 'd26-24', 'text' => 'Mano que sostiene una rosa con un ojo en el centro.'],
        ['id' => 'd26-25', 'text' => 'Lirio que nace de una mano, sobre un rectángulo gris.'],
        ['id' => 'd26-26', 'text' => 'Rostro de piedra dentro de un jarrón, con trazos negros.'],
        ['id' => 'd26-27', 'text' => 'Manos de escultura entrelazadas dentro de un marco.'],
        ['id' => 'd26-28', 'text' => 'Cabeza de Zeus partida dentro de un cubo de líneas.'],
        ['id' => 'd26-30', 'text' => 'Rostros de escultura repetidos en forma de mariposa.'],
        ['id' => 'd26-31', 'text' => 'Mariposa hecha con los ojos de una escultura.'],
        ['id' => 'd26-32', 'text' => 'Ojo y labios de escultura en dos piezas, con un círculo.'],
        ['id' => 'd26-33', 'text' => 'Girasol que sale de un jarrón de trazo con un ojo de escultura.'],
        ['id' => 'd26-34', 'text' => 'Busto femenino con margaritas que le salen de la cabeza.'],
        ['id' => 'd26-35', 'text' => 'Calavera con una mariposa sobre los ojos, dentro de un óvalo.'],
        ['id' => 'd26-corazon', 'text' => 'Dos miradas encajadas en un corazón, con lágrimas negras.'],
        ['id' => 'd26-david', 'text' => 'El David con una rosa, caligrafía y una cúpula al fondo.'],
        ['id' => 'd26-guerrero', 'text' => 'Guerrero clásico con rosa, vasija y cuervo sobre un rosetón y caligrafía.'],
        ['id' => 'd26-tigre', 'text' => 'Tigre sobre un guerrero sentado, con una luna y caligrafía.'],
        ['id' => 'av-01', 'text' => 'Gorrión posado en una vasija.'],
        ['id' => 'av-02', 'text' => 'Retrato femenino con un trazo negro que dibuja el cuello.'],
        ['id' => 'av-03', 'text' => 'Perfil femenino mirando arriba, con una línea fina y un círculo negro.'],
        ['id' => 'av-04', 'text' => 'Retrato de mujer con una flor de trazo en el pelo.'],
        ['id' => 'av-05', 'text' => 'Jilguero posado en una mano, sobre un círculo.'],
        ['id' => 'av-06', 'text' => 'Rostro de mujer que se convierte en jarrón, con una rama de trazo.'],
        ['id' => 'av-07', 'text' => 'Jarrón con una flor de trazo y un círculo fino.'],
        ['id' => 'av-08', 'text' => 'Gato trepando por el tallo de una flor que sale de un jarrón.'],
        ['id' => 'av-09', 'text' => 'Figura femenina sentada sobre una esfera, entre marcos.'],
        ['id' => 'av-10', 'text' => 'Flor en un jarrón de cristal sobre bloques grises.'],
        ['id' => 'av-11', 'text' => 'Atlas sosteniendo una esfera.'],
        ['id' => 'av-12', 'text' => 'Retrato femenino con un arco y un marco fino.'],
        ['id' => 'av-13a', 'text' => 'Rostro masculino duplicado, con una flor de trazo.'],
        ['id' => 'av-13b', 'text' => 'Rostro masculino con una flor de trazo que le sale de la cabeza.'],
        ['id' => 'av-14', 'text' => 'Ballena jorobada sobre franjas grises.'],
        ['id' => 'av-15', 'text' => 'Cabeza clásica dentro de un marco desplazado.'],
        ['id' => 'av-16', 'text' => 'Manos de mujer con un círculo fino.'],
        ['id' => 'av-17', 'text' => 'Cuerpo de mujer abrazado dentro de un jarrón, con flores.'],
        ['id' => 'av-18', 'text' => 'Rostro de escultura con una media luna y una rama.'],
        ['id' => 'av-19', 'text' => 'Jarrón con una flor de trazo y flores blancas pintadas.'],
        ['id' => 'av-20', 'text' => 'Vasija de barro con una flor blanca de trazo.'],
        ['id' => 'av-21', 'text' => 'Vasija inclinada con una flor y un tallo blanco.'],
        ['id' => 'av-22', 'text' => 'Busto clásico del que brotan magnolias.'],
        ['id' => 'av-23', 'text' => 'Rostro con los ojos cerrados, geometría y un árbol.'],
        ['id' => 'av-24', 'text' => 'Gorrión sobre una pila de piedras.'],
        ['id' => 'av-25', 'text' => 'Cabeza de Apolo con arquitectura clásica detrás.'],
    ],

    // Sección de técnicas: cada una se dibuja en vivo a partir de una pieza de `works`
    // con su propio efecto (resources/js/lib/techniques/{effect}.js).
    'techniques' => [
        [
            'id' => 'realismo', 'name' => 'Realismo en negro y gris', 'effect' => 'relight', 'work' => 'laureada',
            'text' => 'Volumen sin color. Solo grises, del negro más hondo al tono de la piel, hasta que una cara parece de piedra.',
            'mouse' => 'Mueve el cursor: es la luz', 'touch' => 'Pasa el dedo: es la luz',
        ],
        [
            'id' => 'punteado', 'name' => 'Punteado', 'effect' => 'stipple', 'work' => 'gorrion',
            'text' => 'Sombras hechas solo con puntos, uno junto a otro. Cuantos más puntos, más oscura la zona.',
            'mouse' => 'Pasa el cursor para levantar los puntos', 'touch' => 'Pasa el dedo para levantar los puntos',
        ],
        [
            'id' => 'linea-fina', 'name' => 'Línea fina', 'effect' => 'engrave', 'work' => 'golondrinas',
            'text' => 'Trazos de una sola aguja, finos y limpios. La forma sale de la línea, sin rellenos.',
            'mouse' => 'Pasa el cursor sobre las líneas', 'touch' => 'Pasa el dedo sobre las líneas',
        ],
        [
            'id' => 'ornamental', 'name' => 'Ornamental', 'effect' => 'ink-bloom', 'work' => 'serpiente',
            'text' => 'Escamas, hojas y volutas que siguen la forma del cuerpo y lo recorren.',
            'mouse' => 'Pasa el cursor para apartar la tinta', 'touch' => 'Pasa el dedo para apartar la tinta',
        ],
    ],

];
