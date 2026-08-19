<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/familiy-tree');

Route::view('/familiy-tree', 'family-tree')->name('family-tree');
