import React from 'react';

export default function CompleteStep({ form, onBack, onComplete, processing }) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Ready to Complete Setup
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Let's review your information before finalizing your setup
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Personal Information
            </h3>
            <div className="mt-4 space-y-3">
              <p>
                <span className="font-medium text-gray-500">Name:</span>{' '}
                {form.firstName} {form.lastName}
              </p>
              {form.birthDate && (
                <p>
                  <span className="font-medium text-gray-500">Birth Date:</span>{' '}
                  {new Date(form.birthDate).toLocaleDateString()}
                </p>
              )}
              {form.phone && (
                <p>
                  <span className="font-medium text-gray-500">Phone:</span>{' '}
                  {form.phone}
                </p>
              )}
              {form.country && (
                <p>
                  <span className="font-medium text-gray-500">Country:</span>{' '}
                  {form.country}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Family Tree Information */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Family Tree
            </h3>
            <div className="mt-4 space-y-3">
              <p>
                <span className="font-medium text-gray-500">Name:</span>{' '}
                {form.familyName}
              </p>
              {form.familyDescription && (
                <p>
                  <span className="font-medium text-gray-500">Description:</span>{' '}
                  {form.familyDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Family Members */}
        {form.membersToAdd.length > 0 && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Family Members to Add
              </h3>
              <ul className="mt-4 divide-y divide-gray-200">
                {form.membersToAdd.map((member, index) => (
                  <li key={index} className="py-3">
                    {member.type === 'invite' ? (
                      <p>
                        <span className="font-medium text-gray-500">Invite:</span>{' '}
                        {member.email}
                      </p>
                    ) : (
                      <p>
                        <span className="font-medium text-gray-500">Add:</span>{' '}
                        {member.firstName} {member.lastName}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Relationship: {member.relationshipToMe}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={processing}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Completing Setup...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );
}
