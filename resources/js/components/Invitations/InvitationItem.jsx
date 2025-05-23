import React from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';

export function InvitationItem({ item, type }) {
  const { post, processing } = useForm();

  const handleAction = (action) => {
    post(route(`invitations.${action}`, { invitation: item.id }), {
      preserveScroll: true,
    });
  };
  
  // Format the date
  const formattedDate = new Date(item.created_at).toLocaleDateString();
  
  return (
    <div className="invitations-list-item">
      <div className="invitation-details">
        {type === 'incoming' ? (
          <>
            <h3 className="invitation-family-name">
              {item.familyTree?.name || '—'}
            </h3>
            <p className="invitation-meta-text">
              Invited by {item.inviter?.name ?? '—'} on <time dateTime={item.created_at}>{formattedDate}</time>
            </p>
          </>
        ) : (
          <>
            <p className="invitation-email">{item.email}</p>
            <p className="invitation-meta-text">
              For {item.familyTree?.name} on <time dateTime={item.created_at}>{formattedDate}</time>
            </p>
          </>
        )}
      </div>
      
      {type === 'incoming' && item.status === 'pending' ? (
        <div className="invitation-actions">
          <Button
            className="button-base"
            onClick={() => handleAction('accept')}
            disabled={processing}
          >
            Accept
          </Button>
          <Button
            className="button-base"
            variant="outline"
            onClick={() => handleAction('decline')}
            disabled={processing}
          >
            Decline
          </Button>
        </div>
      ) : type === 'incoming' && item.status !== 'pending' ? (
        <span className={`invitation-status-badge ${item.status === 'accepted' ? 'accepted' : 'declined'}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ) : (
        <div className="invitation-actions">
          <Button
            className="button-base"
            variant="outline"
            size="sm"
            onClick={() => handleAction('resend')}
            disabled={processing}
          >
            Resend
          </Button>
          <Button
            className="button-base"
            variant="destructive"
            size="sm"
            onClick={() => handleAction('cancel')}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
