import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from "lucide-react";
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
  searchTerm,
  onSearchChange,
  relationshipFilter,
  onRelationshipFilterChange,
  relationshipTypes,
  isLoading
}) {
  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">Loading members...</div>;
  }

  return (
    <div>
      {/* Search and filter section */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={relationshipFilter}
          onValueChange={onRelationshipFilterChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by relationship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Relationships</SelectItem>
            {relationshipTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Members list */}
      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No family members found.
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div>
                <p className="font-medium">
                  {member.firstName} {member.lastName}
                </p>
                {member.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Email: {member.email}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {relationshipTypes.find(rt => rt.value === member.relationshipToUser)?.label || member.relationshipToUser}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(member)}
                  className="border-qindred-green-500 hover:bg-qindred-green-50 dark:hover:bg-qindred-green-900/20 text-qindred-green-700 dark:text-qindred-green-500"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(member)}
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
