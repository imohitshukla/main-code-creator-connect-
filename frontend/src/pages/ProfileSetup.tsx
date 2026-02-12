import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BrandOnboarding from '@/components/onboarding/BrandOnboarding';
import CreatorOnboarding from '@/components/onboarding/CreatorOnboarding';

const ProfileSetup = () => {
  const { user, updateUserRole, isLoading } = useAuth();

  // ⚡️ AUTO-ASSIGN ROLE FROM MEMORY
  useEffect(() => {
    const intendedRole = localStorage.getItem('intended_role');

    // Only run if user is logged in BUT has no role yet
    if (user && (!user.role || user.role === 'PENDING') && intendedRole) {
      console.log("Applying saved role:", intendedRole);
      updateUserRole(intendedRole as 'BRAND' | 'CREATOR')
        .then(() => localStorage.removeItem('intended_role')); // Clear memory
    }
  }, [user]);

  if (isLoading) return <div className="p-10 text-center">Loading Profile...</div>;

  // 🚦 ROUTING
  if (user?.role === 'BRAND') {
    return <BrandOnboarding />;
  }

  // Creator form
  return <CreatorOnboarding />;
};

export default ProfileSetup;
