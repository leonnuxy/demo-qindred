import { useState } from 'react';
import { initialMemberState, MEMBER_MODES, MODAL_TABS } from '../utils/constants';
import { useToast } from "@/components/ui/use-toast";

export function useMemberForm(props = {}) {
  const [activeTab, setActiveTab] = useState("existing");
  const [isLoading, setIsLoading] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState(initialMemberState);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e, setterFunction) => {
    const { name, value, type, checked } = e.target;
    setterFunction(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSelectChange = (name, value, setterFunction) => {
    setterFunction(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const startEditMember = (member) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try { return new Date(dateStr).toISOString().split('T')[0]; } 
      catch (e) { return ''; }
    };

    console.log('Starting to edit member with original data:', member);
    console.log('Member ID:', member.id);

    setEditingMember({
      ...member,
      id: member.id, // Explicitly ensure the ID is set
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      dateOfBirth: formatDate(member.dateOfBirth),
      dateOfDeath: formatDate(member.dateOfDeath),
      isDeceased: Boolean(member.dateOfDeath || member.isDeceased),
      gender: member.gender || '',
      relationshipToUser: member.relationshipToUser || '',
      email: member.email || '',
      addMode: MEMBER_MODES.DIRECT,
    });
    
    // Automatically switch to the edit tab when starting to edit a member
    setActiveTab(MODAL_TABS.EDIT);
    console.log(`Starting to edit member ${member.firstName} ${member.lastName} - switching to edit tab`);
  };

  const resetForm = () => {
    // Make a fresh copy of initialMemberState to avoid reference issues
    setNewMember({...initialMemberState});
    setEditingMember(null);
    setMemberToDelete(null);
    setDeleteDialogOpen(false);
    setActiveTab("existing");
    console.log('Form reset complete - all form state cleared');
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setActiveTab("existing");
  };

  return {
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
    isLoading,
    setIsLoading,
    handleInputChange,
    handleSelectChange,
    startEditMember,
    cancelEdit,
    resetForm
  };
}
