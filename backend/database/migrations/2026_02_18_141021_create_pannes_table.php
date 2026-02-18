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
        Schema::create('pannes', function (Blueprint $table) {
        $table->id();
        $table->string('zone', 100);
        $table->string('type', 100); // Type of breakdown
        $table->date('date_panne');
        $table->date('date_fin')->nullable();
        $table->enum('status', ['En cours', 'Résolue', 'En attente'])->default('En cours');
        $table->text('plan_action')->nullable();
        $table->unsignedBigInteger('pointeur_id');
        $table->unsignedBigInteger('carriere_id');
        $table->unsignedBigInteger('materiel_id');
        $table->timestamps();

        $table->foreign('pointeur_id')
              ->references('matricule')
              ->on('pointeurs')
              ->onDelete('cascade');
        
        $table->foreign('carriere_id')
              ->references('id')
              ->on('carrieres')
              ->onDelete('cascade');
        
        $table->foreign('materiel_id')
              ->references('matricule')
              ->on('materiels')
              ->onDelete('cascade');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pannes');
    }
};
