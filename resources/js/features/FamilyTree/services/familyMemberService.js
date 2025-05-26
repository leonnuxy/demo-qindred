import axios from 'axios';

/**
 * Get family members for a specific tree
 * @param {string} treeId - The family tree ID
 * @returns {Promise<Array>} - Array of family members
 */
export async function getFamilyMembers(treeId) {
  try {
    console.log(`Fetching family members for tree ${treeId}`);
    const response = await axios.get(`/api/family-trees/${treeId}/members`);
    
    // Debug the response
    console.log('Raw API response:', response.data);
    
    // Ensure we're properly extracting data from the response
    const members = response.data.data || response.data || [];
    
    // Process members to ensure consistent format
    return members.map(member => ({
      ...member,
      // If firstName/lastName are not available, try to parse from name
      firstName: member.firstName || (member.user?.name ? member.user.name.split(' ')[0] : ''),
      lastName: member.lastName || (member.user?.name ? member.user.name.split(' ').slice(1).join(' ') : ''),
      // Ensure relationshipToUser property exists and is not empty
      relationshipToUser: member.relationshipToUser || member.role || 'other',
      // Ensure consistent date formats
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : null,
      dateOfDeath: member.dateOfDeath ? new Date(member.dateOfDeath).toISOString().split('T')[0] : null,
    }));
  } catch (error) {
    console.error('Error fetching family members:', error);
    // Log detailed error information for debugging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

/**
 * Add a new family member
 * @param {string} treeId - The family tree ID
 * @param {Object} memberData - Member data to add
 * @returns {Promise<Object>} - The newly created member
 */
export async function addFamilyMember(treeId, memberData) {
  try {
    console.log(`Adding family member to tree ${treeId}`, memberData);
    const response = await axios.post(`/api/family-trees/${treeId}/members`, memberData);
    return response.data;
  } catch (error) {
    console.error('Error adding family member:', error);
    // Log detailed error information for debugging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

/**
 * Update an existing family member
 * @param {string} treeId - The family tree ID
 * @param {string} memberId - The member ID to update
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} - The updated member
 */
export async function updateFamilyMember(treeId, memberId, memberData) {
  try {
    console.log(`Updating family member: ${memberId} in tree ${treeId}`);
    const response = await axios.put(`/api/family-trees/${treeId}/members/${memberId}`, memberData);
    return response.data;
  } catch (error) {
    console.error('Error updating family member:', error);
    // Log detailed error information for debugging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

/**
 * Delete a family member
 * @param {string} treeId - The family tree ID
 * @param {string} memberId - The member ID to delete
 * @returns {Promise<void>}
 */
export async function deleteFamilyMember(treeId, memberId) {
  try {
    await axios.delete(`/api/family-trees/${treeId}/members/${memberId}`);
  } catch (error) {
    console.error('Error deleting family member:', error);
    throw error;
  }
}

/**
 * Get available relationship types
 * @returns {Promise<Array>} - Array of relationship types
 */
export async function getRelationshipTypes() {
  try {
    const response = await axios.get('/api/relationship-types');
    
    // Format the relationship types for UI
    return (response.data || []).map(type => ({
      value: type.value || type.id,
      label: type.label || type.name,
      reciprocal: type.reciprocal || null
    }));
  } catch (error) {
    console.error('Error fetching relationship types:', error);
    
    // Return basic relationship types as fallback
    return [
      { value: 'parent', label: 'Parent' },
      { value: 'child', label: 'Child' },
      { value: 'spouse', label: 'Spouse' },
      { value: 'sibling', label: 'Sibling' },
      { value: 'other', label: 'Other' },
    ];
  }
}
