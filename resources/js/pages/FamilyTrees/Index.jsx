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

      <div className="family-trees-page family-tree">
        {/* Add blur overlay */}
        {/* <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 z-50 flex items-center justify-center">
          <div className="text-4xl font-bold text-qindred-green-900 dark:text-qindred-green-500">
            Coming Soon
          </div>
        </div> */}

        <div className="family-trees-header">
          <h1 className="family-trees-header__title">My Family Trees</h1>
          <Link href={route('family-trees.create')}>
            <Button className="family-trees-header__new-button">
              <Plus size={20} /> New Family Tree
            </Button>
          </Link>
        </div>

        {/* Flash alert messages */}
        {flash.success && (
          <div role="alert" className="flash-alert flash-alert--success">
            <p className="flash-alert__text">{flash.success}</p>
          </div>
        )}
        {flash.error && (
          <div role="alert" className="flash-alert flash-alert--error">
            <p className="flash-alert__text">{flash.error}</p>
          </div>
        )}

        {familyTrees.length === 0 ? (
          <div className="family-trees-empty">
            <h3 className="family-trees-empty__title">No Family Trees Found</h3>
            <p className="family-trees-empty__description">
              Create your first family tree to get started.
            </p>
            <Link href={route('family-trees.create')}>
              <Button className="family-trees-empty__button">
                <Plus size={20} className="mr-2" />
                Create Your First Family Tree
              </Button>
            </Link>
          </div>
        ) : (
          <div className="family-trees-grid">
            {familyTrees.map(tree => (
              <Card key={tree.id} className="family-tree-card">
                <CardHeader className="family-tree-card__header">
                  <CardTitle className="family-tree-card__title">{tree.name}</CardTitle>
                  <CardDescription className="family-tree-card__description">
                    {tree.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="family-tree-card__info">
                    <p>Created: {tree.created_at}</p>
                    <p>Members: {tree.member_count || 0}</p>
                    <p>
                      Privacy:{' '}
                      <span className="family-tree-card__privacy">
                        {tree.privacy || 'private'}
                      </span>
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="family-tree-card__footer">
                  <div className="family-tree-card__actions">
                    <Link href={route('family-trees.show', { family_tree: tree.id })}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="family-tree-card__action-button"
                      >
                        <Eye size={18} className="mr-1" /> View
                      </Button>
                    </Link>
                    {tree.can_update && (
                      <Link href={route('family-trees.edit', { family_tree: tree.id })}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="family-tree-card__action-button"
                        >
                          <Edit size={16} className="mr-1" /> Edit
                        </Button>
                      </Link>
                    )}
                  </div>

                  {tree.can_delete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="family-tree-card__delete-button">
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
                            href={route('family-trees.destroy', { family_tree: tree.id })}
                            method="delete"
                            as="button"
                          >
                            <AlertDialogAction className="family-tree-card__delete-button">
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
