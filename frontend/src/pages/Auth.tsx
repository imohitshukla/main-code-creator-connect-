import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Building2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const Auth = () => {
  const { toast } = useToast();
  const [creatorForm, setCreatorForm] = useState({
    name: '',
    followers: '',
    contact: '',
    email: ''
  });
  
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    productType: '',
    contact: '',
    email: ''
  });

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creator registration:', creatorForm);
    toast({
      title: "Creator Registration Successful!",
      description: `Welcome ${creatorForm.name}! Your creator profile has been created.`,
    });
    // Reset form
    setCreatorForm({ name: '', followers: '', contact: '', email: '' });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Company registration:', companyForm);
    toast({
      title: "Company Registration Successful!",
      description: `Welcome ${companyForm.companyName}! Your company profile has been created.`,
    });
    // Reset form
    setCompanyForm({ companyName: '', productType: '', contact: '', email: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

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
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Choose your registration type to begin your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="creator" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="creator" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Creator
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </TabsTrigger>
              </TabsList>

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
                    <Label htmlFor="creator-contact">Contact Information</Label>
                    <Input
                      id="creator-contact"
                      type="tel"
                      placeholder="Phone number or preferred contact method"
                      value={creatorForm.contact}
                      onChange={(e) => setCreatorForm({ ...creatorForm, contact: e.target.value })}
                      required
                    />
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
                    <Label htmlFor="company-contact">Company Contact Information</Label>
                    <Input
                      id="company-contact"
                      type="tel"
                      placeholder="Business phone number"
                      value={companyForm.contact}
                      onChange={(e) => setCompanyForm({ ...companyForm, contact: e.target.value })}
                      required
                    />
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
                  
                  <Button type="submit" className="w-full">
                    Register as Company
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;