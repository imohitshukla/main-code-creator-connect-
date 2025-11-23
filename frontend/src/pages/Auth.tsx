import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Building2, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

const Auth = () => {
  const { toast } = useToast();
  const { login, verifyOtp } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [otpForm, setOtpForm] = useState({
    otp: '',
    userId: null as number | null
  });
  const [creatorForm, setCreatorForm] = useState({
    name: '',
    followers: '',
    contact: '',
    email: '',
    phone_number: ''
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    productType: '',
    contact: '',
    email: '',
    phone_number: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.requiresOtp) {
        setOtpForm({ ...otpForm, userId: result.userId! });
        setLoginStep('otp');
        toast({
          title: "OTP Sent!",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpForm.userId) return;

    try {
      await verifyOtp(otpForm.userId, otpForm.otp);
      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });
      // Reset forms
      setLoginForm({ email: '', password: '' });
      setOtpForm({ otp: '', userId: null });
      setLoginStep('credentials');
    } catch (error) {
      toast({
        title: "OTP Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToLogin = () => {
    setLoginStep('credentials');
    setOtpForm({ otp: '', userId: null });
  };

  const handleCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting creator registration:', {
      name: creatorForm.name,
      email: creatorForm.email,
      phone_number: creatorForm.phone_number
    });
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/register/creator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: creatorForm.name,
          email: creatorForm.email,
          password: creatorForm.followers, // Using followers as password for demo
          portfolio_link: 'https://example.com',
          phone_number: creatorForm.phone_number
        })
      });

      if (response.ok) {
        toast({
          title: "Creator Registration Successful!",
          description: `Welcome ${creatorForm.name}! Your creator profile has been created.`,
        });
        // Reset form
        setCreatorForm({ name: '', followers: '', contact: '', email: '', phone_number: '' });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting company registration:', {
      company_name: companyForm.companyName,
      email: companyForm.email,
      phone_number: companyForm.phone_number
    });
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/register/brand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyForm.companyName,
          email: companyForm.email,
          password: companyForm.productType, // Using productType as password for demo
          website: 'https://example.com',
          phone_number: companyForm.phone_number
        })
      });

      if (response.ok) {
        toast({
          title: "Company Registration Successful!",
          description: `Welcome ${companyForm.companyName}! Your company profile has been created.`,
        });
        // Reset form
        setCompanyForm({ companyName: '', productType: '', contact: '', email: '', phone_number: '' });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">

      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Join Creator Connect
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect, Collaborate, Create Amazing Content Together
          </p>
        </div>

        <Card className="shadow-hover border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {loginStep === 'otp' ? 'Verify Your Identity' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {loginStep === 'otp'
                ? 'Enter the 6-digit code sent to your email and phone'
                : 'Sign in to your account or create a new one'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginStep === 'credentials' ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="creator" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Creator
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="creator" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Creator Registration</h3>
                  <p className="text-muted-foreground">
                    Join our community of talented creators and showcase your work
                  </p>
                </div>
                
                <form onSubmit={handleCreatorSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creator-name">Full Name</Label>
                      <Input
                        id="creator-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={creatorForm.name}
                        onChange={(e) => setCreatorForm({ ...creatorForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creator-followers">Number of Followers</Label>
                      <Input
                        id="creator-followers"
                        type="number"
                        placeholder="e.g., 10000"
                        value={creatorForm.followers}
                        onChange={(e) => setCreatorForm({ ...creatorForm, followers: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="creator-email">Email Address</Label>
                    <Input
                      id="creator-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={creatorForm.email}
                      onChange={(e) => setCreatorForm({ ...creatorForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creator-phone">Phone Number</Label>
                    <Input
                      id="creator-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={creatorForm.phone_number}
                      onChange={(e) => setCreatorForm({ ...creatorForm, phone_number: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Register as Creator
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="company" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Company Registration</h3>
                  <p className="text-muted-foreground">
                    Connect with talented creators for your marketing campaigns
                  </p>
                </div>
                
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        type="text"
                        placeholder="Your company name"
                        value={companyForm.companyName}
                        onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-type">Product Type</Label>
                      <Input
                        id="product-type"
                        type="text"
                        placeholder="e.g., Fashion, Tech, Food"
                        value={companyForm.productType}
                        onChange={(e) => setCompanyForm({ ...companyForm, productType: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Business Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      placeholder="business@company.com"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Business Phone Number</Label>
                    <Input
                      id="company-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={companyForm.phone_number}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone_number: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Register as Company
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            ) : (
              // OTP Verification Step
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter 6-digit OTP</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpForm.otp}
                        onChange={(value) => setOtpForm({ ...otpForm, otp: value })}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={otpForm.otp.length !== 6}>
                    Verify OTP
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;