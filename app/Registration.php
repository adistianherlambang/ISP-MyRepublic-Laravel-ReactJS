<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'registrations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nama', 'telepon', 'alamat', 'kabupaten', 'kecamatan', 'paket_id', 'status', 'catatan',
    ];

    /**
     * Get the product/package associated with this registration.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo('App\Product', 'paket_id');
    }
}
