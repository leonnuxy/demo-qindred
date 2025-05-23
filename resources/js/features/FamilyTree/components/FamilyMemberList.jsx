import React from 'react';
import { Link } from '@inertiajs/react'; // If you plan to link to member profiles later

export default function FamilyMemberList({ membersList = [] }) {
  if (!membersList || membersList.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">No members yet in this family tree.</p>
        {/* Optionally, you could pass a function here to trigger adding a member */}
        {/* e.g., <Button onClick={onAddFirstMember}>Add First Member</Button> */}
      </div>
    );
  }

  return (
    <div className="family-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {membersList.map((member) => (
        <div
          key={member.user_id || member.id} // Use user_id if available, fallback to member.id
          className="p-4 border border-qindred-green-200 dark:border-qindred-green-800/30 rounded-lg bg-qindred-green-50/50 dark:bg-qindred-green-900/10 shadow-sm hover:shadow-md hover:border-qindred-green-400 dark:hover:border-qindred-green-600/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-qindred-green-200 dark:bg-qindred-green-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name || 'Member'}
                  className="w-full h-full object-cover"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = ''; // Clear the src to show the fallback UI
                    e.target.parentElement.innerHTML = (member.name || 'M').charAt(0).toUpperCase();
                  }}
                />
              ) : (
                <span className="text-lg font-medium">
                  {(member.name || member.firstName || 'M').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-grow min-w-0"> {/* Added min-w-0 for text truncation if needed */}
              <p className="font-semibold text-qindred-green-900 dark:text-qindred-green-400 truncate" title={member.name || `${member.firstName} ${member.lastName}`}>
                {member.name || `${member.firstName} ${member.lastName}` || 'Unnamed Member'}
              </p>
              {member.email && (
                <p className="text-sm text-qindred-green-700 dark:text-qindred-green-500 truncate" title={member.email}>
                  {member.email}
                </p>
              )}
              <p className="text-xs text-qindred-green-700/70 dark:text-qindred-green-500/70 mt-1">
                Role: <span className="font-medium text-qindred-green-800 dark:text-qindred-green-400">{member.role_in_tree || member.relationshipToUser || 'N/A'}</span>
              </p>
              {member.dateOfBirth && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Born: {new Date(member.dateOfBirth).toLocaleDateString()}
                </p>
              )}
              {member.isDeceased && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  Deceased {member.dateOfDeath ? `(${new Date(member.dateOfDeath).toLocaleDateString()})` : ''}
                </p>
              )}
            </div>
          </div>
          {/* Placeholder for individual member actions if needed in the future directly on the list item */}
          {/* <div className="mt-3 text-right">
            <Link href={route('user.profile', { user: member.user_id })} className="text-xs text-blue-600 hover:underline">View Profile</Link>
          </div> */}
        </div>
      ))}
    </div>
  );
}
