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
    
    // Debug the raw response structure
    console.log('API response structure:', {
      hasDataProperty: response.data?.data !== undefined,
      topLevelIsArray: Array.isArray(response.data),
      responseDataType: typeof response.data
    });
    
    // Ensure we're properly extracting data from the response
    const members = response.data.data || response.data || [];      // Process members to ensure consistent format with frontend expectations
      const processedMembers = members.map(member => ({
        ...member,
        // If firstName/lastName are not available, try to parse from name
        firstName: member.firstName || (member.user?.name ? member.user.name.split(' ')[0] : ''),
        lastName: member.lastName || (member.user?.name ? member.user.name.split(' ').slice(1).join(' ') : ''),
        // Ensure relationshipToUser property exists and is not empty
        relationshipToUser: member.relationshipToUser || member.role || 'other',
        // Frontend uses 'type' field for add mode
        type: member.addMode || 'direct',
        // Ensure consistent date formats
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : null,
        dateOfDeath: member.dateOfDeath ? new Date(member.dateOfDeath).toISOString().split('T')[0] : null,
        // Add isCreator flag based on role
        isCreator: member.isCreator || member.roleInTree === 'admin' || member.role === 'admin',
      }));
      
      console.log('Processed members for component:', processedMembers);
      return processedMembers;
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
 * @returns {Promise<Object>} - The newly created member with optional hierarchical tree data
 */
export async function addFamilyMember(treeId, memberData) {
  try {
    console.log('Adding family member to tree:', treeId);
    console.log('Member data:', memberData);

    // Check if we're adding a spouse - we need special handling for this case
    // to prevent duplication issues
    const isAddingSpouse = memberData.relationshipToUser === 'spouse';
    console.log('Is adding spouse?', isAddingSpouse);
    
    // Clean up data for submission
    const transformedData = {
      firstName: memberData.firstName?.trim() || '',
      lastName: memberData.lastName?.trim() || '',
      relationshipToUser: memberData.relationshipToUser || 'other',
      addMode: 'direct', // Required by the API
      isDeceased: Boolean(memberData.isDeceased || false), // Required by the API
      // Set a placeholder email if needed for direct additions
      email: memberData.email?.trim() || null,
    };
    
    // Include these fields only if they have values
    if (memberData.gender !== undefined) {
      transformedData.gender = memberData.gender || null;
    }
    
    if (memberData.dateOfBirth) {
      transformedData.dateOfBirth = memberData.dateOfBirth;
    }
    
    // Handle death date only if deceased
    if (memberData.isDeceased && memberData.dateOfDeath) {
      transformedData.dateOfDeath = memberData.dateOfDeath;
    }
    
    console.log('Transformed data for API:', transformedData);
    
    // Send the request
    const response = await axios.post(
      `/api/family-trees/${treeId}/members`, 
      transformedData
    );
    
    // Process the response
    console.log('API response for add member:', response.data);
    
    // Check if hierarchicalTreeData was returned
    const { hierarchicalTreeData, ...memberPayload } = response.data;
    
    // Process the member data
    const processedMember = {
      ...memberPayload,
      firstName: memberPayload.firstName || '',
      lastName: memberPayload.lastName || '',
      relationshipToUser: memberPayload.relationshipToUser || 'other',
      dateOfBirth: memberPayload.dateOfBirth ? new Date(memberPayload.dateOfBirth).toISOString().split('T')[0] : null,
      dateOfDeath: memberPayload.dateOfDeath ? new Date(memberPayload.dateOfDeath).toISOString().split('T')[0] : null,
    };
    
    // Return the processed member with hierarchical tree data if available
    return hierarchicalTreeData 
      ? { ...processedMember, hierarchicalTreeData } 
      : processedMember;
  } catch (error) {
    console.error('Error adding family member:', error);
    // Detailed error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Update an existing family member
 * @param {string} treeId - The family tree ID
 * @param {string} memberId - The member ID to update
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} - The updated member with optional hierarchical tree data
 */
export async function updateFamilyMember(treeId, memberId, memberData) {
  try {
    console.log(`Updating member ${memberId} in tree ${treeId}`);
    console.log('Update data:', memberData);
    
    // Clean up data for submission
    const transformedData = {
      firstName: memberData.firstName?.trim(),
      lastName: memberData.lastName?.trim(),
      relationshipToUser: memberData.relationshipToUser,
    };
    
    if (memberData.gender !== undefined) {
      transformedData.gender = memberData.gender;
    }
    
    if (memberData.dateOfBirth) {
      transformedData.dateOfBirth = memberData.dateOfBirth;
    }
    
    if (memberData.isDeceased !== undefined) {
      transformedData.isDeceased = Boolean(memberData.isDeceased);
      
      if (memberData.isDeceased && memberData.dateOfDeath) {
        transformedData.dateOfDeath = memberData.dateOfDeath;
      }
    }
    
    // Send the request
    const response = await axios.put(
      `/api/family-trees/${treeId}/members/${memberId}`, 
      transformedData
    );
    
    console.log('API response for update member:', response.data);
    
    // Check if hierarchicalTreeData was returned
    const { hierarchicalTreeData, ...memberPayload } = response.data;
    
    // Process the member data
    const processedMember = {
      ...memberPayload,
      // Ensure consistent formatting
      firstName: memberPayload.firstName || '',
      lastName: memberPayload.lastName || '',
      relationshipToUser: memberPayload.relationshipToUser || 'other',
      dateOfBirth: memberPayload.dateOfBirth ? new Date(memberPayload.dateOfBirth).toISOString().split('T')[0] : null,
      dateOfDeath: memberPayload.dateOfDeath ? new Date(memberPayload.dateOfDeath).toISOString().split('T')[0] : null,
    };
    
    // Return the processed member with hierarchical tree data if available
    return hierarchicalTreeData 
      ? { ...processedMember, hierarchicalTreeData } 
      : processedMember;
  } catch (error) {
    console.error('Error updating family member:', error);
    // Detailed error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
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
    console.log(`Deleting family member: ${memberId} from tree: ${treeId}`);
    if (!memberId) {
      throw new Error('Member ID is required for deletion');
    }
    
    const response = await axios.delete(`/api/family-trees/${treeId}/members/${memberId}`);
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting family member:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
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
