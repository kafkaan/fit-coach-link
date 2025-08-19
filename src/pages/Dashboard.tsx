import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import CoachDashboard from '@/components/coach/CoachDashboard';
import AthleteDashboard from '@/components/athlete/AthleteDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {profile.role === 'coach' ? (
        <CoachDashboard />
      ) : (
        <AthleteDashboard />
      )}
    </div>
  );
};

export default Dashboard;