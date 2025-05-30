import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MembersList({
  members,
  onEdit,
  onDelete,
  relationshipFilter,
  onRelationshipFilterChange,
  relationshipTypes,
  isLoading,
  onSwitchTab // Add a new prop to switch tabs
}) {
  if (isLoading) {
    return <div className="members-list-loading">Loading members...</div>;
  }

  // Function that handles edit button click - calls onEdit and switches to edit tab
  const handleEditClick = (member) => {
    console.log('Edit button clicked for member:', member);
    console.log('Member ID being passed to edit:', member.id);
    
    // Make sure the member has an ID before proceeding
    if (!member.id) {
      console.error('Member is missing an ID:', member);
      return;
    }
    
    onEdit(member); // Set the member to edit
    if (onSwitchTab) {
      onSwitchTab('edit'); // Switch to edit tab
    }
  };

  // Helper function to display email in a user-friendly format
  const formatEmail = (email) => {
    if (!email) return null;
    
    // Check if it's a placeholder email
    if (email.includes('placeholder-')) {
      return <span className="text-gray-500 italic">(Added directly)</span>;
    }
    
    return email;
  };

  return (
    <div>
      {/* Filter section */}
      <div className="members-list-filters">
        <Select
          value={relationshipFilter}
          onValueChange={onRelationshipFilterChange}
        >
          <SelectTrigger className="members-relationship-filter">
            <SelectValue placeholder="Filter by relationship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Relationships</SelectItem>
            {relationshipTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Members list */}
      <div className="members-list">
        {members.length === 0 ? (
          <div className="members-list-empty">
            No family members found.
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="member-list-item"
            >
              <div>
                <p className="member-name">
                  {member.firstName} {member.lastName}
                  {member.isCreator && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full">Creator</span>
                  )}
                </p>
                <p className="member-relationship">
                  {(() => {
                    // Try to find the relationship label in the relationship types
                    const relationshipLabel = relationshipTypes.find(rt => 
                      rt.value === member.relationshipToUser
                    )?.label;
                    
                    // If found, use the label
                    if (relationshipLabel) {
                      return relationshipLabel;
                    }
                    
                    // If not found but we have a value, format it nicely
                    if (member.relationshipToUser) {
                      return member.relationshipToUser
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    }
                    
                    // Fallback
                    return 'Other';
                  })()}
                </p>
              </div>
              <div className="member-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(member)} // Changed to use the new handler
                  className="member-edit-button"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(member)}
                  className="member-delete-button"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
