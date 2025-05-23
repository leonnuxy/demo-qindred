import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TreeComponent from '@/features/FamilyTree/components/TreeComponent';
import { useFamilyTree } from '@/features/FamilyTree/hooks/useFamilyTree';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ManageFamilyMembersButton from '@/features/FamilyTree/components/ManageFamilyMembersButton';
import FamilyMemberList from '@/features/FamilyTree/components/FamilyMemberList';

export default function Show({
  familyTree,
  hierarchicalTreeData,
  membersList,
  familyTreeLogs
}) {
  const { auth, flash, errors: pageErrors } = usePage().props;
  const currentUser = auth.user;

  const {
    treeData: displayTreeData,
    isLoading: isTreeLoading,
    error: treeError,
    zoom,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
  } = useFamilyTree(hierarchicalTreeData, currentUser?.id);

  const [activityLog, setActivityLog] = useState(familyTreeLogs || []);
  const [newLogEntry, setNewLogEntry] = useState('');

  useEffect(() => {
    setActivityLog(familyTreeLogs || []);
  }, [familyTreeLogs]);

  const handleAddLogEntry = (e) => {
    e.preventDefault();
    if (!newLogEntry.trim()) return;

    if (!familyTree?.id) {
      alert('Cannot add log entry: missing tree ID.');
      return;
    }

    router.post(
      route('family-trees.logs.store', { familyTree: familyTree.id }),
      { content: newLogEntry },
      {
        preserveScroll: true,
        onSuccess: () => {
          setNewLogEntry('');
        },
        onError: (errors) => {
          console.error("Error adding log entry:", errors);
          if (errors.content) {
            alert(`Error: ${errors.content}`);
          } else {
            alert("An error occurred while adding your log entry.");
          }
        }
      }
    );
  };

  const handleLikeLogEntry = (id) => {
    setActivityLog((prev) =>
      prev.map((e) => (e.id === id ? { ...e, likes: (e.likes || 0) + 1 } : e))
    );
    console.log("Like functionality (backend) not yet implemented for log ID:", id);
  };

  // Define breadcrumbs for the AppLayout
  const breadcrumbs = [
    {
      title: 'Family Trees',
      href: '/family-trees',
    },
    {
      title: familyTree?.name || 'Details',
      href: familyTree?.id ? `/family-trees/${familyTree.id}` : '',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Family Tree – ${familyTree?.name || 'Details'}`} />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 family-tree">
        {/* Alerts Section */}
        <div className="alerts mb-6">
          {flash?.success && (
            <div role="alert" className="bg-qindred-green-50/50 dark:bg-qindred-green-900/20 border-l-4 border-qindred-green-500 p-4 mb-4">
              <p className="text-qindred-green-700 dark:text-qindred-green-300">{flash.success}</p>
            </div>
          )}
          {flash?.error && (
            <div role="alert" className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 dark:text-red-300">{flash.error}</p>
            </div>
          )}
          {pageErrors && Object.keys(pageErrors).length > 0 && (
            <div role="alert" className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
              <p className="font-medium text-red-700 dark:text-red-300">Please correct the following errors:</p>
              <ul className="list-disc pl-5 mt-1 text-red-700 dark:text-red-300">
                {Object.entries(pageErrors).map(([key, error]) => (
                  <li key={`page-${key}`}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Basic Info Section */}
        <section className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-qindred-green-100 dark:border-qindred-green-800/30">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-qindred-green-900 dark:text-qindred-green-500">
              {familyTree?.name || 'Family Tree Details'}
            </h1>
            {familyTree?.description && (
              <p className="mt-2 text-qindred-green-700 dark:text-qindred-green-300">
                {familyTree.description}
              </p>
            )}
          </div>
          <div className="mb-6">
            <p className="text-xs md:text-sm text-qindred-green-700/70 dark:text-qindred-green-400/70">
              Created: {familyTree?.created_at} | Your Role:{' '}
              <span className="font-medium text-qindred-green-800 dark:text-qindred-green-400">{familyTree?.user_role_in_tree || 'Member'}</span>
              {familyTree?.is_creator && (
                <span className="ml-2 px-2 py-0.5 bg-qindred-green-100 dark:bg-qindred-green-800/50 text-qindred-green-700 dark:text-qindred-green-300 text-xs font-semibold rounded-full">
                  Creator
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {familyTree?.id && (
                <>
                  <Link
                    href={route('family-trees.edit', { family_tree: familyTree.id })}
                    className="inline-block px-4 py-2 bg-qindred-green-600 hover:bg-qindred-green-700 text-white rounded-md text-sm font-medium shadow-sm"
                  >
                    Edit Tree Details
                  </Link>
                  <Link
                    href={route('invitations.index')}
                    className="inline-block px-4 py-2 bg-qindred-green-700 hover:bg-qindred-green-800 text-white rounded-md text-sm font-medium shadow-sm"
                  >
                    Manage Invitations
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Tree Visualization Section */}
        <section className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold">Tree Structure</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut} aria-label="Zoom out">-</Button>
                <span className="text-sm w-16 text-center" aria-live="polite">
                  {(zoom * 100).toFixed(0)}%
                </span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} aria-label="Zoom in">+</Button>
                <Button variant="outline" size="sm" onClick={resetZoom}>Reset</Button>
              </div>
            </div>
          </div>

          <div className="tree-visualization border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-[500px] overflow-auto">
            {isTreeLoading && !displayTreeData ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Loading tree structure...</p>
              </div>
            ) : treeError ? (
              <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                Error loading tree: {typeof treeError === 'object' ? JSON.stringify(treeError) : treeError}
              </div>
            ) : displayTreeData && !displayTreeData.error ? (
              <div className="h-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <TreeComponent initialData={displayTreeData} />
              </div>
            ) : displayTreeData?.error && (
              <p role="alert" className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                Error in tree data: {displayTreeData.error}
              </p>
            )}
          </div>
        </section>

        {/* Members Section */}
        <section className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold">
              Members ({membersList?.length || 0})
            </h3>
            {familyTree?.id && (
              <ManageFamilyMembersButton
                familyTreeId={familyTree.id}
                onMembersUpdated={() => {
                  router.reload({ only: ['membersList', 'hierarchicalTreeData'], preserveScroll: true });
                }}
              />
            )}
          </div>

          <div className="members-grid">
            <FamilyMemberList membersList={membersList} />
          </div>
        </section>


        {/* Activity Log Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-6">Family Tree Log & Notes</h3>
          <form onSubmit={handleAddLogEntry} className="mb-6">
            <Label htmlFor="new-log-entry" className="block mb-2">
              Share an update or note
            </Label>
            <Textarea
              id="new-log-entry"
              className="mb-3"
              value={newLogEntry}
              onChange={(e) => setNewLogEntry(e.target.value)}
              placeholder="Write your note here..."
              rows={3}
              maxLength={500}
              required
              aria-label="New log entry"
              aria-describedby="log-entry-help"
            />
            <div className="flex justify-end">
              <Button type="submit">Add to Log</Button>
            </div>
          </form>
          <div className="space-y-4">
            {activityLog.length ? activityLog.map(entry => (
              <div key={entry.id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {entry.author?.avatar ? (
                      <img
                        src={entry.author.avatar}
                        alt={entry.author.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { 
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.parentElement.innerHTML = entry.author.name.charAt(0).toUpperCase();
                        }}
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {(entry.author?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{entry.author?.name || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{entry.timestamp || entry.created_at}</div>
                  </div>
                </div>
                <p className="mb-3">{entry.content}</p>
                <button 
                  type="button"
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
                  onClick={() => handleLikeLogEntry(entry.id)}
                >
                  👍 {entry.likes || 0}
                </button>
              </div>
            )) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No activity or notes logged yet.
              </p>
            )}
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
