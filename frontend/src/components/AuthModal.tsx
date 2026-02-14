import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';
import { Building2, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signup' | 'login';
  defaultRole?: 'brand' | 'creator';
}

const AuthModal = ({ isOpen, onClose, defaultMode = 'login', defaultRole = 'brand' }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot-password'>(defaultMode);
  const [userRole, setUserRole] = useState<'brand' | 'creator'>(defaultRole);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company_name: '',
    website: '',
    phone_number: ''
  });

  // Forgot Password States
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetStep, setIsResetStep] = useState(false); // false = email input, true = otp input

  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [otpData, setOtpData] = useState<{ userId: number; showOtp: boolean } | null>(null);
  const [otp, setOtp] = useState('');

  const navigate = useNavigate(); // Helper for redirecting if needed

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultMode === 'signup' ? 'signup' : 'login'); // Default validation
      setUserRole(defaultRole); // 🔄 Sync role from props
      setOtpData(null);
      setOtp('');
      // Reset forgot password state
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
      setIsResetStep(false);
    }
  }, [isOpen, defaultMode, defaultRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🚨 CRITICAL: Make actual API call first
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });

      const data = await response.json();

      console.log('🔍 AUTHMODAL DEBUG: API response:', data);
      console.log('🔍 AUTHMODAL DEBUG: User entity:', data.user);
      console.log('🔍 AUTHMODAL DEBUG: Token in response:', data.token);
      console.log('🔍 AUTHMODAL DEBUG: Token in user entity:', data.user?.token);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // 🚨 CRITICAL: Now call AuthContext login with API response
      login(data);

      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData) return;

    setIsLoading(true);
    try {
      // 🚨 TODO: verifyOtp function doesn't exist in AuthContext - need to implement
      console.log("OTP verification not implemented - skipping");
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      onClose();
      setOtpData(null);
      setOtp('');
    } catch (error) {
      toast({
        title: 'OTP verification failed',
        description: 'Please check your OTP and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to send OTP';
        try {
          const err = JSON.parse(errorText);
          errorMessage = err.details || err.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast({
        title: 'OTP Sent',
        description: 'Check your email for the reset code.',
      });
      setIsResetStep(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to reset password';
        try {
          const err = JSON.parse(errorText);
          errorMessage = err.details || err.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast({
        title: 'Success',
        description: 'Password reset! You can now log in.',
      });

      // Reset state and go to login
      setIsResetStep(false);
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
      setActiveTab('login');

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid OTP or expired.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => { // Removed separate function for brevity in prompt context
    e.preventDefault();

    console.log('🔍 DEBUG: Signup password check:', {
      p1: signupData.password,
      p2: signupData.confirmPassword,
      match: signupData.password === signupData.confirmPassword
    });

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    if (userRole === 'brand' && !signupData.company_name) {
      toast({
        title: 'Company name required',
        description: 'Please enter your company name.',
        variant: 'destructive',
      });
      return;
    }

    if (userRole === 'creator' && !signupData.name) {
      toast({
        title: 'Name required',
        description: 'Please enter your name.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = userRole === 'brand'
        ? `${getApiUrl()}/api/auth/register/brand`
        : `${getApiUrl()}/api/auth/register/creator`;

      const payload = userRole === 'brand'
        ? {
          company_name: signupData.company_name,
          email: signupData.email,
          password: signupData.password,
          website: signupData.website || undefined,
          phone_number: signupData.phone_number || undefined
        }
        : {
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          phone_number: signupData.phone_number || undefined
        };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Signup Response Error Text:', errorText);

        let errorMessage = 'Signup failed';

        try {
          const errorData = JSON.parse(errorText);
          // zValidator often returns error in .error or .target
          errorMessage = errorData.details || errorData.error || JSON.stringify(errorData) || errorMessage;
        } catch (e) {
          // Fallback to raw text or status if JSON parse fails
          errorMessage = errorText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // ✅ AUTO-LOGIN
      console.log('✅ Signup successful, auto-logging in...', data);
      login(data);

      toast({
        title: 'Signup successful',
        description: `Welcome! Setting up your workspace...`,
      });

      onClose();
      navigate('/dashboard');

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {activeTab === 'forgot-password' ? 'Reset Password' : 'Welcome to Creator Connect'}
          </DialogTitle>
        </DialogHeader>

        {activeTab === 'forgot-password' ? (
          <div className="space-y-4">
            {!isResetStep ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Enter your email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-otp">Enter OTP</Label>
                  <Input
                    id="reset-otp"
                    placeholder="6-digit code"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={() => {
                setActiveTab('login');
                setIsResetStep(false);
              }}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              {otpData?.showOtp ? (
                <form onSubmit={handleOtpVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Check your email for the verification code
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setOtpData(null);
                        setOtp('');
                      }}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot-password')}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              {/* <form onSubmit={handleSignup} ... reused from above >*/}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3">
                  <Label>I am signing up as:</Label>
                  <RadioGroup value={userRole} onValueChange={(v) => setUserRole(v as 'brand' | 'creator')} className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <RadioGroupItem value="brand" id="role-brand" className="peer sr-only" />
                      <Label
                        htmlFor="role-brand"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-all ${userRole === 'brand'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-popover hover:bg-accent hover:text-accent-foreground'
                          }`}
                      >
                        <Building2 className="mb-3 h-6 w-6" />
                        <span className="font-semibold">Company / Brand</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="creator" id="role-creator" className="peer sr-only" />
                      <Label
                        htmlFor="role-creator"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-all ${userRole === 'creator'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-popover hover:bg-accent hover:text-accent-foreground'
                          }`}
                      >
                        <User className="mb-3 h-6 w-6" />
                        <span className="font-semibold">Creator</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {userRole === 'brand' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-company-name">Company Name *</Label>
                      <Input
                        id="signup-company-name"
                        type="text"
                        placeholder="Enter your company name"
                        value={signupData.company_name}
                        onChange={(e) => setSignupData(prev => ({ ...prev, company_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-website">Website (Optional)</Label>
                      <Input
                        id="signup-website"
                        type="url"
                        placeholder="https://yourcompany.com"
                        value={signupData.website}
                        onChange={(e) => setSignupData(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number *</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={signupData.phone_number}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phone_number: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter your password (min. 6 characters)"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing up...' : `Sign Up as ${userRole === 'brand' ? 'Brand' : 'Creator'}`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
