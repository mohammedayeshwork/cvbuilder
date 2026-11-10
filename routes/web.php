<?php

use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DocumentController::class, 'index'])->name('dashboard');

    Route::post('documents', [DocumentController::class, 'store'])->name('documents.store');

    Route::controller(DocumentController::class)
        ->prefix('documents/{document}')
        ->name('documents.')
        ->group(function () {
            Route::get('edit', 'edit')->name('edit')->can('update', 'document');
            Route::patch('/', 'update')->name('update')->can('update', 'document');
            Route::patch('title', 'rename')->name('rename')->can('update', 'document');
            Route::post('duplicate', 'duplicate')->name('duplicate')->can('view', 'document');
            Route::delete('/', 'destroy')->name('destroy')->can('delete', 'document');
        });
});

require __DIR__.'/settings.php';
