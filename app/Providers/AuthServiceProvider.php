<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\FamilyTree;
use App\Policies\FamilyTreePolicy;
use App\Models\Invitation;
use App\Policies\InvitationPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Map your models to their policies.
     */
    protected $policies = [
        FamilyTree::class  => FamilyTreePolicy::class,
        Invitation::class => InvitationPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();
    }
}
