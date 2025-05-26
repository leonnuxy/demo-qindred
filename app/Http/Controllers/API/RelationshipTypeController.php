<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Enums\RelationshipType;
use Illuminate\Http\Request;

class RelationshipTypeController extends Controller
{
    /**
     * GET /api/relationship-types
     * Return a list of all relationship types with their human-readable labels
     */
    public function index()
    {
        $types = [];
        
        foreach (RelationshipType::cases() as $type) {
            // Make sure we never return empty values
            if (!empty($type->value)) {
                $types[] = [
                    'value' => $type->value,
                    'label' => $this->formatRelationshipLabel($type->value),
                    'reciprocal' => $type->getReciprocal()->value,
                ];
            }
        }
        
        return response()->json($types);
    }
    
    /**
     * Convert relationship_type to human-readable format
     * 
     * @param string $type The relationship type value
     * @return string The formatted label
     */
    private function formatRelationshipLabel(string $type): string
    {
        // Map of special case relationships
        $specialLabels = [
            'aunt_uncle' => 'Aunt/Uncle',
            'niece_nephew' => 'Niece/Nephew',
            'in_law' => 'In-Law',
        ];
        
        // Return special case if exists
        if (isset($specialLabels[$type])) {
            return $specialLabels[$type];
        }
        
        // Format underscore_case to Title Case
        return ucwords(str_replace('_', ' ', $type));
    }
}
