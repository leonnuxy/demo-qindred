<?php

namespace App\Services;

use App\Models\User;
use App\Models\FamilyTree;
use App\Services\InvitationService;
use App\Services\FamilyTreeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserSetupService
{
    public function __construct(
        protected InvitationService $invites,
        protected FamilyTreeService $trees
    ) {}

    public function completeUserSetup(User $user, array $data): void
    {
        DB::transaction(function () use ($user, $data) {
            // 1) Update profile
            $user->update([
                'first_name' => $data['firstName'],
                'last_name'  => $data['lastName'],
                'date_of_birth' => $data['birthDate'] ?? null,
                'phone'      => $data['phone'] ?? null,
                'country'    => $data['country'] ?? null,
                'city'       => $data['city'] ?? null,
                'state'      => $data['state'] ?? null,
                'bio'        => $data['bio'] ?? null,
            ]);

            // 2) Create first tree
            $tree = FamilyTree::create([
                'name'        => $data['familyName'],
                'description' => $data['familyDescription'] ?? null,
                'creator_id'  => $user->id,
                'privacy'     => 'private',
            ]);

            // 3) Add members/invites
            foreach ($data['membersToAdd'] ?? [] as $m) {
                try {
                    // Skip placeholder emails or empty emails
                    if (isset($m['email']) && 
                        (strpos($m['email'], 'placeholder-') === 0 || empty(trim($m['email'])))) {
                        // For direct add members with no email, add them directly but ignore the email field
                        if ($m['type'] === 'direct_add') {
                            $memberData = $m;
                            unset($memberData['email']); // Remove empty or placeholder email
                            // Map relationshipToMe to relationshipToUser
                            if (isset($memberData['relationshipToMe'])) {
                                $memberData['relationshipToUser'] = $memberData['relationshipToMe'];
                                unset($memberData['relationshipToMe']);
                            }
                            $this->trees->addDirectMember((int)$tree->id, $memberData);
                        }
                        continue; // Skip invites with placeholder emails
                    }
                    
                    if ($m['type'] === 'invite' && !empty($m['email'])) {
                        $this->invites->send((int)$tree->id, $m['email'], $m['relationshipToMe']);
                    } else if ($m['type'] === 'direct_add') {
                        // Clone the data and map relationshipToMe to relationshipToUser
                        $memberData = $m;
                        if (isset($memberData['relationshipToMe'])) {
                            $memberData['relationshipToUser'] = $memberData['relationshipToMe'];
                            unset($memberData['relationshipToMe']);
                        }
                        $this->trees->addDirectMember((int)$tree->id, $memberData);
                    }
                } catch (\Exception $e) {
                    // Log error but continue with other members
                    Log::warning("Failed to add/invite member during setup", [
                        'tree_id' => $tree->id,
                        'member' => $m,
                        'error' => $e->getMessage()
                    ]);
                    // Don't throw so we don't abort the entire setup
                }
            }

            // 4) Flag complete
            $user->update([
                'setup_completed'    => true,
                'setup_completed_at' => now(),
            ]);
        });
    }

    public function getRelationshipTypes(): array
    {
        return [
            ['value'=>'father','label'=>'Father'],
            ['value'=>'mother','label'=>'Mother'],
            ['value'=>'spouse','label'=>'Spouse'],
            ['value'=>'child','label'=>'Child'],
            ['value'=>'sibling','label'=>'Sibling'],
            ['value'=>'other','label'=>'Other'],
        ];
    }
}
