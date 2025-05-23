<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\FamilyTree;

class APIInviteRequest extends FormRequest
{
    /**
     * Only the tree’s creator may invite.
     */
    public function authorize(): bool
    {
        $tree = FamilyTree::findOrFail($this->route('familyTree'));
        return $this->user()->id === $tree->creator_id;
    }

    public function rules(): array
    {
        return [
            'email'            => ['required','email','max:255'],
            'relationshipType' => ['required','string','max:255'],
        ];
    }
}
