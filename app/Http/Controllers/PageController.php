<?php

namespace App\Http\Controllers;

use App\Content\Techniques;
use App\Content\Works;
use Illuminate\View\View;

class PageController extends Controller
{
    public function home(): View
    {
        $works = Works::all();

        return view('pages.home', [
            'jere' => config('jere'),
            'works' => $works,
            'techniques' => Techniques::all($works),
            'viewer' => Works::forViewer($works),
        ]);
    }
}
