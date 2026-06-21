<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Coverage extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'coverages';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'provinsi', 'kabupaten', 'kecamatan', 'status', 'latitude', 'longitude', 'geojson',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];
}
