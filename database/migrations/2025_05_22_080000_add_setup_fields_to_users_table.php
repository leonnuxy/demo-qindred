<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            // Track setup - these are likely new
            if (!Schema::hasColumn('users', 'setup_completed')) {
                $table->boolean('setup_completed')->default(false)->after('email_verified_at');
            }
            
            if (!Schema::hasColumn('users', 'setup_completed_at')) {
                $table->timestamp('setup_completed_at')->nullable()->after('setup_completed');
            }

            // Only add profile fields if they don't exist
            // First check which columns already exist
            $columnsToAdd = [
                'first_name' => 'string',
                'last_name' => 'string',
                'date_of_birth' => 'date',
                'phone' => 'string',
                'country' => 'string',
                'city' => 'string', 
                'state' => 'string',
                'bio' => 'text'
            ];
            
            $lastColumn = 'name'; // Start after this column
            
            foreach ($columnsToAdd as $column => $type) {
                if (!Schema::hasColumn('users', $column)) {
                    if ($type === 'string') {
                        if ($column === 'phone') {
                            $table->string($column, 20)->nullable()->after($lastColumn);
                        } elseif ($column === 'country') {
                            $table->string($column, 2)->nullable()->after($lastColumn);
                        } else {
                            $table->string($column)->nullable()->after($lastColumn);
                        }
                    } elseif ($type === 'date') {
                        $table->date($column)->nullable()->after($lastColumn);
                    } elseif ($type === 'text') {
                        $table->text($column)->nullable()->after($lastColumn);
                    }
                }
                
                // Update the last column name for proper ordering
                if (Schema::hasColumn('users', $column)) {
                    $lastColumn = $column;
                }
            }

            // Add indexes if they don't exist
            // Note: These methods are safe to call multiple times as Laravel checks if indexes exist
            $table->index('setup_completed');
            $table->index(['first_name','last_name']);
            $table->index('country');
            $table->index('city');
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            // Drop indexes - Laravel will handle errors if they don't exist
            try {
                $table->dropIndex(['setup_completed']);
                $table->dropIndex(['first_name','last_name']);
                $table->dropIndex(['country']);
                $table->dropIndex(['city']);
            } catch (\Exception $e) {
                // Ignore errors if indexes don't exist
            }
            
            // Drop columns if they exist
            $columns = [
                'setup_completed','setup_completed_at',
                'first_name','last_name','date_of_birth',
                'phone','country','city','state','bio',
            ];
            
            $columnsToRemove = [];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $columnsToRemove[] = $column;
                }
            }
            
            if (!empty($columnsToRemove)) {
                $table->dropColumn($columnsToRemove);
            }
        });
    }
};
