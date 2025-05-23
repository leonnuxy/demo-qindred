import React from 'react';
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

export default function InvitationsPage() {
  const {
    invitations = [],
    outgoingInvitations = [],
    familyTrees = [],
    flash = {},
    relationshipTypes = [],
  } = usePage().props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Invitations" />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="invitations-page">
          <Flash type="success" message={flash.success} />
          <Flash type="error" message={flash.error} />

        {/* RECEIVED */}
        <InvitationList 
          items={invitations} 
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
        {outgoingInvitations?.length > 0 && (
          <InvitationList 
            items={outgoingInvitations} 
            type="outgoing" 
          />
        )}
        </div>
      </div>
    </AppLayout>
  );
}
