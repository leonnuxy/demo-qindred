import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon, HeartIcon, UserIcon, Users } from 'lucide-react';

export default function FamilyMembersStats({ familyMembers = [] }) {
  const stats = useMemo(() => {
    if (!familyMembers?.length) return { total: 0, immediate: 0, extended: 0, relationshipTypeBreakdown: {} };
    
    // Define relationship categories
    const immediateFamily = ['father', 'mother', 'parent', 'spouse', 'child', 'sibling'];
    const extendedFamily = [
      'grandparent', 'grandchild', 'aunt_uncle', 'niece_nephew', 'cousin',
      'in_law', 'step_parent', 'step_child', 'step_sibling',
      'foster_parent', 'foster_child', 'adoptive_parent', 'adoptive_child'
    ];
    
    // Count relationships by type
    const relationshipTypeBreakdown = {};
    familyMembers.forEach(member => {
      const relType = member.relationshipToUser || 'unknown';
      relationshipTypeBreakdown[relType] = (relationshipTypeBreakdown[relType] || 0) + 1;
    });
    
    // Calculate counts for each category
    const immediate = familyMembers.filter(m => 
      m.relationshipToUser && immediateFamily.includes(m.relationshipToUser)).length;
      
    const extended = familyMembers.filter(m => 
      m.relationshipToUser && extendedFamily.includes(m.relationshipToUser)).length;
      
    return {
      total: familyMembers.length,
      immediate,
      extended,
      other: familyMembers.length - immediate - extended,
      relationshipTypeBreakdown
    };
  }, [familyMembers]);
  
  // If no members, don't render
  if (!stats.total) return null;
  
  // Determine the most common relationship type
  const mostCommonRelationship = Object.entries(stats.relationshipTypeBreakdown)
    .sort((a, b) => b[1] - a[1])[0];
    
  const formatRelationship = (relationship) => {
    // Format relationship_type to Title Case
    if (relationship === 'unknown') return 'Unknown';
    return relationship.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-qindred-green-50/60 dark:bg-qindred-green-900/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Total Family Members
          </CardTitle>
          <CardDescription>All people in your family tree</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-qindred-green-700 dark:text-qindred-green-400">{stats.total}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-qindred-green-50/60 dark:bg-qindred-green-900/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <HeartIcon className="h-5 w-5" />
            Immediate Family
          </CardTitle>
          <CardDescription>Parents, children, siblings, spouses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-qindred-green-700 dark:text-qindred-green-400">
            {stats.immediate}
            <span className="text-sm font-normal ml-2">
              ({Math.round((stats.immediate / stats.total) * 100)}%)
            </span>
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-qindred-green-50/60 dark:bg-qindred-green-900/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Most Common Relation
          </CardTitle>
          <CardDescription>Most frequent relationship type</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-qindred-green-700 dark:text-qindred-green-400">
            {formatRelationship(mostCommonRelationship?.[0] || 'unknown')}
            <span className="text-sm font-normal ml-2">
              ({mostCommonRelationship?.[1] || 0} members)
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
