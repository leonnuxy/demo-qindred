import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { SendInvitationForm } from '@/components/Invitations/SendInvitationForm';
import { InvitationList } from '@/components/Invitations/InvitationList';
import { Flash } from '@/components/Invitations/Flash';
import '@css/pages/invitations.css';

const breadcrumbs = [
  {
    title: 'Invitations',
    href: '/invitations',
  },
];

// Sample data for received invitations
const sampleReceivedInvitations = [
  {
    id: 'sample-1',
    familyTree: { name: 'The Smith Family' },
    inviter: { name: 'John Smith' },
    created_at: '2024-05-15T14:30:00.000Z',
    status: 'pending'
  },
  {
    id: 'sample-2',
    familyTree: { name: 'The Johnson Family' },
    inviter: { name: 'Emily Johnson' },
    created_at: '2024-05-12T09:45:00.000Z',
    status: 'accepted'
  },
  {
    id: 'sample-3',
    familyTree: { name: 'The Williams Family' },
    inviter: { name: 'Michael Williams' },
    created_at: '2024-05-10T16:20:00.000Z',
    status: 'declined'
  }
];

// Sample data for outgoing invitations
const sampleOutgoingInvitations = [
  {
    id: 'outgoing-1',
    email: 'n@f1.com',
    familyTree: { name: 'Smith Family' },
    created_at: '2024-05-23T12:00:00.000Z',
    status: 'pending'
  }
];

export default function InvitationsPage() {
  const {
    invitations = [],
    outgoingInvitations = [],
    familyTrees = [],
    flash = {},
    relationshipTypes = [],
  } = usePage().props;

  // State to control whether to show real data or sample data
  const [showSampleData, setShowSampleData] = useState(true);
  
  // If real invitations become available, switch to real data
  useEffect(() => {
    if (invitations && invitations.length > 0) {
      setShowSampleData(false);
    }
  }, [invitations]);

  // Use sample data if showSampleData is true, otherwise use real data
  const displayedInvitations = showSampleData ? sampleReceivedInvitations : invitations;
  const displayedOutgoingInvitations = showSampleData ? sampleOutgoingInvitations : outgoingInvitations;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Invitations" />
      
      <div className="invitations-page-wrapper">
        <div className="invitations-page">
          <div className="invitations-page-header">
            <h1 className="invitations-page-title">Manage Invitations</h1>
            <p className="invitations-page-description">
              Send invitations to family members and manage your incoming invites
            </p>
          </div>
          
          <Flash type="success" message={flash.success} />
          <Flash type="error" message={flash.error} />

          {/* Sample data toggle */}
          <div className="sample-data-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showSampleData}
                onChange={(e) => setShowSampleData(e.target.checked)}
              />
              <span>Show sample invitation data</span>
            </label>
          </div>

          {/* RECEIVED */}
          <InvitationList 
            items={displayedInvitations} 
            type="incoming" 
          />
          
          {/* SEND NEW */}
          {familyTrees?.length > 0 && (
            <SendInvitationForm 
              familyTrees={familyTrees} 
              relationshipTypes={relationshipTypes} 
            />
          )}

          {/* OUTGOING */}
          {/* Always show outgoing invitations when we have sample data */}
          {(showSampleData || outgoingInvitations?.length > 0) && (
            <InvitationList 
              items={displayedOutgoingInvitations} 
              type="outgoing" 
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
