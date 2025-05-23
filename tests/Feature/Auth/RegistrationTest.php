<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms' => true
        ]);

        $response->assertSessionHasNoErrors();
        
        // Check if the user was created
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com'
        ]);
        
        $this->assertAuthenticated();
        $response->assertRedirect('/setup');
    }
}
