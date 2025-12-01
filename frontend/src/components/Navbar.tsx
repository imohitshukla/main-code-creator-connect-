import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, Edit3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile, logout, isAuthenticated, updateProfile } = useAuth();

  const profileDefaults = useMemo<UserProfile>(() => ({
    name: profile?.name || user?.username || user?.email?.split('@')[0] || 'Creator',
    phoneNumber: profile?.phoneNumber || user?.phone_number || '',
    email: profile?.email || user?.email || '',
    followers: profile?.followers || '',
    instagram: profile?.instagram || '',
    youtube: profile?.youtube || '',
    portfolio: profile?.portfolio || user?.portfolio_link || '',
  }), [profile, user]);

  const [profileForm, setProfileForm] = useState<UserProfile>(profileDefaults);

  useEffect(() => {
    if (isProfileDialogOpen) {
      setProfileForm(profileDefaults);
    }
  }, [isProfileDialogOpen, profileDefaults]);

  const profileInitial = (profile?.name || profileForm.name || user?.email || 'C')
    .trim()
    .charAt(0)
    .toUpperCase();

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfile(profileForm);
    toast({
      title: 'Profile updated',
      description: 'Your profile details have been saved.',
    });
    setIsProfileDialogOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/filter', label: 'Filter' },
    { path: '/ai-match', label: 'AI Match' },
    { path: '/campaign', label: 'Campaign' },
    { path: '/messages', label: 'Messages' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const profileDetailItems = [
    { label: 'Phone', value: profile?.phoneNumber || profileDefaults.phoneNumber },
    { label: 'Email', value: profile?.email || profileDefaults.email },
    { label: 'Followers', value: profile?.followers || 'Add follower count' },
    { label: 'Instagram', value: profile?.instagram || 'Add Instagram link' },
    { label: 'YouTube', value: profile?.youtube || 'Add YouTube link' },
    { label: 'Portfolio', value: profile?.portfolio || 'Add portfolio link' },
  ];

  const renderProfileMenu = () => (
    <>
      <DropdownMenuLabel className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {profileInitial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{profile?.name || profileDefaults.name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email || profileDefaults.email}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage your Creator Connect profile details and jump into conversations with brands.
        </p>
      </DropdownMenuLabel>
      <div className="px-3 pb-2 space-y-2 text-sm">
        {profileDetailItems.map((detail) => (
          <div key={detail.label} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{detail.label}</span>
            <span className="font-medium text-right truncate max-w-[55%]">
              {detail.value}
            </span>
          </div>
        ))}
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer gap-2"
        onSelect={() => setIsProfileDialogOpen(true)}
      >
        <Edit3 className="h-4 w-4" />
        Edit profile
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="cursor-pointer gap-2">
        <Link to="/messages" className="flex items-center gap-2 w-full">
          <MessageCircle className="h-4 w-4" />
          Messages
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
        <LogOut className="h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </>
  );

  return (
    <nav className="fixed top-0 w-full bg-card/95 backdrop-blur-sm border-b shadow-soft z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Creator Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className={`w-full ${isActive(item.path) ? 'text-primary' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.email || profileForm.email} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {profileInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                  {renderProfileMenu()}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAuthMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                >
                  Sign Up
                </Button>
                <Button 
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                >
                  Log In
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.email || profileForm.email} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {profileInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                  {renderProfileMenu()}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setAuthMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                >
                  Sign Up
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                >
                  Log In
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive(item.path)
                      ? 'text-primary bg-primary-soft'
                      : 'text-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Keep your creator profile information up to date so brands know how to contact and collaborate with you.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleProfileSave}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  placeholder="Jane Cooper"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone Number</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-followers">Followers</Label>
                <Input
                  id="profile-followers"
                  value={profileForm.followers}
                  onChange={(e) => handleProfileChange('followers', e.target.value)}
                  placeholder="e.g. 120K"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-instagram">Instagram Link</Label>
                <Input
                  id="profile-instagram"
                  type="url"
                  value={profileForm.instagram}
                  onChange={(e) => handleProfileChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-youtube">YouTube Link</Label>
                <Input
                  id="profile-youtube"
                  type="url"
                  value={profileForm.youtube}
                  onChange={(e) => handleProfileChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile-portfolio">Portfolio</Label>
                <Input
                  id="profile-portfolio"
                  type="url"
                  value={profileForm.portfolio}
                  onChange={(e) => handleProfileChange('portfolio', e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;

