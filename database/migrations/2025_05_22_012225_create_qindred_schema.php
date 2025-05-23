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
        // Create genders table
    if (!Schema::hasTable('genders')) {
        Schema::create('genders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->timestamps();
        });
    }
        
        // Create users table with all combined fields
    if (!Schema::hasTable('users')) {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->uuid('gender_id')->nullable();
            $table->foreign('gender_id')->references('id')->on('genders')->onDelete('set null');
            $table->date('date_of_birth')->nullable();
            $table->date('date_of_death')->nullable();
            $table->string('role')->default('user');
            $table->string('status')->default('active');
            
            // Added from other migrations
            $table->string('bio')->nullable();
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('profile_photo')->nullable();
            $table->string('avatar_path')->nullable();
            $table->enum('profile_visibility', ['public', 'friends', 'private'])->default('public');
            $table->boolean('is_profile_placeholder')->default(false);
            $table->boolean('is_profile_completed')->default(false);
            
            $table->rememberToken();
            $table->timestamps();
        });
    }



        // Create password_reset_tokens table
    if (!Schema::hasTable('password_reset_tokens')) {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

        // Create sessions table
        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
        }

        // Create family_trees table
        if (!Schema::hasTable('family_trees')) {
            Schema::create('family_trees', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('creator_id');
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('privacy')->default('private'); // private, shared, public
                $table->timestamps();
                $table->foreign('creator_id')->references('id')->on('users')->onDelete('cascade');
            });
    }

        // Create family_members table
        if (!Schema::hasTable('family_members')) {
            Schema::create('family_members', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('family_tree_id');
                $table->uuid('user_id');
                $table->string('role')->default('member'); // member, admin, viewer
                $table->timestamps();
                $table->foreign('family_tree_id')->references('id')->on('family_trees')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['family_tree_id', 'user_id']);
        });
    }

        // Create invitations table
        if (!Schema::hasTable('invitations')) {
            Schema::create('invitations', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('sender_id');
                $table->string('email');
                $table->uuid('family_tree_id');
                $table->string('status')->default('pending'); // pending, accepted, declined
                $table->string('token')->unique();
                $table->string('relationship_type')->nullable();
            $table->timestamps();
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('family_tree_id')->references('id')->on('family_trees')->onDelete('cascade');
        });
        }

        // Create user_relationships table
        if (!Schema::hasTable('user_relationships')) {
            Schema::create('user_relationships', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->uuid('related_user_id');
                $table->string('relationship_type'); // parent, child, spouse, sibling, etc.
                $table->uuid('family_tree_id')->nullable();
                $table->timestamps();
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('related_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('family_tree_id')->references('id')->on('family_trees')->onDelete('cascade');
            $table->unique(['user_id', 'related_user_id', 'relationship_type', 'family_tree_id'], 'unique_relationship');
        });
    }

        // Create families table
        if (!Schema::hasTable('families')) {
            Schema::create('families', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->text('description')->nullable();
                $table->uuid('created_by');
                $table->timestamps();
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Create family_user pivot table
        if (!Schema::hasTable('family_user')) {
            Schema::create('family_user', function (Blueprint $table) {
                $table->uuid('family_id');
                $table->uuid('user_id');
                $table->string('role')->default('member'); // admin, member
                $table->timestamps();
                $table->primary(['family_id', 'user_id']);
                $table->foreign('family_id')->references('id')->on('families')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Create user_connections table
        if (!Schema::hasTable('user_connections')) {
            Schema::create('user_connections', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->uuid('connected_user_id');
                $table->string('status')->default('pending'); // pending, accepted, declined
                $table->timestamps();
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('connected_user_id')->references('id')->on('users')->onDelete('cascade');
                $table->unique(['user_id', 'connected_user_id']);
            });
        }

        // Create personal_access_tokens table
        if (!Schema::hasTable('personal_access_tokens')) {
            Schema::create('personal_access_tokens', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuidMorphs('tokenable');
                $table->string('name');
                $table->string('token', 64)->unique();
                $table->text('abilities')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }
        

        // Create family_tree_logs table
        if (!Schema::hasTable('family_tree_logs')) {
        Schema::create('family_tree_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('family_tree_id');
            $table->uuid('user_id');
            $table->text('action');
            $table->json('details')->nullable();
            $table->timestamps();
            $table->foreign('family_tree_id')->references('id')->on('family_trees')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        }

        // Create cache table
        if (!Schema::hasTable('cache')) {
            Schema::create('cache', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->mediumText('value');
                $table->integer('expiration');
            });
        }

        if (!Schema::hasTable('cache_locks')) {
            Schema::create('cache_locks', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->string('owner');
                $table->integer('expiration');
            });
        }

        // Create jobs table
        if (!Schema::hasTable('jobs')) {
            Schema::create('jobs', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('queue')->index();
                $table->longText('payload');
                $table->unsignedTinyInteger('attempts');
                $table->unsignedInteger('reserved_at')->nullable();
                $table->unsignedInteger('available_at');
                $table->unsignedInteger('created_at');
            });
        }

        if (!Schema::hasTable('failed_jobs')) {
            Schema::create('failed_jobs', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->text('connection');
                $table->text('queue');
                $table->longText('payload');
                $table->longText('exception');
                $table->timestamp('failed_at')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop all tables in reverse order to avoid foreign key constraints
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('family_tree_logs');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('user_connections');
        Schema::dropIfExists('family_user');
        Schema::dropIfExists('families');
        Schema::dropIfExists('user_relationships');
        Schema::dropIfExists('invitations');
        Schema::dropIfExists('family_members');
        Schema::dropIfExists('family_trees');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('genders');
    }
};
