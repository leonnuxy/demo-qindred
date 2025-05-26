export const MEMBER_MODES = {
  DIRECT: 'direct',
  INVITE: 'invite'
};

export const initialMemberState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  dateOfDeath: '',
  isDeceased: false,
  gender: '',
  relationshipToUser: '',
  email: '',
  addMode: MEMBER_MODES.DIRECT
};

export const relationshipCategories = {
  'Immediate Family': ['father', 'mother', 'parent', 'spouse', 'child', 'sibling'],
  'Extended Family': ['grandparent', 'grandchild', 'aunt_uncle', 'niece_nephew', 'cousin'],
  'In-Laws & Step Family': ['in_law', 'step_parent', 'step_child', 'step_sibling'],
  'Other Relationships': ['foster_parent', 'foster_child', 'adoptive_parent', 'adoptive_child', 'other']
};

export const MODAL_TABS = {
  EXISTING: 'existing',
  ADD: 'add',
  EDIT: 'edit'
};
