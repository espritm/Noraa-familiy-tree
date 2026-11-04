<?php

use App\Http\Controllers\FamilyAccessController;
use App\Http\Controllers\FamilyTreeController;
use App\Http\Controllers\ResearchMapController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'home')->name('home');

Route::get('/family-tree/login', [FamilyAccessController::class, 'show'])->name('family-access.login');
Route::post('/family-tree/login', [FamilyAccessController::class, 'authenticate'])->name('family-access.authenticate');
Route::post('/family-tree/logout', [FamilyAccessController::class, 'logout'])->name('family-access.logout');

Route::get('/family-tree', [FamilyTreeController::class, 'show'])
    ->middleware('family.access')
    ->name('family-tree');

Route::get('/family-tree/research', [ResearchMapController::class, 'show'])
    ->middleware('family.access')
    ->name('research-map');
