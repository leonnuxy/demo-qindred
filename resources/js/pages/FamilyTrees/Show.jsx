import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TreeComponent from '@/features/FamilyTree/components/TreeComponent';
import { useFamilyTree } from '@/features/FamilyTree/hooks/useFamilyTree';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ManageFamilyMembersButton from '@/features/FamilyTree/components/ManageFamilyMembersButton';
import Avatar from '@/components/Avatar';
import '@css/pages/invitations.css';
import FamilyMemberList from '@/features/FamilyTree/components/FamilyMemberList';

// Import mock data
import dataBasic from './mock/data_basic.json';
import dataMid from './mock/data_mid.json';
import dataMax from './mock/data_max.json';

export default function Show({
  familyTree: initialFamilyTree,
  hierarchicalTreeData: initialHierarchicalTreeData,
  membersList: initialMembersList,
  familyTreeLogs: initialFamilyTreeLogs
}) {
  const { auth, flash, errors: pageErrors } = usePage().props;
  const currentUser = auth.user;
  
  // State for mock data selection
  const [mockDataType, setMockDataType] = useState('real');
  const [familyTree, setFamilyTree] = useState(initialFamilyTree);
  const [hierarchicalTreeData, setHierarchicalTreeData] = useState(initialHierarchicalTreeData);
  const [membersList, setMembersList] = useState(initialMembersList);
  const [familyTreeLogs, setFamilyTreeLogs] = useState(initialFamilyTreeLogs);

  // State for root switching
  const [rootOptions, setRootOptions] = useState([]);
  const [currentRootId, setCurrentRootId] = useState(hierarchicalTreeData?.id);
  const [isLoadingRootOptions, setIsLoadingRootOptions] = useState(false);
  const [isLoadingTreeData, setIsLoadingTreeData] = useState(false);

  // Handle mock data changes
  const handleMockDataChange = (value) => {
    let selectedData;
    switch (value) {
      case 'basic':
        selectedData = dataBasic;
        break;
      case 'mid':
        selectedData = dataMid;
        break;
      case 'max':
        selectedData = dataMax;
        break;
      default:
        selectedData = {
          familyTree: initialFamilyTree,
          hierarchicalTreeData: initialHierarchicalTreeData,
          membersList: initialMembersList,
          familyTreeLogs: initialFamilyTreeLogs
        };
    }

    setMockDataType(value);
    setFamilyTree(selectedData.familyTree);
    setHierarchicalTreeData(selectedData.hierarchicalTreeData);
    setMembersList(selectedData.membersList);
    setFamilyTreeLogs(selectedData.familyTreeLogs);
  };

  // Add debug logging to see the raw tree data from the backend
  console.log('Raw hierarchicalTreeData:', hierarchicalTreeData);
  console.log('Current user ID:', currentUser?.id);
  console.log('Members list:', membersList);
  
  // Check if there is a direct match to ensure the current user is identified in the tree
  if (hierarchicalTreeData && currentUser?.id && hierarchicalTreeData.id === currentUser.id) {
    console.log("Current user is the root node of the tree");
  }

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

  // Load root options when component mounts or familyTree changes
  useEffect(() => {
    if (familyTree?.id && mockDataType === 'real') {
      loadRootOptions();
    }
  }, [familyTree?.id, mockDataType]);

  useEffect(() => {
    setActivityLog(familyTreeLogs || []);
  }, [familyTreeLogs]);

  // Load available root options from backend
  const loadRootOptions = async () => {
    if (!familyTree?.id) return;

    setIsLoadingRootOptions(true);
    try {
      const response = await fetch(route('family-trees.root-options', { family_tree: familyTree.id }), {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRootOptions(data.data || []);
      } else {
        console.error('Failed to load root options');
      }
    } catch (error) {
      console.error('Error loading root options:', error);
    } finally {
      setIsLoadingRootOptions(false);
    }
  };

  // Handle root perspective change
  const handleRootChange = async (newRootId) => {
    if (!familyTree?.id || newRootId === currentRootId) return;

    setIsLoadingTreeData(true);
    setCurrentRootId(newRootId);

    try {
      // Reload the page with the new root perspective
      router.get(route('family-trees.show', { family_tree: familyTree.id }), {
        root_user_id: newRootId,
      }, {
        preserveState: false,
        onSuccess: () => {
          setIsLoadingTreeData(false);
        },
        onError: () => {
          setIsLoadingTreeData(false);
          // Revert the selection on error
          setCurrentRootId(hierarchicalTreeData?.id);
        }
      });
    } catch (error) {
      console.error('Error changing root perspective:', error);
      setIsLoadingTreeData(false);
      setCurrentRootId(hierarchicalTreeData?.id);
    }
  };

  const handleAddLogEntry = (e) => {
    e.preventDefault();
    if (!newLogEntry.trim()) return;

    if (!familyTree?.id) {
      alert('Cannot add log entry: missing tree ID.');
      return;
    }

    router.post(
      route('family-trees.logs.store', { family_tree: familyTree.id }),
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

      <div className="invitations-page-wrapper">
        <div className="invitations-page flex h-full flex-1 flex-col gap-4 rounded-xl p-4 family-tree">
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
            {/* Mock Data Selector - Development Only */}
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div className="w-full md:w-64">
                <Label htmlFor="mock-data-select" className="block text-sm font-medium mb-2">
                  Select Data Source (Dev Only)
                </Label>
                <Select value={mockDataType} onValueChange={handleMockDataChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real">Real Data</SelectItem>
                    <SelectItem value="basic">Basic Family (Self)</SelectItem>
                    <SelectItem value="mid">Extended Family</SelectItem>
                    <SelectItem value="max">Large Family Tree</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Clear browser storage
                    if (typeof window !== 'undefined') {
                      localStorage.clear();
                      sessionStorage.clear();
                    }
                    // Force reload from server
                    router.reload({ only: ['hierarchicalTreeData', 'membersList', 'familyTreeLogs'] });
                  }}
                  className="whitespace-nowrap"
                >
                  🔄 Force Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Hard reload the entire page
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  className="whitespace-nowrap"
                >
                  🔄 Hard Reload
                </Button>
              </div>
            </div>

            <div className="invitations-page-header mb-4">
              <h1 className="invitations-page-title text-3xl font-bold text-qindred-green-900 dark:text-qindred-green-500">
                {familyTree?.name || 'Family Tree Details'}
              </h1>
              {familyTree?.description && (
                <p className="invitations-page-description mt-2 text-qindred-green-700 dark:text-qindred-green-300">
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
                      className="inline-block px-4 py-2 bg-[oklch(62.7%_0.194_149.214)] hover:bg-[oklch(57%_0.19_149)] text-white rounded-md text-sm font-medium shadow-sm"
                    >
                      Edit Tree Details
                    </Link>
                    <Link
                      href={route('invitations.index')}
                      className="inline-block px-4 py-2 bg-[oklch(62.7%_0.194_149.214)] hover:bg-[oklch(57%_0.19_149)] text-white rounded-md text-sm font-medium shadow-sm"
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
                <div className="flex items-center gap-4">
                  {/* Root Perspective Selector */}
                  {mockDataType === 'real' && rootOptions.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="root-selector" className="text-sm font-medium whitespace-nowrap">
                        View tree as:
                      </Label>
                      <Select 
                        value={currentRootId?.toString() || ''} 
                        onValueChange={handleRootChange}
                        disabled={isLoadingRootOptions || isLoadingTreeData}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder={isLoadingRootOptions ? "Loading..." : "Select perspective"} />
                        </SelectTrigger>
                        <SelectContent>
                          {rootOptions.map((option) => (
                            <SelectItem key={`${option.type}-${option.value}`} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isLoadingTreeData && (
                        <div className="text-sm text-gray-500">Loading...</div>
                      )}
                    </div>
                  )}
                  
                  {/* Zoom Controls */}
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
                <div className="h-full w-full">
                  <TreeComponent 
                    initialData={displayTreeData} 
                    zoom={zoom}
                    onNodeClick={(node) => console.log('Node clicked:', node)} 
                  />
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
                <Button
                  type="submit"
                  className="bg-[oklch(62.7%_0.194_149.214)] hover:bg-[oklch(57%_0.19_149)] text-white"
                >
                  Add to Log
                </Button>
              </div>
            </form>
            <div className="space-y-4">
              {activityLog.length ? activityLog.map(entry => (
                <div key={entry.id} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar 
                      src={entry.author?.avatar || entry.user?.avatar_url}
                      name={entry.author?.name || entry.user?.name || 'Unknown User'}
                      className="w-10 h-10"
                    />
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
      </div>
    </AppLayout>
  );
}
