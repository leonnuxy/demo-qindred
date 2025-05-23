import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Create() {
  const { toast } = useToast();
  const { errors } = usePage().props;
  
  const { data, setData, post, processing } = useForm({
    name: '',
    description: '',
    privacy: 'private',
    // First member data (root person)
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    post(route('family-trees.store'), {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Family tree created successfully!"
        });
      },
      onError: (errors) => {
        toast({
          title: "Error",
          description: "Please check the form for errors.",
          variant: "destructive"
        });
      }
    });
  };

  // Define breadcrumbs for the AppLayout
  const breadcrumbs = [
    {
      title: 'Family Trees',
      href: '/family-trees',
    },
    {
      title: 'Create New',
      href: '/family-trees/create',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create New Family Tree" />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 family-tree">
        <h1 className="text-3xl font-bold mb-6 text-qindred-green-900 dark:text-qindred-green-500">Create New Family Tree</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8 border-qindred-green-100 dark:border-qindred-green-800/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-qindred-green-800 dark:text-qindred-green-500">Tree Details</CardTitle>
              <CardDescription className="text-qindred-green-700/70 dark:text-qindred-green-600/70">
                Enter the basic information for your family tree.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tree Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Smith Family Tree"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  className="mt-1"
                  placeholder="Add a brief description of your family tree..."
                  rows={3}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="privacy">Privacy Setting</Label>
                <Select
                  value={data.privacy}
                  onValueChange={value => setData('privacy', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select privacy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only invited members)</SelectItem>
                    <SelectItem value="public">Public (Anyone can view)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.privacy && (
                  <p className="mt-1 text-sm text-red-600">{errors.privacy}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>First Family Member</CardTitle>
              <CardDescription>
                Add yourself or another person as the first member of this tree.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={data.firstName}
                    onChange={e => setData('firstName', e.target.value)}
                    className="mt-1"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={data.lastName}
                    onChange={e => setData('lastName', e.target.value)}
                    className="mt-1"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={e => setData('dateOfBirth', e.target.value)}
                    className="mt-1"
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={data.gender}
                    onValueChange={value => setData('gender', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <p className="text-xs text-gray-500">
                  If provided, this person will be invited to join the family tree.
                </p>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  className="mt-1"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={processing}
              className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/30"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={processing}
              className="bg-qindred-green-600 hover:bg-qindred-green-700 text-white"
            >
              {processing ? 'Creating...' : 'Create Family Tree'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
