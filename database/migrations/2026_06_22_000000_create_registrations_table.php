<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRegistrationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nama', 100);
            $table->string('telepon', 20);
            $table->text('alamat');
            $table->string('kabupaten', 100);
            $table->string('kecamatan', 100);
            $table->integer('paket_id')->unsigned()->nullable();
            $table->enum('status', ['Baru', 'Diproses', 'Selesai', 'Ditolak'])->default('Baru');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->foreign('paket_id')->references('id')->on('products')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('registrations');
    }
}
