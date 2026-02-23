<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrieres', function (Blueprint $table) {
            $table->decimal('heures_par_jour', 4, 1)->default(10.0)->after('region');
        });
    }

    public function down(): void
    {
        Schema::table('carrieres', function (Blueprint $table) {
            $table->dropColumn('heures_par_jour');
        });
    }
};
