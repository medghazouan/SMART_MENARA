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
        Schema::create('actions', function (Blueprint $table) {
        $table->id();
        $table->date('date');
        $table->text('intervention');
        $table->unsignedBigInteger('panne_id');
        $table->timestamps();

        $table->foreign('panne_id')
              ->references('id')
              ->on('pannes')
              ->onDelete('cascade');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actions');
    }
};
