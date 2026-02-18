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
        Schema::create('pointeurs', function (Blueprint $table) {
        $table->id('matricule');
        $table->string('nom', 100);
        $table->string('email', 150)->unique();
        $table->string('phone', 20)->nullable();
        $table->string('password');
        $table->unsignedBigInteger('carriere_id');
        $table->timestamps();

        $table->foreign('carriere_id')
              ->references('id')
              ->on('carrieres')
              ->onDelete('cascade');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointeurs');
    }
};
