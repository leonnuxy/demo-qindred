import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button'; 
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const initialNewMemberState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  dateOfDeath: '',
  isDeceased: false,
  gender: '',
  relationshipToUser: '',
  email: '',
  addMode: 'direct'
};

export default function ManageFamilyMembersModal({ 
  isOpen, 
  onClose,
  familyMembers = [],
  relationshipTypes,
  onAddMember,
  onUpdateMember,
  onDeleteMember
}) {
  const [activeTab, setActiveTab] = useState("existing");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState(initialNewMemberState);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("existing");
      setEditingMember(null);
      setNewMember(initialNewMemberState);
    }
  }, [isOpen]);

  const handleInputChange = (e, setterFunction) => {
    const { name, value, type, checked } = e.target;
    setterFunction(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSelectChange = (name, value, setterFunction) => {
    setterFunction(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const startEditMember = (member) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try { return new Date(dateStr).toISOString().split('T')[0]; } 
        catch (e) { return ''; }
    };
    setEditingMember({
      ...member,
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      dateOfBirth: formatDate(member.dateOfBirth),
      isDeceased: Boolean(member.dateOfDeath || member.isDeceased),
      dateOfDeath: formatDate(member.dateOfDeath),
      gender: member.gender || '',
      relationshipToUser: member.relationshipToUser || '',
      email: member.email || '',
      addMode: 'direct', // When editing, it's always direct details, not invite mode
    });
    setActiveTab("edit");
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setActiveTab("existing");
  };
  
  const handleSaveEdit = async () => {
    if (!editingMember) return;
    if (!editingMember.firstName || !editingMember.lastName || !editingMember.relationshipToUser) {
        toast({ title: "Validation Error", description: "First name, last name, and relationship are required.", variant: "destructive" });
        return;
    }
    try {
      setIsLoading(true);
      await onUpdateMember(editingMember);
      toast({ 
        title: "Success", 
        description: `Successfully updated ${editingMember.firstName} ${editingMember.lastName}.` 
      });
      setEditingMember(null);
      setActiveTab("existing");
    } catch (error) {
      console.error("Update member error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update member. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startDeleteMember = (member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      setIsLoading(true);
      await onDeleteMember(memberToDelete.id);
      toast({ 
        title: "Success", 
        description: `Successfully removed ${memberToDelete.firstName} ${memberToDelete.lastName}.` 
      });
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      setActiveTab("existing");
    } catch (error) {
      console.error("Delete member error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete member. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewMember = async () => {
    if (newMember.addMode === 'direct') {
      if (!newMember.firstName || !newMember.lastName || !newMember.relationshipToUser) {
        toast({ title: "Validation Error", description: "First name, last name, and relationship are required for direct add.", variant: "destructive" });
        return;
      }
    } else { 
      if (!newMember.email || !newMember.relationshipToUser) {
        toast({ title: "Validation Error", description: "Email and relationship are required for invite.", variant: "destructive" });
        return;
      }
    }
    
    try {
      setIsLoading(true);
      await onAddMember(newMember);
      toast({ 
        title: "Success", 
        description: newMember.addMode === 'invite' 
          ? `Invitation sent to ${newMember.email}.` 
          : `Successfully added ${newMember.firstName} ${newMember.lastName}.` 
      });
      setNewMember(initialNewMemberState);
      setActiveTab("existing");
    } catch (error) {
      console.error("Add member error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to add member. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableRelationshipTypes = Array.isArray(relationshipTypes) && relationshipTypes.length > 0 
    ? relationshipTypes 
    : [ 
        { value: 'father', label: 'Father' }, { value: 'mother', label: 'Mother' },
        { value: 'spouse', label: 'Spouse' }, { value: 'child', label: 'Child' },
        { value: 'sibling', label: 'Sibling' }, { value: 'other', label: 'Other' },
      ];

  const renderMemberFormFields = (memberData, setMemberDataFunction, formPrefix = "") => (
    <>
      {/* Show email field only when adding a new member in 'invite' mode */}
      {formPrefix === "new-" && memberData.addMode === 'invite' && (
        <div>
          <Label htmlFor={`${formPrefix}email`} className="form-label">Member's Email *</Label>
          <Input
            type="email" id={`${formPrefix}email`} name="email"
            value={memberData.email} 
            onChange={(e) => handleInputChange(e, setMemberDataFunction)}
            placeholder="Enter email address to invite" 
            className="mt-1"
          />
        </div>
      )}

      {/* Show these fields for 'direct' add mode OR when editing an existing member (editingMember is not null) */}
      {(memberData.addMode === 'direct' || formPrefix === "edit-") && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${formPrefix}firstName`} className="form-label">First Name *</Label>
              <Input 
                type="text" id={`${formPrefix}firstName`} name="firstName" 
                value={memberData.firstName} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor={`${formPrefix}lastName`} className="form-label">Last Name *</Label>
              <Input 
                type="text" id={`${formPrefix}lastName`} name="lastName" 
                value={memberData.lastName} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="mt-1" 
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`${formPrefix}dateOfBirth`} className="form-label">Date of Birth</Label>
            <Input 
              type="date" id={`${formPrefix}dateOfBirth`} name="dateOfBirth" 
              value={memberData.dateOfBirth} 
              onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
              className="mt-1" 
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id={`${formPrefix}isDeceased`} name="isDeceased" 
              checked={memberData.isDeceased} 
              onCheckedChange={(checked) => handleSelectChange('isDeceased', Boolean(checked), setMemberDataFunction)} 
            />
            <Label htmlFor={`${formPrefix}isDeceased`} className="mb-0 cursor-pointer form-label">Deceased</Label>
          </div>
          {memberData.isDeceased && (
            <div>
              <Label htmlFor={`${formPrefix}dateOfDeath`} className="form-label">Date of Death</Label>
              <Input 
                type="date" id={`${formPrefix}dateOfDeath`} name="dateOfDeath" 
                value={memberData.dateOfDeath} 
                onChange={(e) => handleInputChange(e, setMemberDataFunction)} 
                className="mt-1" 
              />
            </div>
          )}
          <div>
            <Label htmlFor={`${formPrefix}gender`} className="form-label">Gender</Label>
            <Select 
              name="gender" value={memberData.gender} 
              onValueChange={(value) => handleSelectChange('gender', value, setMemberDataFunction)}
            >
              <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Display email for existing members being edited, but make it read-only if it's not meant to be changed here */}
          {formPrefix === "edit-" && memberData.email && (
             <div>
                <Label htmlFor={`${formPrefix}email-display`} className="form-label">Email (if applicable)</Label>
                <Input
                    type="email" id={`${formPrefix}email-display`} name="email"
                    value={memberData.email}
                    readOnly
                    className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
             </div>
          )}
        </>
      )}
      <div>
        <Label htmlFor={`${formPrefix}relationshipToUser`} className="form-label">
          Their Relationship to You * <span className="text-xs text-gray-500 ml-1">(e.g., if adding your child, select "Child")</span>
        </Label>
        <Select 
          name="relationshipToUser" value={memberData.relationshipToUser} 
          onValueChange={(value) => handleSelectChange('relationshipToUser', value, setMemberDataFunction)}
        >
          <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="Select relationship" /></SelectTrigger>
          <SelectContent>
            {availableRelationshipTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* Increased max-width for more space */}
        <DialogContent className="max-w-4xl w-[90vw] md:w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8" onInteractOutside={(e) => e.preventDefault()}>
          <DialogTitle className="text-2xl font-semibold text-qindred-green-900 dark:text-qindred-green-400">Manage Family Members</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mb-6">
            View, edit, or add members to your family tree.
          </DialogDescription>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full mb-6 ${editingMember ? 'grid-cols-3' : 'grid-cols-2'} gap-1`}>
              <TabsTrigger value="existing" className="data-[state=active]:bg-qindred-green-50 data-[state=active]:text-qindred-green-900 dark:data-[state=active]:bg-qindred-green-900/30 dark:data-[state=active]:text-qindred-green-400">
                Existing Members
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-qindred-green-50 data-[state=active]:text-qindred-green-900 dark:data-[state=active]:bg-qindred-green-900/30 dark:data-[state=active]:text-qindred-green-400">
                Add New Member
              </TabsTrigger>
              {/* Conditional rendering for Edit tab trigger */}
              {editingMember && (
                <TabsTrigger value="edit" className="data-[state=active]:bg-qindred-green-50 data-[state=active]:text-qindred-green-900 dark:data-[state=active]:bg-qindred-green-900/30 dark:data-[state=active]:text-qindred-green-400">
                  Edit: {editingMember.firstName}
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="existing" className="mt-0 outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {familyMembers.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No family members found in this tree.</p>
                  <Button onClick={() => setActiveTab("add")} className="mt-4 bg-qindred-green-600 hover:bg-qindred-green-700 text-white">
                    Add First Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(70vh-200px)] overflow-y-auto pr-2">
                  {familyMembers.map(member => (
                    <div key={member.id} className="border border-qindred-green-200 dark:border-qindred-green-800/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:shadow-md hover:border-qindred-green-400 dark:hover:border-qindred-green-600/50 transition-all">
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg text-qindred-green-900 dark:text-qindred-green-400">{member.firstName} {member.lastName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Relationship to you: {availableRelationshipTypes.find(rt => rt.value === member.relationshipToUser)?.label || member.relationshipToUser || 'N/A'}
                        </p>
                        {member.dateOfBirth && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Born: {new Date(member.dateOfBirth).toLocaleDateString()}
                            {member.dateOfDeath && ` • Died: ${new Date(member.dateOfDeath).toLocaleDateString()}`}
                            {member.isDeceased && !member.dateOfDeath && " (Deceased)"}
                          </p>
                        )}
                         {member.email && <p className="text-xs text-gray-500 dark:text-gray-500">Email: {member.email}</p>}
                      </div>
                      <div className="flex space-x-2 flex-shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                        <Button variant="outline" size="sm" onClick={() => startEditMember(member)} 
                                className="border-qindred-green-500 hover:bg-qindred-green-50 dark:hover:bg-qindred-green-900/20 text-qindred-green-700 dark:text-qindred-green-500">Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => startDeleteMember(member)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add" className="mt-0 outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <div className="space-y-6">
                <div className="flex space-x-2 mb-6">
                  <Button 
                    type="button" 
                    variant={newMember.addMode === 'direct' ? 'default' : 'outline'} 
                    onClick={() => handleSelectChange('addMode', 'direct', setNewMember)}
                    className={`flex-1 ${newMember.addMode === 'direct' ? 'bg-qindred-green-600 hover:bg-qindred-green-700 text-white' : 'border-qindred-green-500 text-qindred-green-700 hover:bg-qindred-green-50 dark:hover:bg-qindred-green-900/20 dark:text-qindred-green-500'}`}
                  > Add Directly </Button>
                  <Button 
                    type="button" 
                    variant={newMember.addMode === 'invite' ? 'default' : 'outline'} 
                    onClick={() => handleSelectChange('addMode', 'invite', setNewMember)}
                    className={`flex-1 ${newMember.addMode === 'invite' ? 'bg-qindred-green-600 hover:bg-qindred-green-700 text-white' : 'border-qindred-green-500 text-qindred-green-700 hover:bg-qindred-green-50 dark:hover:bg-qindred-green-900/20 dark:text-qindred-green-500'}`}
                  > Invite by Email </Button>
                </div>
                {renderMemberFormFields(newMember, setNewMember, "new-")}
                <div className="flex justify-end pt-6 space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => { setNewMember(initialNewMemberState); setActiveTab("existing"); }}
                    className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/30"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddNewMember} 
                    disabled={isLoading}
                    className="bg-qindred-green-600 hover:bg-qindred-green-700 text-white"
                  >
                    {isLoading ? (newMember.addMode === 'invite' ? "Sending..." : "Adding...") : (newMember.addMode === 'invite' ? "Send Invite" : "Add Member")}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {editingMember && (
              <TabsContent value="edit" className="mt-0 outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    Editing: {editingMember.firstName} {editingMember.lastName}
                  </h4>
                  {renderMemberFormFields(editingMember, setEditingMember, "edit-")}
                  <div className="flex justify-end pt-6 space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={cancelEdit}
                      className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/30"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSaveEdit} 
                      disabled={isLoading}
                      className="bg-qindred-green-600 hover:bg-qindred-green-700 text-white"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onInteractOutside={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToDelete && `This will permanently delete ${memberToDelete.firstName} ${memberToDelete.lastName} from your family tree. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMember} disabled={isLoading} className={buttonVariants({ variant: "destructive" })}>
              {isLoading ? "Deleting..." : "Yes, Delete Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
