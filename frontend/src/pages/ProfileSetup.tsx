import { useAuth } from '@/contexts/AuthContext';
import BrandOnboarding from '@/components/onboarding/BrandOnboarding';
import RoleSelection from '@/components/onboarding/RoleSelection';

const ProfileSetup = () => {
  const { user, isLoading } = useAuth();

  // 🛑 STOP! Don't do anything until we know who the user is.
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // 1. The Fork: If they have no role, show the selection screen.
  if (!user?.role || user.role === 'PENDING') {
    const handleRoleSelect = async (selectedRole: 'brand' | 'creator') => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.creatorconnect.tech'}/api/users/role`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json' 
          },
          credentials: 'include',
          body: JSON.stringify({ role: selectedRole.toUpperCase() }),
        });

        if (response.ok) {
          window.location.reload(); // Reload to get updated user data
        }
      } catch (error) {
        console.error('Failed to set role', error);
      }
    };
    
    return <RoleSelection onSelect={handleRoleSelect} />;
  }

  // 2. The Brand Path
  if (user.role === 'BRAND') {
    return <BrandOnboarding />;
  }

  // 3. The Creator Path (Default) - Show simple creator onboarding for now
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

