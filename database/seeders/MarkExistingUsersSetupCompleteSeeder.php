<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Carbon\Carbon;

class MarkExistingUsersSetupCompleteSeeder extends Seeder
{
    public function run(): void
    {
        User::whereNull('setup_completed_at')
            ->update([
                'setup_completed'    => true,
                'setup_completed_at' => Carbon::now(),
            ]);
    }
}
