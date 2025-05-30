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
        Schema::table('user_relationships', function (Blueprint $table) {
            // Add fields to track spouse relationships and parent-child connections
            $table->uuid('marriage_id')->nullable()->after('family_tree_id');
            $table->uuid('other_parent_id')->nullable()->after('marriage_id');
            $table->date('relationship_start_date')->nullable()->after('other_parent_id');
            $table->date('relationship_end_date')->nullable()->after('relationship_start_date');
            $table->boolean('is_current')->default(true)->after('relationship_end_date');
            
            // Add index for marriage tracking
            $table->index('marriage_id');
            $table->index('other_parent_id');
        });

        // Create marriages table to track spouse relationships
        Schema::create('marriages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('spouse1_id');
            $table->uuid('spouse2_id');
            $table->uuid('family_tree_id');
            $table->date('marriage_date')->nullable();
            $table->date('divorce_date')->nullable();
            $table->boolean('is_current')->default(true);
            $table->string('marriage_type')->default('marriage'); // marriage, partnership, etc.
            $table->timestamps();

            $table->foreign('spouse1_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('spouse2_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('family_tree_id')->references('id')->on('family_trees')->onDelete('cascade');
            
            // Ensure unique marriages (prevent duplicates)
            $table->unique(['spouse1_id', 'spouse2_id', 'family_tree_id'], 'unique_marriage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_relationships', function (Blueprint $table) {
            $table->dropIndex(['marriage_id']);
            $table->dropIndex(['other_parent_id']);
            $table->dropColumn([
                'marriage_id',
                'other_parent_id', 
                'relationship_start_date',
                'relationship_end_date',
                'is_current'
            ]);
        });

        Schema::dropIfExists('marriages');
    }
};
