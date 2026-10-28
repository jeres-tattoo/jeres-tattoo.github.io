{{-- Enlace al chat de Instagram de Jere con el mensaje ya escrito ($message). Se abre aparte y, al pulsarlo,
     el mensaje se copia por si Instagram no lo rellena. --}}
<a class="{{ $class }}" href="{{ \App\Content\Dm::url($message) }}" data-dm="{{ $message }}" target="_blank" rel="noopener noreferrer">{{ $label }}</a>
