import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BrandOnboarding from '@/components/onboarding/BrandOnboarding';
// import CreatorOnboarding from '@/components/onboarding/CreatorOnboarding'; // (Uncomment when you have it)

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

  // Default fallback (Creator form)
  // return <CreatorOnboarding />; // usage when available
  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold">Creator Onboarding</h1>
        <p className="text-muted-foreground text-lg">
          Creator onboarding is coming soon! For now, your account is set up.
        </p>
        <div className="bg-card/90 shadow-soft p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Welcome, {user?.name || user?.email}!</h2>
          <p className="text-muted-foreground">
            Your creator account has been created. We're working on the complete creator onboarding experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
