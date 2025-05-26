<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FamilyMemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        // Get the user's full name components if available
        $firstName = $this->user->first_name ?? null;
        $lastName = $this->user->last_name ?? null;
        
        // Format dates if available
        $dateOfBirth = $this->user->date_of_birth ? $this->user->date_of_birth->toDateString() : null;
        $dateOfDeath = $this->user->date_of_death ? $this->user->date_of_death->toDateString() : null;
        
        return [
            'id' => $this->id,
            'userId' => $this->user->id ?? null,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'role' => $this->role,
            'relationshipToUser' => $this->role, // Using role for backward compatibility
            'email' => $this->user->email ?? null,
            'dateOfBirth' => $dateOfBirth,
            'dateOfDeath' => $dateOfDeath, 
            'isDeceased' => !is_null($dateOfDeath) || ($this->user->status === 'deceased'),
            'gender' => $this->user->gender ? $this->user->gender->name : null,
            'profilePhoto' => $this->user->profile_photo_path ?? null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
