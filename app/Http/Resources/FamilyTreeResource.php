<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FamilyTreeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'privacy' => $this->privacy,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'creator' => $this->when($this->creator, [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
                'profile_photo' => $this->creator->profile_photo_path ?? null,
            ]),
            'member_count' => $this->when(isset($this->members_count), $this->members_count),
            'members' => FamilyMemberResource::collection($this->whenLoaded('members')),
        ];
    }
}
