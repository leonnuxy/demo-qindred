<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered()
    {
        $this->markTestSkipped('Email verification is currently auto-verified');
    }

    public function test_email_can_be_verified()
    {
        $this->markTestSkipped('Email verification is currently auto-verified');
    }

    public function test_email_is_not_verified_with_invalid_hash()
    {
        $this->markTestSkipped('Email verification is currently auto-verified');
    }
}
