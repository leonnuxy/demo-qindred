import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { MEMBER_MODES, relationshipCategories } from '../utils/constants';

export function MemberForm({
  member,
  onInputChange,
  onSelectChange,
  onSubmit,
  onCancel,
  isLoading,
  mode = 'add',
  relationshipTypes = [],
  validationErrors = null,
  familyMembers = [] // Add family members for spouse selection
}) {
  const formPrefix = mode === 'edit' ? 'edit-' : 'new-';
  const isEditMode = mode === 'edit';
  const [formErrors, setFormErrors] = useState(validationErrors);

  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors(null);
    
    // Validate required fields
    const errors = {};
    if (!member.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!member.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!member.relationshipToUser) {
      errors.relationshipToUser = 'Relationship to you is required';
    }
    
    // If there are errors, display them and prevent submission
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Otherwise, proceed with submission
    onSubmit(e);
  };

  const renderRelationshipSelect = () => (
    <div className="member-form-section">
      <Label htmlFor={`${formPrefix}relationshipToUser`} className="member-form-label member-form-label-required">
        Relationship to you
      </Label>
      <Select
        name="relationshipToUser"
        value={member.relationshipToUser || undefined}
        onValueChange={(value) => onSelectChange('relationshipToUser', value)}
        required
      >
        <SelectTrigger id={`${formPrefix}relationshipToUser`} className="member-form-select-full-width">
          <SelectValue placeholder="Select relationship" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(relationshipCategories).map(([category, types]) => {
            const categoryTypes = relationshipTypes.filter(rt => types.includes(rt.value));
            if (categoryTypes.length === 0) return null;
            
            return (
              <SelectGroup key={category}>
                <SelectLabel className="member-relationship-category-label">{category}</SelectLabel>
                {categoryTypes.map((rt) => (
                  <SelectItem key={rt.value} value={rt.value}>
                    {rt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
      {formErrors?.relationshipToUser && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formErrors.relationshipToUser}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderSpouseSelection = () => {
    // Only show spouse selection for child relationships
    if (member.relationshipToUser !== 'child') return null;

    // Filter family members to show potential spouses (excluding current user's children and siblings)
    const potentialSpouses = familyMembers.filter(fm => 
      fm.relationshipToUser === 'spouse' && fm.id !== member.id
    );

    if (potentialSpouses.length === 0) return null;

    return (
      <div className="member-form-section">
        <Label htmlFor={`${formPrefix}spouseId`} className="member-form-label">
          Other Parent (Optional)
        </Label>
        <Select
          name="spouseId"
          value={member.spouseId || undefined}
          onValueChange={(value) => onSelectChange('spouseId', value)}
        >
          <SelectTrigger id={`${formPrefix}spouseId`} className="member-form-select-full-width">
            <SelectValue placeholder="Select other parent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {potentialSpouses.map((spouse) => (
              <SelectItem key={spouse.id} value={spouse.id}>
                {spouse.firstName} {spouse.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="member-form-help-text">
          Select the other parent if this child has two parents in the family tree.
        </p>
      </div>
    );
  };

  const renderMemberTypeSelect = () => {
    if (isEditMode) return null;

    return (
      <div className="member-add-method-container">
        <Label className="member-add-method-label">Add Method</Label>
        <Select
          value={member.type}
          onValueChange={(v) => onSelectChange('type', v)}
        >
          <SelectTrigger className="member-form-select-full-width">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MEMBER_MODES.INVITE}>Invite via Email</SelectItem>
            <SelectItem value={MEMBER_MODES.DIRECT}>Add Directly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {renderMemberTypeSelect()}

      {member.type === MEMBER_MODES.INVITE ? (
        <div>
          <Label htmlFor={`${formPrefix}email`} className="form-label member-form-label-required">
            Member's Email
          </Label>
          <Input
            type="email"
            id={`${formPrefix}email`}
            name="email"
            value={member.email}
            onChange={(e) => onInputChange(e)}
            className="member-form-input"
            required
          />
        </div>
      ) : (
        <>
          <div className="member-form-grid-2">
            <div>
              <Label htmlFor={`${formPrefix}firstName`} className="form-label member-form-label-required">
                First Name
              </Label>
              <Input
                type="text"
                id={`${formPrefix}firstName`}
                name="firstName"
                value={member.firstName}
                onChange={(e) => onInputChange(e)}
                className="member-form-input"
                required
              />
              {formErrors?.firstName && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formErrors.firstName}</AlertDescription>
                </Alert>
              )}
            </div>
            <div>
              <Label htmlFor={`${formPrefix}lastName`} className="form-label member-form-label-required">
                Last Name
              </Label>
              <Input
                type="text"
                id={`${formPrefix}lastName`}
                name="lastName"
                value={member.lastName}
                onChange={(e) => onInputChange(e)}
                className="member-form-input"
                required
              />
              {formErrors?.lastName && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formErrors.lastName}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor={`${formPrefix}gender`} className="form-label">
              Gender
            </Label>
            <Select
              value={member.gender || undefined}
              onValueChange={(value) => onSelectChange('gender', value)}
            >
              <SelectTrigger className="member-form-select-trigger">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`${formPrefix}dateOfBirth`} className="form-label">
              Date of Birth
            </Label>
            <Input
              type="date"
              id={`${formPrefix}dateOfBirth`}
              name="dateOfBirth"
              value={member.dateOfBirth || ''}
              onChange={(e) => onInputChange(e)}
              className="member-form-input"
            />
          </div>

          <div className="member-form-checkbox-container">
            <Checkbox
              id={`${formPrefix}isDeceased`}
              name="isDeceased"
              checked={member.isDeceased}
              onCheckedChange={(checked) =>
                onSelectChange('isDeceased', checked)
              }
            />
            <Label
              htmlFor={`${formPrefix}isDeceased`}
              className="member-deceased-checkbox-label"
            >
              Deceased
            </Label>
          </div>

          {member.isDeceased && (
            <div>
              <Label htmlFor={`${formPrefix}dateOfDeath`} className="form-label">
                Date of Death
              </Label>
              <Input
                type="date"
                id={`${formPrefix}dateOfDeath`}
                name="dateOfDeath"
                value={member.dateOfDeath || ''}
                onChange={(e) => onInputChange(e)}
                className="member-form-input"
              />
            </div>
          )}
        </>
      )}

      {renderRelationshipSelect()}
      {renderSpouseSelection()}

      <div className="member-form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="member-form-cancel-button"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="member-form-submit-button"
        >
          {isLoading
            ? isEditMode
              ? "Saving..."
              : member.type === MEMBER_MODES.INVITE
              ? "Sending..."
              : "Adding..."
            : isEditMode
            ? "Save Changes"
            : member.type === MEMBER_MODES.INVITE
            ? "Send Invite"
            : "Add Member"}
        </Button>
      </div>
    </form>
  );
}
