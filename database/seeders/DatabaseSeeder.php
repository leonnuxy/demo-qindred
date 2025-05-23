<?php

namespace Database\Seeders;

use App\Enums\RelationshipType;
use App\Models\Event;
use App\Models\FamilyTree;
use App\Models\FamilyMember;
use App\Models\Memory;
use App\Models\Testimonial;
use App\Models\User;
use Database\Seeders\MarkExistingUsersSetupCompleteSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        //
        // 1) Create (or fetch) the admin user
        //
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'id'         => Str::uuid(),
                'first_name' => 'Admin',
                'last_name'  => 'User',
                'password'   => Hash::make('admin'),
                'role'       => 'admin',
                'status'     => 'active',
            ]
        );

        // Mark existing users as having completed setup
        // This must run before any logic that checks the setup_completed flag
        if ($this->command->option('class') !== 'Database\\Seeders\\MarkExistingUsersSetupCompleteSeeder') {
            $this->call(MarkExistingUsersSetupCompleteSeeder::class);
        }

        //
        // 2) Define your family‐tree seed data
        //
        $familiesData = [
            [
                'name'        => 'Smith Family',
                'description' => 'The Smith family tree dating back to 1950',
                'members'     => [
                    ['John',  'Smith', '1950-05-15'],
                    ['Mary',  'Smith', '1975-08-20'],
                    ['Robert','Smith', '1978-01-05'],
                    ['Alex',  'Smith', '2000-03-10'],
                    ['Emma',  'Smith', '2002-11-27'],
                    ['James', 'Smith', '2005-07-15'],
                ],
            ],
            // …add more trees as needed…
        ];

        foreach ($familiesData as $familyDef) {
            //
            // 2a) Create or fetch the FamilyTree
            //
            $tree = FamilyTree::firstOrCreate(
                ['name' => $familyDef['name']],
                [
                    'id'          => Str::uuid(),
                    'description' => $familyDef['description'],
                    'creator_id'  => $admin->id,
                    'privacy'     => 'private',
                ]
            );

            //
            // 2b) Create or fetch each member user
            //
            $createdUsers = [];
            foreach ($familyDef['members'] as [$first, $last, $dob]) {
                $email = strtolower("$first.$last@example.com");
                $user  = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'id'            => Str::uuid(),
                        'first_name'    => $first,
                        'last_name'     => $last,
                        'password'      => Hash::make('password'),
                        'date_of_birth' => $dob,
                        'role'          => 'user',
                        'status'        => 'active',
                    ]
                );
                $createdUsers[] = $user;
            }

            //
            // 2c) Attach (or fetch) FamilyMember pivots
            //
            foreach ($createdUsers as $user) {
                FamilyMember::firstOrCreate(
                    [
                        'family_tree_id' => $tree->id,
                        'user_id'        => $user->id,
                    ],
                    [
                        'id'   => Str::uuid(),
                        'role' => 'member',
                    ]
                );
            }

            //
            // 2d) Build parent→child relationships in user_relationships
            //
            $root = array_shift($createdUsers);
            foreach ($createdUsers as $child) {
                DB::table('user_relationships')->updateOrInsert(
                    [
                        'user_id'           => $root->id,
                        'related_user_id'   => $child->id,
                        'family_tree_id'    => $tree->id,
                        'relationship_type' => RelationshipType::CHILD->value,
                    ],
                    [
                        'id'         => Str::uuid(),
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }

            //
            // 3) Seed Memories for each user
            //
            foreach ([$root, ...$createdUsers] as $user) {
                for ($i = 1; $i <= 2; $i++) {
                    Memory::firstOrCreate(
                        [
                            'user_id'   => $user->id,
                            'order'     => $i,
                        ],
                        [
                            'id'         => Str::uuid(),
                            'image_path' => "memories/{$user->id}/m{$i}.jpg",
                            'caption'    => "Memory {$i} of {$user->first_name}",
                            'year'       => now()->year - rand(0, 20),
                        ]
                    );
                }
            }

            //
            // 4) Seed a Testimonial for this tree
            //
            Testimonial::firstOrCreate(
                [
                    'user_id'     => $admin->id,
                    'author_title'=> $tree->name,
                ],
                [
                    'id'           => Str::uuid(),
                    'author_name'  => 'Family Historian',
                    'body'         => "“I love tracing our {$tree->name}! This platform made it so easy.”",
                ]
            );

            //
            // 5) Seed an Event for the creator
            //
            Event::firstOrCreate(
                [
                    'user_id'    => $admin->id,
                    'title'      => 'Family Reunion',
                ],
                [
                    'id'          => Str::uuid(),
                    'event_date'  => now()->subYears(10),
                    'description' => "The first reunion of the {$tree->name}.",
                ]
            );
        }
    }
}
