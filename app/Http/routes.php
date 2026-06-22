<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

// Guest API Routes
Route::post('/api/login', 'AuthController@login');
Route::get('/api/products', 'ProductController@index');
Route::get('/api/coverage', 'CoverageController@index');
Route::post('/api/coverage/check', 'CoverageController@check');
Route::get('/api/stats', 'AuthController@stats');

// Public Registration (calon pelanggan)
Route::post('/api/registrations', 'RegistrationController@store');

// Protected Admin API Routes
Route::group(['middleware' => ['admin.auth']], function () {
    Route::post('/api/logout', 'AuthController@logout');
    Route::get('/api/me', 'AuthController@me');
    
    // Product CRUD
    Route::post('/api/products', 'ProductController@store');
    Route::put('/api/products/{id}', 'ProductController@update');
    Route::delete('/api/products/{id}', 'ProductController@destroy');

    // Coverage CRUD
    Route::post('/api/coverage', 'CoverageController@store');
    Route::put('/api/coverage/{id}', 'CoverageController@update');
    Route::delete('/api/coverage/{id}', 'CoverageController@destroy');

    // Registration Management (admin)
    Route::get('/api/registrations', 'RegistrationController@index');
    Route::get('/api/registrations/{id}', 'RegistrationController@show');
    Route::put('/api/registrations/{id}', 'RegistrationController@update');
    Route::delete('/api/registrations/{id}', 'RegistrationController@destroy');
});
