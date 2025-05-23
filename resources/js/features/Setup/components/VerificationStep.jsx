// resources/js/features/Setup/components/VerificationStep.jsx
import React from 'react';
import { Button } from '@/components/ui/button';

export default function VerificationStep({
  user,
  form = {},
  relationshipTypes = [],
  onBack,
  onComplete,
  processing,
}) {
  // destructure directly from form
  const {
    email,
    birthDate,
    gender,
    phone,
    country,
    city,
    state,
    bio,
    familyName,
    familyRole,
    familyDescription,
    membersToAdd = [],
  } = form;

  // if you ever bring firstName/lastName back into form, this will use it,
  // otherwise fall back to the registered user’s name
  const displayName = form.firstName || form.lastName
    ? `${form.firstName || ''} ${form.lastName || ''}`.trim()
    : user.name;

  const invitedMembers = membersToAdd.filter(m => m.type === 'invite');
  const directlyAddedMembers = membersToAdd.filter(m => m.type === 'direct_add');

  const getRelationshipLabel = (value) => {
    const rt = relationshipTypes.find(r => r.value === value);
    return rt ? rt.label : value;
  };

  return (
    <div>
      <h2 className="setup-step-title">Verification</h2>
      <p className="setup-text setup-text-mb-6">
        Please review your information before completing the setup process.
      </p>

      <div className="verification-container space-y-6">
        {/* Personal Info */}
        <div className="verification-section">
          <h3 className="verification-heading">Your Personal Information</h3>
          <div className="verification-grid">
            <div className="verification-label">Name:</div>
            <div className="verification-value">{displayName}</div>

            {email && (
              <>
                <div className="verification-label">Email:</div>
                <div className="verification-value">{email}</div>
              </>
            )}
            {birthDate && (
              <>
                <div className="verification-label">Birth Date:</div>
                <div className="verification-value">{birthDate}</div>
              </>
            )}
            {gender && (
              <>
                <div className="verification-label">Gender:</div>
                <div className="verification-value">{gender}</div>
              </>
            )}
            {phone && (
              <>
                <div className="verification-label">Phone:</div>
                <div className="verification-value">{phone}</div>
              </>
            )}
            {country && (
              <>
                <div className="verification-label">Country:</div>
                <div className="verification-value">{country}</div>
              </>
            )}
            {city && (
              <>
                <div className="verification-label">City:</div>
                <div className="verification-value">{city}</div>
              </>
            )}
            {state && (
              <>
                <div className="verification-label">State/Province:</div>
                <div className="verification-value">{state}</div>
              </>
            )}
            {bio && (
              <>
                <div className="verification-label">Bio:</div>
                <div className="verification-value">{bio}</div>
              </>
            )}
          </div>
        </div>

        {/* Family Tree Info */}
        <div className="verification-section">
          <h3 className="verification-heading">Family Tree Information</h3>
          <div className="verification-grid">
            <div className="verification-label">Family Name:</div>
            <div className="verification-value">{familyName}</div>

            <div className="verification-label">Your Role:</div>
            <div className="verification-value">
              {getRelationshipLabel(familyRole)}
            </div>

            {familyDescription && (
              <>
                <div className="verification-label">Description:</div>
                <div className="verification-value col-span-2 md:col-span-1">
                  {familyDescription}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Invited Members */}
        {invitedMembers.length > 0 && (
          <div className="verification-section">
            <h3 className="verification-heading">
              Members to be Invited by Email
            </h3>
            <ul className="verification-list">
              {invitedMembers.map(m => (
                <li key={m.email}>
                  {m.email} (Relationship to you:{' '}
                  {getRelationshipLabel(m.relationshipToMe)})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Directly Added Members */}
        {directlyAddedMembers.length > 0 && (
          <div className="verification-section">
            <h3 className="verification-heading">
              Members to be Added Directly
            </h3>
            <ul className="verification-list space-y-1">
              {directlyAddedMembers.map((m, i) => (
                <li key={i}>
                  <strong>
                    {m.firstName} {m.lastName}
                  </strong>{' '}
                  (Relationship: {getRelationshipLabel(m.relationshipToMe)})
                  {m.dateOfBirth && `, DOB: ${m.dateOfBirth}`}
                  {m.gender && `, Gender: ${m.gender}`}
                  {m.isDeceased && ' (Deceased)'}
                  {m.isDeceased && m.dateOfDeath && `, DOD: ${m.dateOfDeath}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No extra members */}
        {invitedMembers.length === 0 && directlyAddedMembers.length === 0 && (
          <div className="verification-section">
            <h3 className="verification-heading">Additional Members</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No additional members were specified.
            </p>
          </div>
        )}
      </div>

      <div className="setup-button-container setup-button-container-mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={processing}
          className="mr-2"
        >
          Back
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={onComplete}
          disabled={processing}
        >
          {processing ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}
