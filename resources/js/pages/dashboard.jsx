import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import '@css/pages/dashboard.css';

const breadcrumbs = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

export default function Dashboard() {
  const { flash } = usePage().props;
  const { toast } = useToast();
  
  // Handle flash messages from the backend
  useEffect(() => {
    if (flash?.success) {
      toast({
        title: "Success", 
        description: flash.success,
        variant: "default"
      });
    } else if (flash?.error) {
      toast({
        title: "Error",
        description: flash.error,
        variant: "destructive"
      });
    }
  }, [flash, toast]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="dashboard-page-container">
        {/* Test Information Card */}
        <div className="dashboard-test-card">
          <h2 className="dashboard-test-card__header">Test Information</h2>
          <div className="dashboard-test-card__content">
            <div className="dashboard-test-card__row">
              <span className="dashboard-test-card__label">Environment:</span>
              <span className="dashboard-test-card__value">Development</span>
            </div>
            <div className="dashboard-test-card__row">
              <span className="dashboard-test-card__label">Last Updated:</span>
              <span className="dashboard-test-card__value">{new Date().toLocaleString()}</span>
            </div>
            <div className="dashboard-test-card__row">
              <span className="dashboard-test-card__label">Status:</span>
              <span className="dashboard-test-card__value dashboard-test-card__value--status">Online</span>
            </div>
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-placeholder-card">
            <PlaceholderPattern className="dashboard-placeholder-card__pattern" />
          </div>
          <div className="dashboard-placeholder-card">
            <PlaceholderPattern className="dashboard-placeholder-card__pattern" />
          </div>
          <div className="dashboard-placeholder-card">
            <PlaceholderPattern className="dashboard-placeholder-card__pattern" />
          </div>
        </div>
        <div className="dashboard-main-content">
          <PlaceholderPattern className="dashboard-main-content__pattern" />
        </div>
      </div>
    </AppLayout>
  );
}
