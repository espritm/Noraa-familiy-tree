<?php

use App\Http\Controllers\FamilyAccessController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'home')->name('home');

Route::get('/familiy-tree/login', [FamilyAccessController::class, 'show'])->name('family-access.login');
Route::post('/familiy-tree/login', [FamilyAccessController::class, 'authenticate'])->name('family-access.authenticate');
Route::post('/familiy-tree/logout', [FamilyAccessController::class, 'logout'])->name('family-access.logout');

Route::view('/familiy-tree', 'family-tree')
    ->middleware('family.access')
    ->name('family-tree');
