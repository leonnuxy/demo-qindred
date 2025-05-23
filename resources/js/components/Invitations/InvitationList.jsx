import React from 'react';
import { InvitationItem } from './InvitationItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function InvitationList({ items = [], type }) {
  const title = type === 'incoming' ? 'Received Invitations' : 'Outgoing Invitations';
  
  return (
    <Card className="invitations-section">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!items || items.length === 0 ? (
          <div className="invitations-empty-state">
            {type === 'incoming' 
              ? 'You don\'t have any pending invitations.'
              : 'You haven\'t sent any invitations yet.'}
          </div>
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
