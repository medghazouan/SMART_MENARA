<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pannes', function (Blueprint $table) {
            $table->unsignedInteger('heures_compteur')->nullable()->after('plan_action');
        });
    }

    public function down(): void
    {
        Schema::table('pannes', function (Blueprint $table) {
            $table->dropColumn('heures_compteur');
        });
    }
};
