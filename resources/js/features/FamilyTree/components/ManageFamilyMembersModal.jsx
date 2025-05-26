import React, { useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembersList } from './ManageFamilyMembersModal/components/MembersList';
import { MemberForm } from './ManageFamilyMembersModal/components/MemberForm';
import { DeleteMemberDialog } from './ManageFamilyMembersModal/components/DeleteMemberDialog';
import { useFamilyMembers } from './ManageFamilyMembersModal/hooks/useFamilyMembers';
import { useMemberForm } from './ManageFamilyMembersModal/hooks/useMemberForm';

// Constants have been moved to utils/constants.js

export default function ManageFamilyMembersModal({ 
  isOpen, 
  onClose,
  familyMembers: initialFamilyMembers = [],
  familyTreeId,
  relationshipTypes = [],
  onAddMember,
  onUpdateMember,
  onDeleteMember
}) {
  const {
    familyMembers,
    isLoading,
    searchTerm,
    setSearchTerm,
    relationshipFilter,
    setRelationshipFilter,
    filteredMembers,
    handleMemberDeletion,
    loadFamilyMembers,
    handleMemberAddition,
    handleMemberUpdate
  } = useFamilyMembers({
    initialFamilyMembers,
    familyTreeId,
    onAddMember,
    onUpdateMember,
    onDeleteMember
  });

  const {
    activeTab,
    setActiveTab,
    editingMember,
    setEditingMember,
    newMember,
    setNewMember,
    memberToDelete,
    setMemberToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleInputChange,
    handleSelectChange,
    startEditMember,
    cancelEdit,
    resetForm
  } = useMemberForm();

  // Effects for modal state management
  useEffect(() => {
    if (isOpen && familyTreeId) {
      loadFamilyMembers();
      resetForm();
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, familyTreeId]);

  // Default relationship types based on the backend enum
const DEFAULT_RELATIONSHIP_TYPES = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'parent', label: 'Parent' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'aunt_uncle', label: 'Aunt/Uncle' },
  { value: 'niece_nephew', label: 'Niece/Nephew' },
  { value: 'cousin', label: 'Cousin' },
  { value: 'in_law', label: 'In-Law' },
  { value: 'step_parent', label: 'Step Parent' },
  { value: 'step_child', label: 'Step Child' },
  { value: 'step_sibling', label: 'Step Sibling' },
  { value: 'foster_parent', label: 'Foster Parent' },
  { value: 'foster_child', label: 'Foster Child' },
  { value: 'adoptive_parent', label: 'Adoptive Parent' },
  { value: 'adoptive_child', label: 'Adoptive Child' },
  { value: 'other', label: 'Other' }
];

