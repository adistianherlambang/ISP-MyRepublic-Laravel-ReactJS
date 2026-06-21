<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCoveragesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('coverages', function (Blueprint $table) {
            $table->increments('id');
            $table->string('provinsi', 100)->default('Lampung');
            $table->string('kabupaten', 100);
            $table->string('kecamatan', 100);
            $table->enum('status', ['Tersedia', 'Belum Tersedia'])->default('Belum Tersedia');
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->longText('geojson')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('coverages');
    }
}
