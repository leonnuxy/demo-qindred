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
  
  const handleAddMember = async (memberData) => {
    const svc = await import(
      /* webpackChunkName: "family-member-service" */
      '../services/familyMemberService'
    );
    const newMember = await svc.addFamilyMember(familyTreeId, memberData);
    setFamilyMembers(prev => [...prev, newMember]);
    onMembersUpdated?.();
    return newMember;
  };
  
  const handleUpdateMember = async (memberData) => {
    const svc = await import(
      /* webpackChunkName: "family-member-service" */
      '../services/familyMemberService'
    );
    const updated = await svc.updateFamilyMember(familyTreeId, memberData.id, memberData);
    setFamilyMembers(prev =>
      prev.map(m => m.id === updated.id ? updated : m)
    );
    onMembersUpdated?.();
    return updated;
  };
  
  const handleDeleteMember = async (memberId) => {
    const svc = await import(
      /* webpackChunkName: "family-member-service" */
      '../services/familyMemberService'
    );
    await svc.deleteFamilyMember(familyTreeId, memberId);
    setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    onMembersUpdated?.();
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
        onClose={() => setIsModalOpen(false)}
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
