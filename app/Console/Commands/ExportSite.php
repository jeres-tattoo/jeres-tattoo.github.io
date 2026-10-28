<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;

// Exporta la web a HTML estático en dist/ para GitHub Pages. Necesita los assets ya compilados
// (npm run build) y ASSET_URL apuntando a donde se va a servir, p. ej. https://usuario.github.io/Repo.
class ExportSite extends Command
{
    protected $signature = 'site:export {--out=dist}';

    protected $description = 'Genera la web estática en dist/ para publicarla en GitHub Pages';

    public function handle(Kernel $kernel): int
    {
        if (! File::exists(public_path('build/manifest.json'))) {
            $this->error('Faltan los assets compilados: ejecuta npm run build antes.');

            return self::FAILURE;
        }

        $out = base_path($this->option('out'));
        File::deleteDirectory($out);
        File::ensureDirectoryExists($out);

        // Aunque npm run dev esté encendido, la exportación usa siempre los assets compilados.
        Vite::useHotFile(storage_path('framework/export.hot'));
        // Los enlaces entre páginas (route()) salen con el dominio de APP_URL y no con el de la petición
        // simulada, que sería http://localhost.
        URL::forceRootUrl(config('app.url'));
        URL::forceScheme(parse_url(config('app.url'), PHP_URL_SCHEME) ?: 'https');

        // Cada página en su carpeta con un index.html, que es lo que Pages sirve para /biblioteca/.
        foreach (['/' => 'index.html', '/biblioteca' => 'biblioteca/index.html'] as $path => $file) {
            $response = $kernel->handle(Request::create($path));
            if ($response->getStatusCode() !== 200) {
                $this->error("{$path} respondió {$response->getStatusCode()}.");

                return self::FAILURE;
            }
            $html = $response->getContent();
            if (! in_array(parse_url(config('app.url'), PHP_URL_HOST), ['localhost', '127.0.0.1'], true) && preg_match('~//(localhost|127\.0\.0\.1)[:/"]~', $html)) {
                $this->error("{$path} lleva enlaces a localhost.");

                return self::FAILURE;
            }
            File::ensureDirectoryExists(dirname("{$out}/{$file}"));
            File::put("{$out}/{$file}", $html);
        }

        foreach (['build', 'img'] as $dir) {
            File::copyDirectory(public_path($dir), "{$out}/{$dir}");
        }
        foreach (['favicon.ico', 'robots.txt'] as $file) {
            File::copy(public_path($file), "{$out}/{$file}");
        }
        // Sin Jekyll: Pages sirve los archivos tal cual.
        File::put("{$out}/.nojekyll", '');

        $this->info("Web exportada en {$this->option('out')}/");

        return self::SUCCESS;
    }
}
