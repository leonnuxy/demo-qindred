// resources/js/pages/FamilyTrees/Index.jsx

import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Eye, Edit, Trash } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function Index({ familyTrees }) {
  // Provide a default empty object for flash so flash?.success and flash?.error work
  const { auth, flash = {} } = usePage().props;
  const { toast } = useToast();

  React.useEffect(() => {
    if (flash.success) {
      toast({ title: 'Success', description: flash.success });
    } else if (flash.error) {
      toast({ title: 'Error', description: flash.error, variant: 'destructive' });
    }
  }, [flash, toast]);

  // Define breadcrumbs for the AppLayout
  const breadcrumbs = [
    {
      title: 'Family Trees',
      href: '/family-trees',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Family Trees" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Family Trees</h1>
          <Link href={route('family-trees.create')}>
            <Button className="flex items-center gap-1">
              <Plus size={20} /> New Family Tree
            </Button>
          </Link>
        </div>

        {/* inline flash block */}
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

        {familyTrees.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No Family Trees Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first family tree to get started.
            </p>
            <Link href={route('family-trees.create')}>
              <Button>
                <Plus size={20} className="mr-2" />
                Create Your First Family Tree
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyTrees.map(tree => (
              <Card key={tree.id}>
                <CardHeader>
                  <CardTitle>{tree.name}</CardTitle>
                  <CardDescription>
                    {tree.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Created: {tree.created_at}</p>
                    <p>Members: {tree.member_count || 0}</p>
                    <p>
                      Privacy:{' '}
                      <span className="ml-1 capitalize">
                        {tree.privacy || 'private'}
                      </span>
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Link href={route('family-trees.show', tree.id)}>
                      <Button variant="outline" size="sm">
                        <Eye size={18} className="mr-1" /> View
                      </Button>
                    </Link>
                    {tree.can_update && (
                      <Link href={route('family-trees.edit', tree.id)}>
                        <Button variant="outline" size="sm">
                          <Edit size={16} className="mr-1" /> Edit
                        </Button>
                      </Link>
                    )}
                  </div>

                  {tree.can_delete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash size={16} className="mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            the family tree "{tree.name}" and all of its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Link
                            href={route('family-trees.destroy', tree.id)}
                            method="delete"
                            as="button"
                          >
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </Link>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
