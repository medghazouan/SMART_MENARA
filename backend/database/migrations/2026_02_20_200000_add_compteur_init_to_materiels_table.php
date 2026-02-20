<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materiels', function (Blueprint $table) {
            $table->unsignedInteger('compteur_init')->nullable()->after('categorie');
        });
    }

    public function down(): void
    {
        Schema::table('materiels', function (Blueprint $table) {
            $table->dropColumn('compteur_init');
        });
    }
};
