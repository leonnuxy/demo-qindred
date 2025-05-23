<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteSetupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'firstName'     => 'required|string|max:255',
            'lastName'      => 'required|string|max:255',
            'birthDate'     => 'nullable|date',
            'gender'        => 'nullable|string|in:male,female,other,prefer_not_to_say',
            'phone'         => 'nullable|string|max:20',
            'country'       => 'nullable|string|size:2',
            'city'          => 'nullable|string|max:100',
            'state'         => 'nullable|string|max:100',
            'bio'           => 'nullable|string|max:2000',
            'familyName'    => 'required|string|max:255',
            'familyRole'    => 'required|string',
            'familyDescription'=>'nullable|string|max:1000',
            'membersToAdd'  => 'nullable|array',
            'membersToAdd.*.type'            => 'required|in:invite,direct_add',
            'membersToAdd.*.email'           => 'nullable|email|required_if:membersToAdd.*.type,invite',
            'membersToAdd.*.firstName'       => 'required_if:membersToAdd.*.type,direct_add|nullable|string|max:255',
            'membersToAdd.*.lastName'        => 'required_if:membersToAdd.*.type,direct_add|nullable|string|max:255',
            'membersToAdd.*.relationshipToMe'=> 'required|string',
        ];
    }
}
