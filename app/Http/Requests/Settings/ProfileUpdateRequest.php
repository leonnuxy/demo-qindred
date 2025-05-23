<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
{
    return [
        'first_name'           => ['required','string','max:255'],
        'last_name'            => ['required','string','max:255'],
        'email'                => [
            'required','string','email','max:255',
            Rule::unique(User::class)->ignore($this->user()->id),
        ],
        'bio'                  => ['nullable','string','max:1000'],
        'phone'                => ['nullable','string','max:20'],
        'city'                 => ['nullable','string','max:100'],
        'state'                => ['nullable','string','max:100'],
        'country'              => ['nullable','string','max:100'],
        'profile_visibility'   => ['in:public,friends,private'],
        // 'avatar_path'        => ['nullable','image','max:2048'], // when we handle file uploads
    ];
}

}
