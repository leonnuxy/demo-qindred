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
    
    console.log('Full raw tree data from backend:', data);
    
    // Create a deep copy to avoid mutating props
    const copyData = JSON.parse(JSON.stringify(data));
    
    // Normalize fields to ensure all nodes have required properties
    function normalizeNode(node) {
      if (!node) return null;
      
      // Extract data from backend format
      const nameParts = node.name ? node.name.split(' ') : ['?', ''];
      
      // Preserve all original attributes from the backend
      const attributes = {
        ...(node.attributes || {}),
      };
      
      // Ensure all nodes have these fields with default values, prioritizing actual fields from backend
      node.firstName = node.firstName || nameParts[0] || '?';
      node.lastName = node.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
      node.dateOfBirth = node.dateOfBirth || attributes.birth_date || '';
      node.dateOfDeath = node.dateOfDeath || attributes.death_date || '';
      node.gender = node.gender || attributes.gender || 'other';
      node.relationshipToUser = node.relationshipToUser || attributes.relationship_to_user || '';
      
      // Preserve any additional data that might be present
      node.attributes = attributes;
      
      // Mark this node if it matches the current user ID
      if (node.id === userId) {
        node.isCurrentUser = true;
        console.log('Found current user:', node);
      }
      
      // Recurse through partners if present
      if (node.partners && Array.isArray(node.partners)) {
        node.partners = node.partners
          .filter(Boolean)
          .map(partner => normalizeNode(partner));
      }
      
      // Continue traversing children
      if (node.children && Array.isArray(node.children)) {
        node.children = node.children
          .filter(Boolean)
          .map(child => normalizeNode(child));
      }
      
      return node;
    }
    
    return normalizeNode(copyData);
  }, []);
  // Process tree data when it changes
  useEffect(() => {
    setIsLoading(true);
    
    try {
      console.log('Processing initial tree data:', initialTreeData);
      
      if (!initialTreeData) {
        console.warn('No tree data provided');
        setError('No tree data provided');
        setTreeData({ firstName: '?', lastName: '', children: [] });
        return;
      }
      
      if (initialTreeData.error) {
        console.error('Error in tree data:', initialTreeData.error);
        setError(initialTreeData.error);
        setTreeData(initialTreeData);
        return;
      }
      
      // Create a unique identifier to detect changes in content
      // even if the reference doesn't change
      const treeDataId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      console.log(`Processing tree data with ID: ${treeDataId}`);
      
      // Process the tree data to mark the current user if found
      const processedData = markCurrentUser(initialTreeData, currentUserId);
      console.log('Processed tree data:', processedData);
      
      // Assign the unique ID to the processed data
      processedData._treeDataId = treeDataId;
      
      setTreeData(processedData);
      setError(null);
    } catch (error) {
      console.error('Error processing tree data:', error);
      setError(`Error processing tree data: ${error.message}`);
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
