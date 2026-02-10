import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Paintbrush, ArrowLeft, Loader2 } from 'lucide-react';

export default function Auth() {
  const [selectedRole, setSelectedRole] = useState<'BRAND' | 'CREATOR' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // 🧠 MEMORY: Save their choice so we know who they are after the redirect
    if (selectedRole) {
      localStorage.setItem('intended_role', selectedRole);
    }
    // Redirect to Backend Google Auth
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  // 🎨 SCREEN 1: Role Selection
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome to Creator Connect</h1>
          <p className="text-xl text-gray-600 mb-8">How do you want to use the platform?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={() => setSelectedRole('BRAND')} className="bg-white p-8 rounded-xl shadow-md cursor-pointer hover:border-indigo-600 border-2 border-transparent transition-all">
              <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-lg mx-auto flex items-center justify-center mb-4"><Briefcase size={32} /></div>
              <h3 className="text-2xl font-bold">I'm a Brand</h3>
              <p className="text-gray-500 mt-2">Hire creators & run campaigns.</p>
            </div>

            <div onClick={() => setSelectedRole('CREATOR')} className="bg-white p-8 rounded-xl shadow-md cursor-pointer hover:border-green-500 border-2 border-transparent transition-all">
              <div className="h-14 w-14 bg-green-100 text-green-600 rounded-lg mx-auto flex items-center justify-center mb-4"><Paintbrush size={32} /></div>
              <h3 className="text-2xl font-bold">I'm a Creator</h3>
              <p className="text-gray-500 mt-2">Find sponsorships & get paid.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 SCREEN 2: Login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <Button variant="ghost" onClick={() => setSelectedRole(null)} className="w-fit mb-2 text-gray-500"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <CardTitle className="text-2xl text-center">Login as {selectedRole === 'BRAND' ? 'Brand' : 'Creator'}</CardTitle>
          <CardDescription className="text-center">Connect with Google to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full py-6 text-lg" onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "🔵"}
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}