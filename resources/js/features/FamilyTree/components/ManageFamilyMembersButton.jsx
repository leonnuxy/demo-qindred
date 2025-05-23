import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import ManageFamilyMembersModal from './ManageFamilyMembersModal';
import { 
  getFamilyMembers, 
  addFamilyMember, 
  updateFamilyMember, 
  deleteFamilyMember, 
  getRelationshipTypes 
} from '../services/familyMemberService';
import { useToast } from "@/components/ui/use-toast";

export default function ManageFamilyMembersButton({ 
  familyTreeId, 
  onMembersUpdated,
  buttonClassName,
  buttonVariant = "default", 
  buttonSize = "default" 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const fetchMembers = async () => {
    if (!familyTreeId) return;
    
    try {
      setIsLoading(true);
      
      // Make API calls separately to isolate failures
      try {
        const membersData = await getFamilyMembers(familyTreeId);
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
      
      try {
        const relationshipTypesData = await getRelationshipTypes();
        setRelationshipTypes(relationshipTypesData || []);
      } catch (relationshipError) {
        console.error("Failed to fetch relationship types:", relationshipError);
        // Use fallback relationship types if API fails
        setRelationshipTypes([
          { value: 'father', label: 'Father' },
          { value: 'mother', label: 'Mother' },
          { value: 'spouse', label: 'Spouse' },
          { value: 'child', label: 'Child' },
          { value: 'sibling', label: 'Sibling' },
          { value: 'other', label: 'Other' }
        ]);
      }
    } catch (error) {
      console.error("fetchMembers caught:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data when the modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchMembers();
    }
  }, [isModalOpen, familyTreeId]);
  
  const handleAddMember = async (memberData) => {
    try {
      const newMember = await addFamilyMember(familyTreeId, memberData);
      setFamilyMembers(prev => [...prev, newMember]);
      
      // Notify parent component about the update
      if (onMembersUpdated) {
        onMembersUpdated();
      }
      
      return newMember;
    } catch (error) {
      throw error;
    }
  };
  
  const handleUpdateMember = async (memberData) => {
    try {
      console.log('Updating member:', memberData);
      const updatedMember = await updateFamilyMember(familyTreeId, memberData.id, memberData);
      
      setFamilyMembers(prev => 
        prev.map(member => member.id === updatedMember.id ? updatedMember : member)
      );
      
      // Notify parent component about the update
      if (onMembersUpdated) {
        onMembersUpdated();
      }
      
      return updatedMember;
    } catch (error) {
      throw error;
    }
  };
  
  const handleDeleteMember = async (memberId) => {
    try {
      await deleteFamilyMember(familyTreeId, memberId);
      
      setFamilyMembers(prev => 
        prev.filter(member => member.id !== memberId)
      );
      
      // Notify parent component about the update
      if (onMembersUpdated) {
        onMembersUpdated();
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={buttonVariant}
        size={buttonSize}
        className={`flex items-center ${buttonClassName || ''}`}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Manage Family Members
      </Button>
      
      <ManageFamilyMembersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        familyMembers={familyMembers}
        relationshipTypes={relationshipTypes}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
      />
    </>
  );
}
