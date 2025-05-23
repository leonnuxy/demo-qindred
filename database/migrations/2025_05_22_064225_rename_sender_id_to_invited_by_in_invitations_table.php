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
        Schema::table('invitations', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['sender_id']);
            
            // Rename the column
            $table->renameColumn('sender_id', 'invited_by');
            
            // Add the foreign key constraint back with the new column name
            $table->foreign('invited_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['invited_by']);
            
            // Rename the column back
            $table->renameColumn('invited_by', 'sender_id');
            
            // Add the original foreign key constraint back
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
