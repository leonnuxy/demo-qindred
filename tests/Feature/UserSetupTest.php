<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSetupTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function new_user_gets_redirected_to_setup()
    {
        // Create a fresh user (the seeder may have marked everyone as setup_complete)
        $user = User::factory()->create([
            'setup_completed' => false,
        ]);

        // Explicitly re-save so that even if a seeder ran, this user stays incomplete
        $user->update(['setup_completed' => false]);

        $this->actingAs($user)
             ->get('/dashboard')
             ->assertRedirect('/setup');
    }

    /** @test */
    public function setup_page_loads_for_incomplete_user()
    {
        $user = User::factory()->create(['setup_completed' => false]);
        $user->update(['setup_completed' => false]);

        $this->actingAs($user)
             ->get('/setup')
             ->assertStatus(200)
             ->assertInertia(fn ($page) =>
                 $page->component('Setup/SetupPage')
                      ->where('user.email', $user->email)
                      ->has('relationshipTypes')
             );
    }

    /** @test */
    public function user_can_complete_the_setup_wizard()
    {
        $user = User::factory()->create(['setup_completed' => false]);
        $user->update(['setup_completed' => false]);

        $payload = [
            'firstName'         => 'Jane',
            'lastName'          => 'Doe',
            'birthDate'         => '1990-01-01',
            'gender'            => 'female',
            'phone'             => '555-1234',
            'country'           => 'US',
            'city'              => 'Springfield',
            'state'             => 'IL',
            'bio'               => 'Hello world!',
            'familyName'        => 'Doe Family',
            'familyDescription' => 'Our clan',
            'membersToAdd'      => [],
        ];

        $this->actingAs($user)
             ->post('/setup/complete', $payload)
             ->assertRedirect('/dashboard')
             ->assertSessionHas('success');

        $fresh = $user->fresh();
        $this->assertTrue($fresh->setup_completed);
        $this->assertNotNull($fresh->setup_completed_at);
        $this->assertDatabaseHas('family_trees', [
            'creator_id' => $user->id,
            'name'       => 'Doe Family',
        ]);
    }

    /** @test */
    public function old_users_with_setup_completed_bypass_setup()
    {
        $user = User::factory()->create(['setup_completed' => true]);

        $this->actingAs($user)
             ->get('/dashboard')
             ->assertStatus(200);
    }

    /** @test */
    public function setup_page_does_not_load_for_completed_user()
    {
        $user = User::factory()->create(['setup_completed' => true]);

        $this->actingAs($user)
             ->get('/setup')
             ->assertRedirect('/dashboard');
    }
}
