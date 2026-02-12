import { useState } from 'react';
import { Briefcase, Paintbrush, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Auth() {
  const [loadingRole, setLoadingRole] = useState<'BRAND' | 'CREATOR' | null>(null);

  const handleRoleSelect = (role: 'BRAND' | 'CREATOR') => {
    if (loadingRole) return; // Prevent double clicks

    setLoadingRole(role);

    // 🧠 MEMORY: Save their choice so we know who they are after the redirect
    localStorage.setItem('intended_role', role);

    // Simulate a brief delay for UX (so they see the spinner), then redirect
    setTimeout(() => {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome to Creator Connect</h1>
        <p className="text-xl text-gray-600 mb-8">How do you want to use the platform?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BRAND CARD */}
          <div
            onClick={() => handleRoleSelect('BRAND')}
            className={cn(
              "bg-white p-8 rounded-xl shadow-md cursor-pointer border-2 border-transparent transition-all duration-300 relative overflow-hidden group",
              "hover:shadow-xl hover:-translate-y-1",
              loadingRole === 'BRAND' ? "border-indigo-600 ring-2 ring-indigo-100" : "hover:border-indigo-600",
              loadingRole && loadingRole !== 'BRAND' && "opacity-50 pointer-events-none grayscale"
            )}
          >
            {loadingRole === 'BRAND' && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
              </div>
            )}
            <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-lg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Briefcase size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">I'm a Brand</h3>
            <p className="text-gray-500 mt-2">Hire creators & run campaigns.</p>
          </div>

          {/* CREATOR CARD */}
          <div
            onClick={() => handleRoleSelect('CREATOR')}
            className={cn(
              "bg-white p-8 rounded-xl shadow-md cursor-pointer border-2 border-transparent transition-all duration-300 relative overflow-hidden group",
              "hover:shadow-xl hover:-translate-y-1",
              loadingRole === 'CREATOR' ? "border-green-500 ring-2 ring-green-100" : "hover:border-green-500",
              loadingRole && loadingRole !== 'CREATOR' && "opacity-50 pointer-events-none grayscale"
            )}
          >
            {loadingRole === 'CREATOR' && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
                <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
              </div>
            )}
            <div className="h-14 w-14 bg-green-100 text-green-600 rounded-lg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Paintbrush size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">I'm a Creator</h3>
            <p className="text-gray-500 mt-2">Find sponsorships & get paid.</p>
          </div>
        </div>

        <p className="mt-12 text-sm text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}