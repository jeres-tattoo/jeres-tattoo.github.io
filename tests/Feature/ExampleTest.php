<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_home_shows_every_work(): void
    {
        $response = $this->withoutVite()->get('/');

        $response->assertOk()->assertSee('Jere');
        foreach (config('jere.works') as $work) {
            $response->assertSee($work['title']);
        }
    }
}
