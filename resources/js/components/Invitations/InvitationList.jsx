import React from 'react';
import { InvitationItem } from './InvitationItem';
import { InvitationPlaceholder } from './InvitationPlaceholder';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function InvitationList({ items = [], type }) {
  const title = type === 'incoming' ? 'Received Invitations' : 'Outgoing Invitations';
  
  return (
    <Card className="invitations-section">
      <CardHeader className="invitations-section-header">
        <CardTitle className="invitations-section-title">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!items || items.length === 0 ? (
          type === 'incoming' ? (
            // Show placeholders for received invitations
            <div className="invitations-placeholder-list">
              <InvitationPlaceholder variant="default" />
              <InvitationPlaceholder variant="narrow" />
              <InvitationPlaceholder variant="default" />
            </div>
          ) : (
            // For outgoing invitations, show the empty state message
            <div className="invitations-empty-state">
              You haven't sent any invitations yet.
            </div>
          )
        ) : (
          <div className="invitations-list">
            {items.map((item) => (
              <InvitationItem key={item.id} item={item} type={type} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
