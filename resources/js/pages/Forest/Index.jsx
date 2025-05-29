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
      
      <div className="forest-page-container">
        <div className="forest-page">
          <div className="forest-header">
            <h1 className="forest-header__title">Forest</h1>
            <p className="forest-header__description">
              Connect with your family members in the social forest
            </p>
          </div>
          
          <div className="forest-coming-soon">
            <h2 className="forest-coming-soon__title">Coming Soon</h2>
            <p className="forest-coming-soon__description">
              The Forest social feed is under development. 
              Soon you'll be able to share updates, photos, and memories with your family members.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
