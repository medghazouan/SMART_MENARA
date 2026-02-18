<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('superviseur_id');
            $table->unsignedBigInteger('panne_id');
            $table->string('message', 500);
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->foreign('superviseur_id')
                  ->references('matricule')
                  ->on('superviseurs')
                  ->onDelete('cascade');

            $table->foreign('panne_id')
                  ->references('id')
                  ->on('pannes')
                  ->onDelete('cascade');

            $table->index(['superviseur_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
