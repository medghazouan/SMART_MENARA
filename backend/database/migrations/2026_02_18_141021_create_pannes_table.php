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
            $table->string('type', 100);
            $table->dateTime('date_panne');
            $table->dateTime('date_fin')->nullable();
            $table->enum('status', ['en_cours', 'resolue'])->default('en_cours');
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

            $table->index('materiel_id');
            $table->index('status');
            $table->index('date_panne');
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
