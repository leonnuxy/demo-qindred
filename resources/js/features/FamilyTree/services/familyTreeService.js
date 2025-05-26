// resources/js/features/FamilyTree/services/familyTreeService.js
const headers = {
  'Content-Type': 'application/json',
  'Accept':       'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'X-CSRF-TOKEN': document.head.querySelector('[name=csrf-token]')?.content
};

// Helper function to format URL with query params
function formatUrl(url, params = {}) {
  if (!Object.keys(params).length) return url;
  
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
    
  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
}

async function req(url, method='GET', body=null) {
  const opts = { method, headers, credentials: 'include' };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw await res.json();
  return res.status === 204 ? null : res.json();
}

export default {
  // Tree structure (if you have an endpoint)
  // fetchTree: id => req(`/api/family-trees/${id}/structure`),

  listMembers:   id => req(`/api/family-trees/${id}/members`),
  addMember:     (id,data) => req(`/api/family-trees/${id}/members`, 'POST', data),
  updateMember:  (id,mid,data) => req(`/api/family-trees/${id}/members/${mid}`, 'PUT', data),
  deleteMember:  (id,mid) => req(`/api/family-trees/${id}/members/${mid}`, 'DELETE'),
  relTypes:      () => req('/api/relationship-types'),

  sendInvite:    (id,data) => req(`/api/family-trees/${id}/invite`, 'POST', data),
  acceptInvite:  invId => req(`/api/invitations/${invId}/accept`, 'POST'),
  declineInvite: invId => req(`/api/invitations/${invId}/decline`, 'POST'),
  
  // New methods for fetching family trees with members
  /**
   * Fetch all family trees with their members
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.perPage - Items per page (max 50)
   * @param {string} options.search - Search term for tree name or description
   * @param {string} options.privacy - Filter by privacy setting (public/private)
   * @param {string} options.sortBy - Sort field (name, created_at, updated_at, privacy)
   * @param {string} options.sortDir - Sort direction (asc/desc)
   * @returns {Promise<Object>} - Family trees with members and pagination info
   */
  getTreesWithMembers: (options = {}) => {
    const params = {
      page: options.page,
      per_page: options.perPage,
      search: options.search,
      privacy: options.privacy,
      sort_by: options.sortBy,
      sort_dir: options.sortDir
    };
    
    return req(formatUrl('/api/family-trees/with-members', params));
  },
  
  /**
   * Get a single family tree with members
   * 
   * @param {string} treeId - Family tree ID
   * @returns {Promise<Object>} - Single family tree with members
   */
  getTreeWithMembers: async (treeId) => {
    try {
      const response = await req('/api/family-trees/with-members');
      
      // Find the tree in the response
      const tree = response.data.find(tree => tree.id === treeId);
      
      if (!tree) {
        throw new Error(`Family tree with ID ${treeId} not found`);
      }
      
      return tree;
    } catch (error) {
      console.error(`Error fetching family tree ${treeId}:`, error);
      throw error;
    }
  }
};
