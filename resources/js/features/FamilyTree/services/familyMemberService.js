import axios from 'axios';

/**
 * Get family members for a specific tree
 * @param {string} treeId - The family tree ID
 * @returns {Promise<Array>} - Array of family members
 */
export async function getFamilyMembers(treeId) {
  try {
    const response = await axios.get(`/api/family-trees/${treeId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching family members:', error);
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
    const response = await axios.post(`/api/family-trees/${treeId}/members`, memberData);
    return response.data;
  } catch (error) {
    console.error('Error adding family member:', error);
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
    const response = await axios.put(`/api/family-trees/${treeId}/members/${memberId}`, memberData);
    return response.data;
  } catch (error) {
    console.error('Error updating family member:', error);
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
    return response.data;
  } catch (error) {
    console.error('Error fetching relationship types:', error);
    throw error;
  }
}
