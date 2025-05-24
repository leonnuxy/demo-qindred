import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

export function SendInvitationForm({ familyTrees = [], relationshipTypes = [] }) {
  // Skip rendering if no family trees available
  if (familyTrees?.length === 0) return null;
  
  const {
    data,
    setData,
    post: sendInvite,
    processing,
    errors,
    reset,
  } = useForm({
    email: '',
    family_tree_id: '',
    relationship_type: '',
  });
  
  // keep track of which tree we're inviting from
  const [selectedTree, setSelectedTree] = useState(
    familyTrees?.length === 1 ? String(familyTrees[0].id) : ''
  );
  
  useEffect(() => {
    setData('family_tree_id', selectedTree);
  }, [selectedTree]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    sendInvite(
      route('invitations.send', { family_tree: selectedTree }),
      {
        preserveScroll: true,
        onSuccess: () => reset('email', 'relationship_type'),
      }
    );
  };
  
  // Default relationship types if not provided
  const availableRelationshipTypes = relationshipTypes.length > 0 
    ? relationshipTypes 
    : [
        { value: 'parent', label: 'Parent' },
        { value: 'child', label: 'Child' },
        { value: 'spouse', label: 'Spouse' },
        { value: 'sibling', label: 'Sibling' },
        { value: 'other', label: 'Other' },
      ];
  
  return (
    <Card className="invitations-section">
      <CardHeader className="invitations-section-header">
        <CardTitle className="invitations-section-title">Send New Invitation</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="send-invitation-form">
          <div className="form-group">
            <Label htmlFor="family-tree" className="form-label">Family Tree *</Label>
            <Select
              value={selectedTree}
              onValueChange={setSelectedTree}
            >
              <SelectTrigger
                id="family-tree"
                className="form-select-trigger"
              >
                <SelectValue placeholder="Select a tree" />
              </SelectTrigger>

              <SelectContent>
                {familyTrees.map((tree) => (
                  <SelectItem key={tree.id} value={String(tree.id)}>
                    {tree.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.family_tree_id && (
              <p className="form-error-message">
                {errors.family_tree_id}
              </p>
            )}
          </div>

          <div className="form-group">
            <Label htmlFor="invite-email" className="form-label">Email Address *</Label>
            <Input
              id="invite-email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className="form-input"
              disabled={processing}
            />
            {errors.email && (
              <p className="form-error-message">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <Label htmlFor="relationship-type" className="form-label">Relationship to You *</Label>
            <Select
              value={data.relationship_type}
              onValueChange={(val) => setData('relationship_type', val)}
            >
              <SelectTrigger
                id="relationship-type"
                className="form-select-trigger"
              >
                <SelectValue placeholder="Select a relationship" />
              </SelectTrigger>

              <SelectContent>
                {availableRelationshipTypes.map((rel) => (
                  <SelectItem key={rel.value} value={rel.value}>
                    {rel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship_type && (
              <p className="form-error-message">
                {errors.relationship_type}
              </p>
            )}
          </div>

          <div className="invitation-actions">
            <Button
              type="submit"
              disabled={processing || !selectedTree || !data.relationship_type || !data.email}
              className="button-primary"
            >
              {processing ? 'Sending…' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
