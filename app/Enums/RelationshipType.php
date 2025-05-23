<?php

namespace App\Enums;

use JsonSerializable;

enum RelationshipType: string implements JsonSerializable
{
    case FATHER          = 'father';
    case MOTHER          = 'mother';
    case PARENT          = 'parent';
    case SPOUSE          = 'spouse';
    case CHILD           = 'child';
    case SIBLING         = 'sibling';
    case GRANDPARENT     = 'grandparent';
    case GRANDCHILD      = 'grandchild';
    case AUNT_UNCLE      = 'aunt_uncle';
    case NIECE_NEPHEW    = 'niece_nephew';
    case COUSIN          = 'cousin';
    case IN_LAW          = 'in_law';
    case STEP_PARENT     = 'step_parent';
    case STEP_CHILD      = 'step_child';
    case STEP_SIBLING    = 'step_sibling';
    case FOSTER_PARENT   = 'foster_parent';
    case FOSTER_CHILD    = 'foster_child';
    case ADOPTIVE_PARENT = 'adoptive_parent';
    case ADOPTIVE_CHILD  = 'adoptive_child';
    case OTHER           = 'other';

    /**
     * User‐friendly display name.
     */
    public function getDisplayName(): string
    {
        return match($this) {
            self::FATHER          => 'Father',
            self::MOTHER          => 'Mother',
            self::PARENT          => 'Parent',
            self::SPOUSE          => 'Spouse',
            self::CHILD           => 'Child',
            self::SIBLING         => 'Sibling',
            self::GRANDPARENT     => 'Grandparent',
            self::GRANDCHILD      => 'Grandchild',
            self::AUNT_UNCLE      => 'Aunt/Uncle',
            self::NIECE_NEPHEW    => 'Niece/Nephew',
            self::COUSIN          => 'Cousin',
            self::IN_LAW          => 'In-Law',
            self::STEP_PARENT     => 'Step Parent',
            self::STEP_CHILD      => 'Step Child',
            self::STEP_SIBLING    => 'Step Sibling',
            self::FOSTER_PARENT   => 'Foster Parent',
            self::FOSTER_CHILD    => 'Foster Child',
            self::ADOPTIVE_PARENT => 'Adoptive Parent',
            self::ADOPTIVE_CHILD  => 'Adoptive Child',
            self::OTHER           => 'Other',
        };
    }

    /**
     * Reciprocal relationship.
     */
    public function getReciprocal(): self
    {
        return match($this) {
            self::FATHER, self::MOTHER, self::PARENT  => self::CHILD,
            self::CHILD                                => self::PARENT,
            self::SPOUSE                               => self::SPOUSE,
            self::SIBLING                              => self::SIBLING,
            self::GRANDPARENT                          => self::GRANDCHILD,
            self::GRANDCHILD                           => self::GRANDPARENT,
            self::AUNT_UNCLE                           => self::NIECE_NEPHEW,
            self::NIECE_NEPHEW                         => self::AUNT_UNCLE,
            self::COUSIN                               => self::COUSIN,
            self::IN_LAW                               => self::IN_LAW,
            self::STEP_PARENT                          => self::STEP_CHILD,
            self::STEP_CHILD                           => self::STEP_PARENT,
            self::STEP_SIBLING                         => self::STEP_SIBLING,
            self::FOSTER_PARENT                        => self::FOSTER_CHILD,
            self::FOSTER_CHILD                         => self::FOSTER_PARENT,
            self::ADOPTIVE_PARENT                      => self::ADOPTIVE_CHILD,
            self::ADOPTIVE_CHILD                       => self::ADOPTIVE_PARENT,
            self::OTHER                                => self::OTHER,
        };
    }

    /**
     * JSON serialization returns the raw value.
     */
    public function jsonSerialize(): string
    {
        return $this->value;
    }
}
