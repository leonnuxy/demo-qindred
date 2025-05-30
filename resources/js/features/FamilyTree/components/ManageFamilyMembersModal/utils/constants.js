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
  gender: undefined,
  relationshipToUser: undefined,
  email: '',
  type: MEMBER_MODES.DIRECT,
  spouseId: undefined // For child relationships - specify the other parent
};

export const relationshipCategories = {
  'Immediate Family': ['father', 'mother', 'parent', 'spouse', 'child', 'sibling', 'other']
};

export const MODAL_TABS = {
  EXISTING: 'existing',
  ADD: 'add',
  EDIT: 'edit'
};
