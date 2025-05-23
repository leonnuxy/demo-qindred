import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export default function FamilySetupStep({
  form = {},
  setForm,
  relationshipTypes = [],
  onNext,
  onBack,
  errors = {},
}) {
  // ensure members array
  const members = Array.isArray(form.membersToAdd) ? form.membersToAdd : []

  const [showAdd, setShowAdd] = useState(false)
  const [newMember, setNewMember] = useState({
    type: 'invite',
    email: '',
    firstName: '',
    lastName: '',
    relationshipToMe: '',
  })

  const handleAddMember = (e) => {
    e.preventDefault()
    // minimal validation
    if (newMember.type === 'invite' && !newMember.email) return
    if (
      newMember.type === 'direct_add' &&
      (!newMember.firstName || !newMember.lastName)
    )
      return
    if (!newMember.relationshipToMe) return

    setForm((prev) => ({
      ...prev,
      membersToAdd: [...members, { ...newMember }],
    }))

    setNewMember({
      type: 'invite',
      email: '',
      firstName: '',
      lastName: '',
      relationshipToMe: '',
    })
    setShowAdd(false)
  }

  const removeMember = (i) => {
    setForm((prev) => ({
      ...prev,
      membersToAdd: members.filter((_, idx) => idx !== i),
    }))
  }

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Create Your Family Tree</h2>
        <p className="mt-2 text-sm text-gray-600">
          Set up your first family tree and invite your family members
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onNext()
        }}
        className="space-y-6"
      >
        {/* Family Name */}
        <div>
          <label htmlFor="familyName" className="block text-sm font-medium">
            Family Name
          </label>
          <Input
            id="familyName"
            name="familyName"
            value={form.familyName || ''}
            onChange={(e) => handleField('familyName', e.target.value)}
            placeholder="e.g. The Smith Family"
            className="mt-1"
          />
          {errors.familyName && (
            <p className="mt-1 text-sm text-red-600">{errors.familyName}</p>
          )}
        </div>

        {/* Your Role in Family */}
        <div>
          <label htmlFor="familyRole" className="block text-sm font-medium mb-1">
            Your Role in Family
          </label>
          <Select
            value={form.familyRole || ''}
            onValueChange={(v) => handleField('familyRole', v)}
          >
            <SelectTrigger className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {relationshipTypes.map((rt) => (
                <SelectItem key={rt.value} value={rt.value}>
                  {rt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.familyRole && (
            <p className="mt-1 text-sm text-red-600">{errors.familyRole}</p>
          )}
        </div>

        {/* Family Description */}
        <div>
          <label
            htmlFor="familyDescription"
            className="block text-sm font-medium"
          >
            Description (optional)
          </label>
          <textarea
            id="familyDescription"
            name="familyDescription"
            rows={3}
            value={form.familyDescription || ''}
            onChange={(e) =>
              handleField('familyDescription', e.target.value)
            }
            placeholder="Tell us about your family..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.familyDescription && (
            <p className="mt-1 text-sm text-red-600">
              {errors.familyDescription}
            </p>
          )}
        </div>

        {/* Family Members Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Family Members</h3>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setShowAdd(true)
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>

          {/* Add Member Form */}
          {showAdd && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md space-y-4">
              {/* Method */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Add Method
                </label>
                <Select
                  value={newMember.type}
                  onValueChange={(v) =>
                    setNewMember((m) => ({ ...m, type: v }))
                  }
                >
                  <SelectTrigger className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="invite">Invite via Email</SelectItem>
                    <SelectItem value="direct_add">Add Directly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMember.type === 'invite' ? (
                <div>
                  <label className="block text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember((m) => ({ ...m, email: e.target.value }))
                    }
                    className="mt-1 w-full"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">
                        First Name
                      </label>
                      <Input
                        value={newMember.firstName}
                        onChange={(e) =>
                          setNewMember((m) => ({
                            ...m,
                            firstName: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Last Name
                      </label>
                      <Input
                        value={newMember.lastName}
                        onChange={(e) =>
                          setNewMember((m) => ({
                            ...m,
                            lastName: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Email (optional)
                    </label>
                    <Input
                      type="email"
                      value={newMember.email || ''}
                      onChange={(e) =>
                        setNewMember((m) => ({ ...m, email: e.target.value }))
                      }
                      className="mt-1 w-full"
                      placeholder="Leave blank if not known"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Relationship
                </label>
                <Select
                  value={newMember.relationshipToMe}
                  onValueChange={(v) =>
                    setNewMember((m) => ({ ...m, relationshipToMe: v }))
                  }
                >
                  <SelectTrigger className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {relationshipTypes.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>
                        {rt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember} size="sm">
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Members List */}
          <ul className="divide-y divide-gray-200">
            {members.length === 0 && (
              <li className="py-3 text-gray-500 text-sm">
                No members added yet.
              </li>
            )}
            {members.map((m, i) => (
              <li
                key={i}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  {m.type === 'invite'
                    ? `Invite: ${m.email}`
                    : `${m.firstName} ${m.lastName}`}{' '}
                  <span className="text-sm text-gray-500">
                    (
                    {
                      relationshipTypes.find(
                        (rt) => rt.value === m.relationshipToMe
                      )?.label
                    }
                    )
                  </span>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    removeMember(i)
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </div>
  )
}
