<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Gender;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'setup_completed' => true,
        ];
        $gender = Gender::inRandomOrder()->first()?->id;

        return [
            'first_name'              => $this->faker->firstName(),
            'last_name'               => $this->faker->lastName(),
            'email'                   => $this->faker->unique()->safeEmail(),
            'email_verified_at'       => now(),
            'password'                => static::$password ??= Hash::make('password'),
            'remember_token'          => Str::random(10),
            // new fields
            'gender_id'               => $gender,
            'date_of_birth'           => $this->faker->date(),
            'date_of_death'           => null,
            'role'                    => 'user',
            'status'                  => 'active',
            'bio'                     => $this->faker->optional()->paragraph(),
            'phone'                   => $this->faker->optional()->phoneNumber(),
            'city'                    => $this->faker->city(),
            'state'                   => $this->faker->state(),
            'country'                 => $this->faker->country(),
            'profile_photo'           => null,
            'avatar_path'             => null,
            'profile_visibility'      => $this->faker->randomElement(['public','friends','private']),
            'is_profile_placeholder'  => $this->faker->boolean(30),
            'is_profile_completed'    => $this->faker->boolean(80),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
