import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing family tree visualization state
 * 
 * @param {Object} initialTreeData - Initial hierarchical tree data
 * @param {string} currentUserId - ID of the currently logged-in user
 * @returns {Object} Tree state and utility functions
 */
export function useFamilyTree(initialTreeData, currentUserId) {
  const [treeData, setTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  
  /**
   * Helper function to mark the current user in the tree data
   */
  const markCurrentUser = useCallback((data, userId) => {
    if (!data || !userId) return data;
    
    // Create a deep copy to avoid mutating props
    const copyData = JSON.parse(JSON.stringify(data));
    
    // Recursive function to find and mark the current user
    function traverse(node) {
      if (!node) return;
      
      // Mark this node if it matches the current user ID
      if (node.userId === userId) {
        node.currentUser = true;
      }
      
      // Continue traversing children
      if (node.children && node.children.length) {
        node.children.forEach(child => traverse(child));
      }
    }
    
    traverse(copyData);
    return copyData;
  }, []);
  // Process tree data when it changes
  useEffect(() => {
    setIsLoading(true);
    
    try {
      if (!initialTreeData) {
        setError('No tree data provided');
        setTreeData(null);
        return;
      }
      
      if (initialTreeData.error) {
        setError(initialTreeData.error);
        setTreeData(initialTreeData);
        return;
      }
      
      // Process the tree data to mark the current user if found
      const processedData = markCurrentUser(initialTreeData, currentUserId);
      setTreeData(processedData);
      setError(null);
    } catch (err) {
      console.error('Error processing tree data:', err);
      setError(err.message || 'Failed to process tree data');
    } finally {
      setIsLoading(false);
    }
  }, [initialTreeData, currentUserId, markCurrentUser]);
  
  
  
  // Zoom control functions
  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  }, []);
  
  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);
  
  return {
    treeData,
    isLoading,
    error,
    zoom,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
  };
}
