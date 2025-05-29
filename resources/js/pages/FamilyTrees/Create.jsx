import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
      
      <div className="family-tree-create-page family-tree">
        <h1 className="family-tree-create-header">Create New Family Tree</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="family-tree-form-section">
            <CardHeader className="family-tree-form-section__header">
              <CardTitle className="family-tree-form-section__title">Tree Details</CardTitle>
              <CardDescription className="family-tree-form-section__description">
                Enter the basic information for your family tree.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="family-tree-form-section__content">
              <div className="family-tree-form-field">
                <Label htmlFor="name" className="family-tree-form-label">Tree Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="family-tree-form-input"
                  placeholder="e.g., Smith Family Tree"
                />
                {errors.name && (
                  <p className="family-tree-form-error">{errors.name}</p>
                )}
              </div>
              
              <div className="family-tree-form-field">
                <Label htmlFor="description" className="family-tree-form-label">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  className="family-tree-form-textarea"
                  placeholder="Add a brief description of your family tree..."
                  rows={3}
                />
                {errors.description && (
                  <p className="family-tree-form-error">{errors.description}</p>
                )}
              </div>
              
              <div className="family-tree-form-field">
                <Label htmlFor="privacy" className="family-tree-form-label">Privacy Setting</Label>
                <Select
                  value={data.privacy}
                  onValueChange={value => setData('privacy', value)}
                >
                  <SelectTrigger className="family-tree-form-select">
                    <SelectValue placeholder="Select privacy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only invited members)</SelectItem>
                    <SelectItem value="public">Public (Anyone can view)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.privacy && (
                  <p className="family-tree-form-error">{errors.privacy}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="family-tree-form-section">
            <CardHeader className="family-tree-form-section__header">
              <CardTitle className="family-tree-form-section__title">First Family Member</CardTitle>
              <CardDescription className="family-tree-form-section__description">
                Add yourself or another person as the first member of this tree.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="family-tree-form-section__content">
              <div className="family-tree-form-grid family-tree-form-grid--two-cols">
                <div className="family-tree-form-field">
                  <Label htmlFor="firstName" className="family-tree-form-label">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={data.firstName}
                    onChange={e => setData('firstName', e.target.value)}
                    className="family-tree-form-input"
                  />
                  {errors.firstName && (
                    <p className="family-tree-form-error">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="family-tree-form-field">
                  <Label htmlFor="lastName" className="family-tree-form-label">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={data.lastName}
                    onChange={e => setData('lastName', e.target.value)}
                    className="family-tree-form-input"
                  />
                  {errors.lastName && (
                    <p className="family-tree-form-error">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="family-tree-form-grid family-tree-form-grid--two-cols">
                <div className="family-tree-form-field">
                  <Label htmlFor="dateOfBirth" className="family-tree-form-label">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={e => setData('dateOfBirth', e.target.value)}
                    className="family-tree-form-input"
                  />
                  {errors.dateOfBirth && (
                    <p className="family-tree-form-error">{errors.dateOfBirth}</p>
                  )}
                </div>
                
                <div className="family-tree-form-field">
                  <Label htmlFor="gender" className="family-tree-form-label">Gender</Label>
                  <Select
                    value={data.gender}
                    onValueChange={value => setData('gender', value)}
                  >
                    <SelectTrigger className="family-tree-form-select">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="family-tree-form-error">{errors.gender}</p>
                  )}
                </div>
              </div>
              
              <div className="family-tree-form-field">
                <Label htmlFor="email" className="family-tree-form-label">Email (Optional)</Label>
                <p className="family-tree-form-helper">
                  If provided, this person will be invited to join the family tree.
                </p>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  className="family-tree-form-input"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="family-tree-form-error">{errors.email}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="family-tree-form-actions">
            <Link href={route('family-trees.index')}>
              <Button
                type="button"
                variant="outline"
                disabled={processing}
                className="family-tree-form-actions__back"
              >
                Back to Family Trees
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={processing}
              className="family-tree-form-actions__submit"
            >
              {processing ? 'Creating...' : 'Create Family Tree'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
