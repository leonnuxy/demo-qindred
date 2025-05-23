// resources/js/features/FamilyTree/services/familyTreeService.js
const headers = {
  'Content-Type': 'application/json',
  'Accept':       'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'X-CSRF-TOKEN': document.head.querySelector('[name=csrf-token]')?.content
};

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
};
