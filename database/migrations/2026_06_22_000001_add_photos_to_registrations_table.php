<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPhotosToRegistrationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->string('foto_rumah')->nullable()->after('paket_id');
            $table->string('foto_ktp')->nullable()->after('foto_rumah');
            $table->string('foto_meteran')->nullable()->after('foto_ktp');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropColumn(['foto_rumah', 'foto_ktp', 'foto_meteran']);
        });
    }
}
