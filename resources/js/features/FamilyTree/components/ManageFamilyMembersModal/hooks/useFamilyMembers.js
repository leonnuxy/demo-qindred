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
  const [searchTerm, setSearchTerm] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('');
  const { toast } = useToast();

  // Function to load family members from API with retry capability
  const loadMembers = async (retryCount = 0, maxRetries = 2) => {
    if (!familyTreeId) return;
    
    setIsLoading(true);
    try {
      const { getFamilyMembers } = await import('../../../services/familyMemberService');
      const membersData = await getFamilyMembers(familyTreeId);
      
      if (membersData && Array.isArray(membersData)) {
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

  // Filter members based on search term and relationship filter
  const filteredMembers = useMemo(() => {
    if (!searchTerm && !relationshipFilter) {
      return members;
    }
    
    return members.filter(member => {
      const matchesSearch = !searchTerm || 
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRelationship = !relationshipFilter || member.relationshipToUser === relationshipFilter;
      
      return matchesSearch && matchesRelationship;
    });
  }, [members, searchTerm, relationshipFilter]);

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

  return {
    members: filteredMembers,
    isLoading,
    searchTerm,
    setSearchTerm,
    relationshipFilter,
    setRelationshipFilter,
    loadMembers,
    setMembers
  };
}
