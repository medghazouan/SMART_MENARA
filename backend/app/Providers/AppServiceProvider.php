<?php

namespace App\Providers;

use App\Models\Panne;
use App\Observers\PanneObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Panne::observe(PanneObserver::class);
    }
}
