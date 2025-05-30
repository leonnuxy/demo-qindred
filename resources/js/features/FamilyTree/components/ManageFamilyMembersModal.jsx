import React, { useEffect, useMemo } from 'react';
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { MembersList } from './ManageFamilyMembersModal/components/MembersList';
import { MemberForm } from './ManageFamilyMembersModal/components/MemberForm';
import { DeleteMemberDialog } from './ManageFamilyMembersModal/components/DeleteMemberDialog';
import { useFamilyMembers } from './ManageFamilyMembersModal/hooks/useFamilyMembers';
import { useMemberForm } from './ManageFamilyMembersModal/hooks/useMemberForm';
import { initialMemberState, relationshipCategories } from './ManageFamilyMembersModal/utils/constants';

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
      console.log('Modal opened - loading fresh family members data');
      // First reset the form to clear any old state
      resetForm();
      // Then load fresh data from the server
      loadFamilyMembers();
    } else if (!isOpen) {
      // Just reset the form when closing
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
            className="member-form-input"
          />
        </div>
      )}

      {/* Show these fields for 'direct' add mode OR when editing an existing member (editingMember is not null) */}
      {(memberData.addMode === 'direct' || formPrefix === "edit-") && (
        <>
          <div className="member-form-grid">
            <div>
              <Label htmlFor={`${formPrefix}firstName`} className="form-label">First Name *</Label>
              <Input 
                type="text" id={`${formPrefix}firstName`} name="firstName" 
                value={memberData.firstName} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="member-form-input" 
              />
            </div>
            <div>
              <Label htmlFor={`${formPrefix}lastName`} className="form-label">Last Name *</Label>
              <Input 
                type="text" id={`${formPrefix}lastName`} name="lastName" 
                value={memberData.lastName} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="member-form-input" 
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`${formPrefix}dateOfBirth`} className="form-label">Date of Birth</Label>
            <Input 
              type="date" id={`${formPrefix}dateOfBirth`} name="dateOfBirth" 
              value={memberData.dateOfBirth} 
              onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
              className="member-form-input" 
            />
          </div>
          <div className="member-form-checkbox-container">
            <Checkbox 
              id={`${formPrefix}isDeceased`} name="isDeceased" 
              checked={memberData.isDeceased} 
              onCheckedChange={(checked) => handleSelectChange('isDeceased', Boolean(checked), setMemberDataFunction)} 
            />
            <Label htmlFor={`${formPrefix}isDeceased`} className="member-form-checkbox-label form-label">Deceased</Label>
          </div>
          {memberData.isDeceased && (
            <div>
              <Label htmlFor={`${formPrefix}dateOfDeath`} className="form-label">Date of Death</Label>
              <Input 
                type="date" id={`${formPrefix}dateOfDeath`} name="dateOfDeath" 
                value={memberData.dateOfDeath} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="member-form-input" 
              />
            </div>
          )}
          <div>
            <Label htmlFor={`${formPrefix}gender`} className="form-label">Gender</Label>
            <Select 
              name="gender" 
              value={memberData.gender || undefined} 
              onValueChange={(value) => handleSelectChange('gender', value, setMemberDataFunction)}
            >
              <SelectTrigger className="member-form-select-trigger">
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
                    value={memberData.email && memberData.email.includes('placeholder-') 
                      ? '(Added directly - no invitation email)' 
                      : memberData.email}
                    readOnly
                    className={`member-form-readonly-input ${memberData.email.includes('placeholder-') ? 'text-gray-500 italic' : ''}`}
                />
             </div>
          )}
        </>
      )}
      {/* Relationship to user section */}
      <div className="member-form-section">
        <Label htmlFor={`${formPrefix}relationshipToUser`} className="member-form-label member-form-label-required">Relationship to you</Label>
        <Select 
          name="relationshipToUser" 
          value={memberData.relationshipToUser || undefined} 
          onValueChange={(value) => handleSelectChange('relationshipToUser', value, setMemberDataFunction)}
          required
        >
          <SelectTrigger id={`${formPrefix}relationshipToUser`} className="member-form-select-full-width">
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
                  <SelectLabel className="member-relationship-category-label">
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
          <p className="member-form-help-text">
            This information helps build your family tree connections.
          </p>
        )}
      </div>
      <div>
        <Label htmlFor={`${formPrefix}relationshipType`} className="form-label">Relationship Type</Label>
        <Select 
          name="relationshipType" 
          value={memberData.relationshipType || undefined} 
          onValueChange={(value) => handleSelectChange('relationshipType', value, setMemberDataFunction)}
        >
          <SelectTrigger className="member-form-select-trigger">
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
        <DialogPortal>
          {/* full-screen dimmer */}
          <DialogOverlay className="family-members-modal-overlay" />

          {/* actual modal box */}
          <DialogContent className="family-members-modal" onInteractOutside={(e) => e.preventDefault()}>
            <DialogTitle className="family-members-modal-title">
              Manage Family Members
            </DialogTitle>
            <DialogDescription className="family-members-modal-description">
              View, edit, or add members to your family tree.
            </DialogDescription>
          
          <Tabs value={activeTab} onValueChange={(newTab) => {
            // If switching to the existing tab, refresh the member list
            if (newTab === "existing") {
              console.log('Switching to existing tab - refreshing member list');
              loadFamilyMembers();
            }
            setActiveTab(newTab);
          }} className="w-full">
            <TabsList className={`family-members-tabs-list ${editingMember ? 'has-edit' : 'no-edit'}`}>
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
                onDelete={(member) => {
                  setMemberToDelete(member);
                  setDeleteDialogOpen(true);
                }}
                relationshipFilter={relationshipFilter}
                onRelationshipFilterChange={setRelationshipFilter}
                relationshipTypes={availableRelationshipTypes}
                isLoading={isLoading}
                onSwitchTab={setActiveTab} // Pass the tab switching function
              />
            </TabsContent>
            
            <TabsContent value="add">
              <MemberForm
                member={newMember}
                onInputChange={(e) => handleInputChange(e, setNewMember)}
                onSelectChange={(name, value) => handleSelectChange(name, value, setNewMember)}
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    console.log('Submitting new member form data:', newMember);
                    const addedMember = await handleMemberAddition(newMember);
                    console.log('Successfully added member with response:', addedMember);
                    
                    // Reset form after successful addition
                    setNewMember(initialMemberState);
                    
                    // Switch to existing members tab to show the updated list
                    setActiveTab("existing");
                  } catch (error) {
                    // Error already handled in handleMemberAddition
                    console.error('Form submission error:', error);
                  }
                }}
                onCancel={() => {
                  setNewMember(initialMemberState);
                  setActiveTab("existing");
                }}
                isLoading={isLoading}
                mode="add"
                relationshipTypes={availableRelationshipTypes}
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
                    try {
                      console.log('Submitting updated member data:', editingMember);
                      console.log('Member ID before update:', editingMember.id);
                      
                      // Make sure gender is not an empty string (use null instead)
                      const memberToUpdate = {
                        ...editingMember,
                        id: editingMember.id, // Explicitly include the ID
                        gender: editingMember.gender || null,
                        dateOfBirth: editingMember.dateOfBirth || null,
                        dateOfDeath: editingMember.dateOfDeath || null
                      };
                      
                      console.log('Updated member data with explicit ID:', memberToUpdate);
                      
                      const updatedMember = await handleMemberUpdate(memberToUpdate);
                      console.log('Successfully updated member with response:', updatedMember);
                      
                      // Clear editing state after successful update
                      setEditingMember(null);
                      
                      // Switch to existing members tab to show the updated list
                      setActiveTab("existing");
                    } catch (error) {
                      // Error already handled in handleMemberUpdate
                      console.error('Member update submission error:', error);
                      
                      // Stay on the edit tab when there are errors
                      if (error.response?.status === 422) {
                        // If there's validation errors, show them in the form
                        console.log('Validation errors from backend:', error.response.data.errors);
                      }
                    }
                  }}
                  onCancel={() => {
                    setEditingMember(null);
                    setActiveTab("existing");
                  }}
                  isLoading={isLoading}
                  mode="edit"
                  relationshipTypes={availableRelationshipTypes}
                />
              </TabsContent>
            )}
          </Tabs>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      
      <DeleteMemberDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          console.log('Delete confirmation received for:', memberToDelete);
          if (!memberToDelete || !memberToDelete.id) {
            console.error('Cannot delete member: Missing ID or member data');
            setDeleteDialogOpen(false);
            setMemberToDelete(null);
            return;
          }
          
          try {
            console.log('Attempting to delete member with ID:', memberToDelete.id);
            await handleMemberDeletion(memberToDelete.id);
            console.log('Member deleted successfully');
          } catch (error) {
            console.error('Error in delete confirmation handler:', error);
          } finally {
            setDeleteDialogOpen(false);
            setMemberToDelete(null);
          }
        }}
        memberName={memberToDelete ? `${memberToDelete.firstName || ''} ${memberToDelete.lastName || ''}`.trim() || 'this member' : 'this member'}
        processing={isLoading}
      />
    </>
  );
}
