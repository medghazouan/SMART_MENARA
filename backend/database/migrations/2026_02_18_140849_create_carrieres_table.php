<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('carrieres', function (Blueprint $table) {
        $table->id();
        $table->string('nom', 100);
        $table->string('region', 100)->nullable();
        $table->unsignedBigInteger('superviseur_id');
        $table->timestamps();

        $table->foreign('superviseur_id')
              ->references('matricule')
              ->on('superviseurs')
              ->onDelete('cascade');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carrieres');
    }
};
