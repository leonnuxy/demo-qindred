import React, { useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

import { MODAL_TABS } from './utils/constants';
import { useFamilyMembers } from './hooks/useFamilyMembers';
import { useMemberForm } from './hooks/useMemberForm';
import MembersList from './components/MembersList';
import MemberForm from './components/MemberForm';
import DeleteMemberDialog from './components/DeleteMemberDialog';

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
    members,
    isLoading: isLoadingMembers,
    searchTerm,
    setSearchTerm,
    relationshipFilter,
    setRelationshipFilter,
    loadMembers
  } = useFamilyMembers(familyTreeId, initialFamilyMembers);

  const {
    editingMember,
    setEditingMember,
    newMember,
    setNewMember,
    isLoading: isProcessing,
    handleInputChange,
    handleSelectChange,
    startEditMember,
    handleAddMember,
    handleUpdateMember
  } = useMemberForm({
    onAdd: onAddMember,
    onUpdate: onUpdateMember
  });

  const [activeTab, setActiveTab] = React.useState(MODAL_TABS.EXISTING);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [memberToDelete, setMemberToDelete] = React.useState(null);

  // Load members when modal opens
  useEffect(() => {
    if (isOpen && familyTreeId) {
      loadMembers();
      setActiveTab(MODAL_TABS.EXISTING);
      setEditingMember(null);
      setNewMember(initialMemberState);
      setSearchTerm('');
      setRelationshipFilter('');
    }
  }, [isOpen, familyTreeId]);

  const handleStartDelete = (member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    
    try {
      await onDeleteMember(memberToDelete);
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      loadMembers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setActiveTab(MODAL_TABS.EXISTING);
  };

  const handleCancelAdd = () => {
    setNewMember(initialMemberState);
    setActiveTab(MODAL_TABS.EXISTING);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={MODAL_TABS.EXISTING}>
                Manage Members
              </TabsTrigger>
              <TabsTrigger value={MODAL_TABS.ADD}>Add Member</TabsTrigger>
            </TabsList>

            <TabsContent value={MODAL_TABS.EXISTING}>
              <MembersList
                members={members}
                onEdit={startEditMember}
                onDelete={handleStartDelete}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                relationshipFilter={relationshipFilter}
                onRelationshipFilterChange={setRelationshipFilter}
                relationshipTypes={relationshipTypes}
                isLoading={isLoadingMembers}
              />
            </TabsContent>

            <TabsContent value={MODAL_TABS.ADD}>
              <MemberForm
                member={newMember}
                onInputChange={(e) => handleInputChange(e, setNewMember)}
                onSelectChange={(name, value) => handleSelectChange(name, value, setNewMember)}
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleAddMember();
                }}
                onCancel={handleCancelAdd}
                isLoading={isProcessing}
                relationshipTypes={relationshipTypes}
              />
            </TabsContent>

            {editingMember && (
              <TabsContent value={MODAL_TABS.EDIT}>
                <h4 className="text-lg font-semibold mb-4">
                  Editing: {editingMember.firstName} {editingMember.lastName}
                </h4>
                <MemberForm
                  member={editingMember}
                  mode="edit"
                  onInputChange={(e) => handleInputChange(e, setEditingMember)}
                  onSelectChange={(name, value) => handleSelectChange(name, value, setEditingMember)}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handleUpdateMember();
                  }}
                  onCancel={handleCancelEdit}
                  isLoading={isProcessing}
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
        onConfirm={handleDeleteConfirm}
        memberName={memberToDelete ? `${memberToDelete.firstName} ${memberToDelete.lastName}` : ''}
        processing={isProcessing}
      />
    </>
  );
}
