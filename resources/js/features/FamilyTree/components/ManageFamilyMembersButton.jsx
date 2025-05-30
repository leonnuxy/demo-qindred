import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import ManageFamilyMembersModal from './ManageFamilyMembersModal';
import FamilyMembersStats from './FamilyMembersStats';
import { useToast } from "@/components/ui/use-toast";

export default function ManageFamilyMembersButton({ 
  familyTreeId, 
  onMembersUpdated,
  buttonClassName,
  buttonVariant = "default", 
  buttonSize = "default",
  showStats = true
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const fetchMembers = async () => {
    if (!familyTreeId) return;
    setIsLoading(true);
    try {
      // load the service module on-demand
      const svc = await import(
        /* webpackChunkName: "family-member-service" */
        '../services/familyMemberService'
      );

      // getFamilyMembers
      try {
        const membersData = await svc.getFamilyMembers(familyTreeId);
        setFamilyMembers(membersData || []);
      } catch (memberError) {
        console.error("Failed to fetch family members:", memberError);
        toast({
          title: "Error",
          description: "Failed to load family members. Please try again.",
          variant: "destructive",
        });
        setFamilyMembers([]);
      }

      // getRelationshipTypes
      try {
        const types = await svc.getRelationshipTypes();
        const valid = (types || []).filter(rt =>
          rt && typeof rt.value === 'string' && rt.value !== ""
        );
        if (valid.length !== (types || []).length) {
          console.warn("Filtered out invalid relationship types.");
        }
        setRelationshipTypes(valid);
      } catch {
        // fallback
        setRelationshipTypes([
          { value: 'father', label: 'Father' },
          { value: 'mother', label: 'Mother' },
          { value: 'spouse', label: 'Spouse' },
          { value: 'child', label: 'Child' },
          { value: 'sibling', label: 'Sibling' },
          { value: 'other', label: 'Other' }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isModalOpen) fetchMembers();
  }, [isModalOpen, familyTreeId]);
  
  // Helper function to ensure tree updates
  const updateTreeData = () => {
    console.log('Updating family tree data after member changes');
    
    // Call the provided callback to update the tree
    if (onMembersUpdated) {
      console.log('Calling onMembersUpdated to refresh tree data');
      onMembersUpdated();
    } else {
      console.warn('No onMembersUpdated callback provided, tree may not update automatically');
    }
  };
  
  const handleAddMember = async (memberData) => {
    const svc = await import(
      /* webpackChunkName: "family-member-service" */
      '../services/familyMemberService'
    );
    const response = await svc.addFamilyMember(familyTreeId, memberData);
    
    // Extract the member data (without hierarchicalTreeData)
    const { hierarchicalTreeData, ...newMember } = response;
    
    // Add the new member to our local state
    setFamilyMembers(prev => [...prev, newMember]);
    
    // If we received hierarchical tree data from the backend, use it
    if (hierarchicalTreeData) {
      console.log('Received fresh hierarchical tree data from backend:', hierarchicalTreeData);
      
      // Trigger tree update with the fresh tree data
      if (onMembersUpdated && typeof onMembersUpdated === 'function') {
        console.log('Calling onMembersUpdated with fresh hierarchical tree data');
        onMembersUpdated(hierarchicalTreeData);
      }
    } else {
      // Fall back to regular update if no tree data was returned
      updateTreeData();
    }
    
    return newMember;
  };
  
  const handleUpdateMember = async (memberData) => {
    const svc = await import(
      /* webpackChunkName: "family-member-service" */
      '../services/familyMemberService'
    );
    const response = await svc.updateFamilyMember(familyTreeId, memberData.id, memberData);
    
    // Extract the member data (without hierarchicalTreeData)
    const { hierarchicalTreeData, ...updated } = response;
    
    // Update the member in our local state
    setFamilyMembers(prev =>
      prev.map(m => m.id === updated.id ? updated : m)
    );
    
    // If we received hierarchical tree data from the backend, use it
    if (hierarchicalTreeData) {
      console.log('Received fresh hierarchical tree data from backend:', hierarchicalTreeData);
      
      // Trigger tree update with the fresh tree data
      if (onMembersUpdated && typeof onMembersUpdated === 'function') {
        console.log('Calling onMembersUpdated with fresh hierarchical tree data');
        onMembersUpdated(hierarchicalTreeData);
      }
    } else {
      // Fall back to regular update if no tree data was returned
      updateTreeData();
    }
    
    return updated;
  };
  
  const handleDeleteMember = async (memberId) => {
    const svc = await import(
      /* webpackChunkName: "family-member-service" */
      '../services/familyMemberService'
    );
    await svc.deleteFamilyMember(familyTreeId, memberId);
    setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    
    // Trigger tree update
    updateTreeData();
  };

  return (
    <>
      {showStats && familyMembers.length > 0 && !isLoading && (
        <FamilyMembersStats familyMembers={familyMembers} />
      )}
      
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`${buttonClassName || ''} ${
          buttonClassName?.includes('bg-') ? '' : 'bg-[#31a63d] hover:bg-[#288c32]'
        }`}
        variant={buttonVariant}
        size={buttonSize}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Manage Family Members
      </Button>

      <ManageFamilyMembersModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Ensure tree is updated when modal is closed
          updateTreeData();
        }}
        familyMembers={familyMembers}
        familyTreeId={familyTreeId}
        relationshipTypes={relationshipTypes}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
      />
    </>
  );
}
