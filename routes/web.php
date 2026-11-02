<?php

use App\Http\Controllers\FamilyAccessController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'home')->name('home');

Route::get('/family-tree/login', [FamilyAccessController::class, 'show'])->name('family-access.login');
Route::post('/family-tree/login', [FamilyAccessController::class, 'authenticate'])->name('family-access.authenticate');
Route::post('/family-tree/logout', [FamilyAccessController::class, 'logout'])->name('family-access.logout');

Route::view('/family-tree', 'family-tree')
    ->middleware('family.access')
    ->name('family-tree');