const availableRelationshipTypes = useMemo(() => {
  // If no relationship types are provided, use the defaults
  if (!Array.isArray(relationshipTypes) || relationshipTypes.length === 0) {
    return DEFAULT_RELATIONSHIP_TYPES;
  }
  
  // Filter out any invalid values and ensure proper structure
  const validTypes = relationshipTypes.filter(rt => 
    rt && 
    typeof rt === 'object' && 
    rt.value && 
    typeof rt.value === 'string' && 
    rt.value.trim() !== '' &&
    rt.label && 
    typeof rt.label === 'string'
  );

  return validTypes.length > 0 ? validTypes : DEFAULT_RELATIONSHIP_TYPES;
}, [relationshipTypes]);

  // Default relationship types if none are available
  const defaultRelationshipTypes = [
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' }
  ];

  const relationshipTypesToShow = availableRelationshipTypes.length > 0 
    ? availableRelationshipTypes 
    : defaultRelationshipTypes;

  // This is a duplicate and can be removed since we already have filteredMembers working
  // Keep this commented out for reference
  /* const filteredFamilyMembers = useMemo(() => {
    return familyMembers.filter(member => {
      const matchesSearchTerm = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || member.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRelationshipFilter = relationshipFilter ? member.relationshipToUser === relationshipFilter : true;
      return matchesSearchTerm && matchesRelationshipFilter;
    });
  }, [familyMembers, searchTerm, relationshipFilter]); */

  const renderMemberFormFields = (memberData, setMemberDataFunction, formPrefix = "") => (
    <>
      {/* Show email field only when adding a new member in 'invite' mode */}
      {formPrefix === "new-" && memberData.addMode === 'invite' && (
        <div>
          <Label htmlFor={`${formPrefix}email`} className="form-label">Member's Email *</Label>
          <Input
            type="email" id={`${formPrefix}email`} name="email"
            value={memberData.email} 
            onChange={(e) => handleInputChange(e, setMemberDataFunction)}
            placeholder="Enter email address to invite" 
            className="mt-1"
          />
        </div>
      )}

      {/* Show these fields for 'direct' add mode OR when editing an existing member (editingMember is not null) */}
      {(memberData.addMode === 'direct' || formPrefix === "edit-") && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${formPrefix}firstName`} className="form-label">First Name *</Label>
              <Input 
                type="text" id={`${formPrefix}firstName`} name="firstName" 
                value={memberData.firstName} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor={`${formPrefix}lastName`} className="form-label">Last Name *</Label>
              <Input 
                type="text" id={`${formPrefix}lastName`} name="lastName" 
                value={memberData.lastName} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="mt-1" 
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`${formPrefix}dateOfBirth`} className="form-label">Date of Birth</Label>
            <Input 
              type="date" id={`${formPrefix}dateOfBirth`} name="dateOfBirth" 
              value={memberData.dateOfBirth} 
              onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
              className="mt-1" 
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id={`${formPrefix}isDeceased`} name="isDeceased" 
              checked={memberData.isDeceased} 
              onCheckedChange={(checked) => handleSelectChange('isDeceased', Boolean(checked), setMemberDataFunction)} 
            />
            <Label htmlFor={`${formPrefix}isDeceased`} className="mb-0 cursor-pointer form-label">Deceased</Label>
          </div>
          {memberData.isDeceased && (
            <div>
              <Label htmlFor={`${formPrefix}dateOfDeath`} className="form-label">Date of Death</Label>
              <Input 
                type="date" id={`${formPrefix}dateOfDeath`} name="dateOfDeath" 
                value={memberData.dateOfDeath} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="mt-1" 
              />
            </div>
          )}
          <div>
            <Label htmlFor={`${formPrefix}gender`} className="form-label">Gender</Label>
            <Select 
              name="gender" 
              value={memberData.gender || ''} 
              onValueChange={(value) => handleSelectChange('gender', value, setMemberDataFunction)}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Display email for existing members being edited, but make it read-only if it's not meant to be changed here */}
          {formPrefix === "edit-" && memberData.email && (
             <div>
                <Label htmlFor={`${formPrefix}email-display`} className="form-label">Email (if applicable)</Label>
                <Input
                    type="email" id={`${formPrefix}email-display`} name="email"
                    value={memberData.email}
                    readOnly
                    className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
             </div>
          )}
        </>
      )}
      {/* Relationship to user section */}
      <div className="mb-5">
        <Label htmlFor={`${formPrefix}relationshipToUser`} className="block mb-2">Relationship to you <span className="text-red-500">*</span></Label>
        <Select 
          name="relationshipToUser" 
          value={memberData.relationshipToUser || ''} 
          onValueChange={(value) => handleSelectChange('relationshipToUser', value, setMemberDataFunction)}
          required
        >
          <SelectTrigger id={`${formPrefix}relationshipToUser`} className="w-full">
            <SelectValue placeholder="Select relationship" />
          </SelectTrigger>
          <SelectContent>
            {/* Group relationship types by category */}
            {Object.entries(relationshipCategories).map(([category, types]) => {
              // Get relationship types for this category
              const categoryTypes = availableRelationshipTypes.filter(rt => types.includes(rt.value));
              
              // Only render the group if it has items
              return categoryTypes.length > 0 ? (
                <SelectGroup key={category}>
                  <SelectLabel className="text-sm font-semibold">
                    {category}
                  </SelectLabel>
                  {categoryTypes.map(rt => (
                    <SelectItem key={rt.value} value={rt.value}>
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : null;
            })}
          </SelectContent>
        </Select>
        {!memberData.relationshipToUser && (
          <p className="text-xs text-qindred-green-600 dark:text-qindred-green-400 mt-1">
            This information helps build your family tree connections.
          </p>
        )}
      </div>
      <div>
        <Label htmlFor={`${formPrefix}relationshipType`} className="form-label">Relationship Type</Label>
        <Select 
          name="relationshipType" 
          value={memberData.relationshipType || ''} 
          onValueChange={(value) => handleSelectChange('relationshipType', value, setMemberDataFunction)}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select relationship type" />
          </SelectTrigger>
          <SelectContent>
            {relationshipTypesToShow.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[90vw] md:w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8" onInteractOutside={(e) => e.preventDefault()}>
          <DialogTitle className="text-2xl font-semibold text-qindred-green-900 dark:text-qindred-green-400">
            Manage Family Members
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mb-6">
            View, edit, or add members to your family tree.
          </DialogDescription>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full mb-6 ${editingMember ? 'grid-cols-3' : 'grid-cols-2'} gap-1`}>
              <TabsTrigger value="existing">Existing Members</TabsTrigger>
              <TabsTrigger value="add">Add New Member</TabsTrigger>
              {editingMember && (
                <TabsTrigger value="edit">Edit: {editingMember.firstName}</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="existing">
              <MembersList
                members={filteredMembers}
                onEdit={startEditMember}
                onDelete={setMemberToDelete}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                relationshipFilter={relationshipFilter}
                onRelationshipFilterChange={setRelationshipFilter}
                relationshipTypes={relationshipTypes}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="add">
              <MemberForm
                member={newMember}
                onInputChange={(e) => handleInputChange(e, setNewMember)}
                onSelectChange={(name, value) => handleSelectChange(name, value, setNewMember)}
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleMemberAddition(newMember);
                  setActiveTab("existing");
                }}
                onCancel={() => {
                  setNewMember(initialMemberState);
                  setActiveTab("existing");
                }}
                isLoading={isLoading}
                mode="add"
                relationshipTypes={relationshipTypes}
              />
            </TabsContent>
            
            {editingMember && (
              <TabsContent value="edit">
                <MemberForm
                  member={editingMember}
                  onInputChange={(e) => handleInputChange(e, setEditingMember)}
                  onSelectChange={(name, value) => handleSelectChange(name, value, setEditingMember)}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handleMemberUpdate(editingMember);
                    setActiveTab("existing");
                  }}
                  onCancel={() => {
                    setEditingMember(null);
                    setActiveTab("existing");
                  }}
                  isLoading={isLoading}
                  mode="edit"
                  relationshipTypes={relationshipTypes}
                />
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <DeleteMemberDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          await handleMemberDeletion(memberToDelete.id);
          setDeleteDialogOpen(false);
          setMemberToDelete(null);
        }}
        memberName={memberToDelete ? `${memberToDelete.firstName} ${memberToDelete.lastName}` : ''}
        processing={isLoading}
      />
    </>
  );
}
