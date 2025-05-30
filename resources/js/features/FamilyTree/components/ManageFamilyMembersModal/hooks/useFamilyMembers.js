import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";

export function useFamilyMembers({
  initialFamilyMembers = [],
  familyTreeId,
  onAddMember,
  onUpdateMember,
  onDeleteMember
}) {
  const [members, setMembers] = useState(initialFamilyMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const { toast } = useToast();

  // Function to load family members from API with retry capability
  const loadMembers = async (retryCount = 0, maxRetries = 2) => {
    if (!familyTreeId) return;
    
    console.log(`🔄 Loading family members for tree ${familyTreeId} (retry: ${retryCount}/${maxRetries})`);
    setIsLoading(true);
    try {
      const { getFamilyMembers } = await import('../../../services/familyMemberService');
      const membersData = await getFamilyMembers(familyTreeId);
      
      if (membersData && Array.isArray(membersData)) {
        console.log(`✅ Successfully loaded ${membersData.length} family members`, membersData);
        setMembers(membersData);
        
        const membersWithNARelationship = membersData.filter(
          m => !m.relationshipToUser || m.relationshipToUser === 'N/A'
        );
        if (membersWithNARelationship.length > 0) {
          console.warn('Members with missing relationship info:', membersWithNARelationship);
        }
      } else if (retryCount < maxRetries) {
        setTimeout(() => loadMembers(retryCount + 1, maxRetries), 1000);
        return;
      } else {
        console.error('Failed to load family members after retries');
        setMembers([]);
        toast({
          title: "Error",
          description: "Failed to load family members. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading family members:', error);
      if (retryCount < maxRetries) {
        setTimeout(() => loadMembers(retryCount + 1, maxRetries), 1000);
        return;
      } else {
        toast({
          title: "Error",
          description: "Failed to load family members. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members based on relationship filter and exclude the creator
  const filteredMembers = useMemo(() => {
    // First filter out the creator to prevent accidental deletion
    // The creator typically has isCreator=true or is marked as "admin" roleInTree
    const nonCreatorMembers = members.filter(member => {
      // Check if member has isCreator flag or role is admin
      const isCreator = member.isCreator === true || 
                        member.roleInTree === 'admin' || 
                        member.role_in_tree === 'admin';
                        
      // Only include members who are NOT creators
      return !isCreator;
    });
    
    // Then apply the relationship filter if needed
    if (!relationshipFilter || relationshipFilter === 'all') {
      return nonCreatorMembers;
    }
    
    return nonCreatorMembers.filter(member => {
      return member.relationshipToUser === relationshipFilter;
    });
  }, [members, relationshipFilter]);

  // Update members when initialFamilyMembers changes, but only on first mount or if membersCountChanged
  useEffect(() => {
    const previousMembersCount = members.length;
    const newMembersCount = initialFamilyMembers.length;
    const membersCountChanged = previousMembersCount !== newMembersCount;

    // Only update if it's first mount (members is empty) or if count changed
    if (previousMembersCount === 0 || membersCountChanged) {
      setMembers(initialFamilyMembers);
    }
  }, [initialFamilyMembers, members.length]);

  // Handler functions for CRUD operations
  const handleMemberAddition = async (memberData) => {
    setIsLoading(true);
    try {
      console.log('Adding new family member:', memberData);
      
      if (!memberData.firstName?.trim() || !memberData.lastName?.trim()) {
        throw new Error('First name and last name are required');
      }

      const { addFamilyMember } = await import('../../../services/familyMemberService');
      const result = await onAddMember(memberData);
      
      console.log('New member added successfully:', result);
      
      // Make sure we have all members by reloading from API
      loadMembers();
      
      toast({
        title: "Success",
        description: "Family member added successfully!",
        variant: "default"
      });
      
      return result;
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add family member. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberUpdate = async (memberData) => {
    setIsLoading(true);
    try {
      console.log('Updating family member:', memberData);
      
      if (!memberData.id) {
        throw new Error('Member ID is required for updates');
      }
      
      if (!memberData.firstName?.trim() || !memberData.lastName?.trim()) {
        throw new Error('First name and last name are required');
      }

      const cleanedData = {
        ...memberData,
        id: memberData.id, // Make sure the id is included
        firstName: memberData.firstName?.trim(),
        lastName: memberData.lastName?.trim(),
      };

      console.log('Calling onUpdateMember with cleaned data:', cleanedData);
      
      const result = await onUpdateMember(cleanedData);
      
      console.log('Member updated successfully:', result);
      
      // Update the member in the local state
      setMembers(prev => prev.map(m => m.id === result.id ? result : m));
      
      toast({
        title: "Success",
        description: "Family member updated successfully!",
        variant: "default"
      });
      
      return result;
    } catch (error) {
      console.error('Error updating family member:', error);
      
      const errorMessage = error.formattedErrors || error.message || "Failed to update family member";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberDeletion = async (memberId) => {
    if (!memberId) {
      console.error('No member ID provided for deletion');
      toast({
        title: "Error",
        description: "Cannot delete member: Missing ID",
        variant: "destructive"
      });
      return;
    }

    console.log('Deleting member with ID:', memberId);
    setIsLoading(true);
    
    try {
      const { deleteFamilyMember } = await import('../../../services/familyMemberService');
      
      // Call the API to delete the member
      await deleteFamilyMember(familyTreeId, memberId);
      
      console.log('Member deleted successfully. Member ID:', memberId);
      
      // Update local state
      setMembers(prev => prev.filter(m => m.id !== memberId));
      
      // Notify parent component
      if (onDeleteMember) {
        console.log('Calling onDeleteMember callback with ID:', memberId);
        onDeleteMember(memberId);
      } else {
        console.warn('onDeleteMember callback not provided');
      }
      
      toast({
        title: "Success",
        description: "Family member deleted successfully!",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error deleting family member:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to delete family member. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    familyMembers: members,
    filteredMembers,
    isLoading,
    relationshipFilter,
    setRelationshipFilter,
    handleMemberAddition,
    handleMemberUpdate,
    handleMemberDeletion,
    loadFamilyMembers: () => loadMembers()
  };
}
