import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, Link } from '@inertiajs/react';
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
  const { flash, dashboardData } = usePage().props;
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

  // Fallback data in case dashboardData is not available
  const data = dashboardData || {
    user: { first_name: 'User', profile_completion: 0 },
    statistics: { 
      family_trees_count: 0, 
      total_family_members: 0, 
      connections_made: 0, 
      pending_invitations: 0 
    },
    recent_activity: []
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="dashboard-page-container">
        
        {/* Welcome Header */}
        <div className="dashboard-welcome-header">
          <div className="dashboard-welcome-content">
            <div className="dashboard-welcome-text">
              <h1 className="dashboard-welcome-title">
                {getGreeting()}, {data.user.first_name}!
              </h1>
              <p className="dashboard-welcome-subtitle">
                Welcome to your family tree dashboard
              </p>
            </div>
            <div className="dashboard-welcome-avatar">
              <img 
                src={data.user.avatar_url || '/assets/avatar-placeholder.png'} 
                alt={data.user.first_name}
                className="dashboard-avatar-image"
              />
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="dashboard-grid">
          
          {/* Family Overview Card */}
          <div className="dashboard-stat-card dashboard-stat-card--family">
            <div className="dashboard-stat-card__header">
              <h3 className="dashboard-stat-card__title">Family Overview</h3>
              <div className="dashboard-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
            </div>
            <div className="dashboard-stat-card__content">
              <div className="dashboard-stat-card__primary">
                <span className="dashboard-stat-card__number">
                  {data.statistics.total_family_members}
                </span>
                <span className="dashboard-stat-card__label">Family Members</span>
              </div>
              <div className="dashboard-stat-card__secondary">
                <span className="dashboard-stat-card__small-number">
                  {data.statistics.family_trees_count}
                </span>
                <span className="dashboard-stat-card__small-label">Family Trees</span>
              </div>
            </div>
          </div>

          {/* Connections Card */}
          <div className="dashboard-stat-card dashboard-stat-card--connections">
            <div className="dashboard-stat-card__header">
              <h3 className="dashboard-stat-card__title">Connections</h3>
              <div className="dashboard-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="M12 11h4"/>
                  <path d="M12 16h4"/>
                  <path d="M8 11h.01"/>
                  <path d="M8 16h.01"/>
                </svg>
              </div>
            </div>
            <div className="dashboard-stat-card__content">
              <div className="dashboard-stat-card__primary">
                <span className="dashboard-stat-card__number">
                  {data.statistics.connections_made}
                </span>
                <span className="dashboard-stat-card__label">Relationships</span>
              </div>
              <div className="dashboard-stat-card__secondary">
                <span className="dashboard-stat-card__small-number">
                  {data.statistics.pending_invitations}
                </span>
                <span className="dashboard-stat-card__small-label">Pending Invites</span>
              </div>
            </div>
          </div>

          {/* Profile Status Card */}
          <div className="dashboard-stat-card dashboard-stat-card--profile">
            <div className="dashboard-stat-card__header">
              <h3 className="dashboard-stat-card__title">Profile Status</h3>
              <div className="dashboard-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
            <div className="dashboard-stat-card__content">
              <div className="dashboard-stat-card__primary">
                <span className="dashboard-stat-card__number">
                  {data.user.profile_completion}%
                </span>
                <span className="dashboard-stat-card__label">Complete</span>
              </div>
              <div className="dashboard-stat-card__progress">
                <div className="dashboard-progress-bar">
                  <div 
                    className="dashboard-progress-fill"
                    style={{ width: `${data.user.profile_completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main-content">
          <div className="dashboard-main-content__header">
            <h2 className="dashboard-main-content__title">Recent Activity</h2>
            <div className="dashboard-main-content__actions">
              <Link 
                href="/family-trees/create" 
                className="dashboard-action-button dashboard-action-button--primary"
              >
                Create Family Tree
              </Link>
            </div>
          </div>
          
          <div className="dashboard-main-content__body">
            {data.recent_activity && data.recent_activity.length > 0 ? (
              <div className="dashboard-activity-list">
                {data.recent_activity.map((activity, index) => (
                  <div key={index} className="dashboard-activity-item">
                    <div className="dashboard-activity-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6"/>
                        <path d="m21 12-6 0m-6 0-6 0"/>
                      </svg>
                    </div>
                    <div className="dashboard-activity-content">
                      <p className="dashboard-activity-description">
                        {activity.description || 'Family tree activity'}
                      </p>
                      <span className="dashboard-activity-time">
                        {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-state__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <h3 className="dashboard-empty-state__title">No Recent Activity</h3>
                <p className="dashboard-empty-state__description">
                  Start building your family tree to see activity here
                </p>
                <Link 
                  href="/family-trees/create" 
                  className="dashboard-action-button dashboard-action-button--primary"
                >
                  Create Your First Family Tree
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
