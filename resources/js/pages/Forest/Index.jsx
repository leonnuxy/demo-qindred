import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import '@css/pages/forest.css';

const breadcrumbs = [
  {
    title: 'Forest',
    href: '/forest',
  },
];

export default function ForestPage() {
  const { auth } = usePage().props;
  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Forest" />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 bg-gradient-to-b from-white to-qindred-green-50/30 dark:from-slate-900 dark:to-qindred-green-950/10">
        <div className="forest-page">
          <div className="forest-header">
            <h1 className="text-2xl font-semibold text-qindred-green-900 dark:text-qindred-green-400 mb-2">Forest</h1>
            <p className="text-qindred-green-700/70 dark:text-qindred-green-500/70">
              Connect with your family members in the social forest
            </p>
          </div>
          
          <div className="coming-soon">
            <h2>Coming Soon</h2>
            <p>
              The Forest social feed is under development. 
              Soon you'll be able to share updates, photos, and memories with your family members.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
