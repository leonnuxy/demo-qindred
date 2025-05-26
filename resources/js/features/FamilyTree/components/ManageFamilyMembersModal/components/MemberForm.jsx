import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  relationshipTypes = []
}) {
  const formPrefix = mode === 'edit' ? 'edit-' : 'new-';
  const isEditMode = mode === 'edit';

  const renderRelationshipSelect = () => (
    <div className="mb-5">
      <Label htmlFor={`${formPrefix}relationshipToUser`} className="block mb-2">
        Relationship to you <span className="text-red-500">*</span>
      </Label>
      <Select
        name="relationshipToUser"
        value={member.relationshipToUser || ''}
        onValueChange={(value) => onSelectChange('relationshipToUser', value)}
        required
      >
        <SelectTrigger id={`${formPrefix}relationshipToUser`} className="w-full">
          <SelectValue placeholder="Select relationship" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(relationshipCategories).map(([category, types]) => {
            const categoryTypes = relationshipTypes.filter(rt => types.includes(rt.value));
            if (categoryTypes.length === 0) return null;
            
            return (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
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
    </div>
  );

  const renderMemberTypeSelect = () => {
    if (isEditMode) return null;

    return (
      <div className="mb-4">
        <Label className="block text-sm font-medium mb-1">Add Method</Label>
        <Select
          value={member.type}
          onValueChange={(v) => onSelectChange('type', v)}
        >
          <SelectTrigger className="w-full">
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
    <form onSubmit={onSubmit} className="space-y-4">
      {renderMemberTypeSelect()}

      {member.type === MEMBER_MODES.INVITE ? (
        <div>
          <Label htmlFor={`${formPrefix}email`} className="form-label">
            Member's Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            id={`${formPrefix}email`}
            name="email"
            value={member.email}
            onChange={(e) => onInputChange(e)}
            className="mt-1"
            required
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${formPrefix}firstName`} className="form-label">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id={`${formPrefix}firstName`}
                name="firstName"
                value={member.firstName}
                onChange={(e) => onInputChange(e)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor={`${formPrefix}lastName`} className="form-label">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id={`${formPrefix}lastName`}
                name="lastName"
                value={member.lastName}
                onChange={(e) => onInputChange(e)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`${formPrefix}gender`} className="form-label">
              Gender
            </Label>
            <Select
              value={member.gender || ''}
              onValueChange={(value) => onSelectChange('gender', value)}
            >
              <SelectTrigger className="mt-1 w-full">
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
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
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
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                className="mt-1"
              />
            </div>
          )}
        </>
      )}

      {renderRelationshipSelect()}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
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
