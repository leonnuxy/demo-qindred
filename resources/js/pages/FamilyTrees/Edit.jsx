import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft } from 'lucide-react';
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

export default function Edit({ familyTree }) {
  const { errors, flash = {} } = usePage().props;
  const { toast } = useToast();
  
  const { data, setData, patch, processing } = useForm({
    name: familyTree.name || '',
    description: familyTree.description || '',
    privacy: familyTree.privacy || 'private',
  });

  React.useEffect(() => {
    if (flash.success) {
      toast({ title: "Success", description: flash.success });
    } else if (flash.error) {
      toast({ title: "Error", description: flash.error, variant: "destructive" });
    }
  }, [flash]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    patch(route('family-trees.update', { family_tree: familyTree.id }), {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Family tree updated successfully!"
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
      title: familyTree.name || 'Details',
      href: `/family-trees/${familyTree.id}`,
    },
    {
      title: 'Edit',
      href: `/family-trees/${familyTree.id}/edit`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Family Tree – ${familyTree.name}`} />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="mb-6">
          <Link 
            href={route('family-trees.show', { family_tree: familyTree.id })} 
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Tree
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Edit Family Tree</h1>
        
        {flash.success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{flash.success}</p>
          </div>
        )}

        {flash.error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{flash.error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tree Details</CardTitle>
              <CardDescription>
                Update the basic information for your family tree.
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
            
            <CardFooter className="flex justify-end gap-3">
              <Link 
                href={route('family-trees.show', { family_tree: familyTree.id })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium shadow-sm"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
