import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Layers, Edit3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { cn } from "@/lib/utils";
import Logo from '@/components/Logo';
import SmartAvatar from '@/components/SmartAvatar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const location = useLocation();
  const { user, profile, logout, isAuthenticated } = useAuth();

  const profileInitial = (profile?.name || user?.email || 'C')
    .trim()
    .charAt(0)
    .toUpperCase();

  const renderProfileMenu = () => (
    <>
      <DropdownMenuLabel className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {profileInitial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{profile?.name || user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="cursor-pointer gap-2">
        <Link to="/dashboard" className="flex items-center gap-2 w-full">
          <Layers className="h-4 w-4" />
          Dashboard
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="cursor-pointer gap-2">
        <Link to="/profile" className="flex items-center gap-2 w-full">
          <Edit3 className="h-4 w-4" />
          Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => { logout(); window.location.href = '/'; }} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
        <LogOut className="h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </>
  );

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          {/* Logo */}
          <div className="mr-8">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-base font-medium">All-in-One Platform</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to="/platform"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Creator Connect Platform
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              The end-to-end solution for your influencer marketing needs.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link to="/filter" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Influencer Discovery</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Find the perfect creators for your brand.
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/campaign" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Campaign Management</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Streamline your workflow from start to finish.
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/brand-dashboard" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Reporting & Analytics</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Measure ROI and campaign performance.
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/agency" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base font-medium")}>
                    Agency Services
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/stories" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base font-medium")}>
                    <span className="bg-[#dcfce7] text-[#14532d] text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 uppercase tracking-wide">New</span>
                    Customer Stories
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-base font-medium">Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {[
                        { title: "Blog", href: "/blog", description: "Latest trends and insights." },
                        { title: "Influencer Brief", href: "/resources/brief", description: "Templates for perfect briefs." },
                        { title: "Marketing Courses", href: "/education", description: "Learn from the experts." },
                        { title: "ROI Calculator", href: "/resources/roi", description: "Estimate your campaign returns." },
                      ].map((component) => (
                        <li key={component.title}>
                          <Link
                            to={component.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{component.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {component.description}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <SmartAvatar
                      src={user?.avatar}
                      type={user?.role === 'brand' ? 'brand' : 'creator'}
                      name={profile?.name || user?.email}
                      email={user?.email}
                      className="h-10 w-10"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" forceMount>
                  {renderProfileMenu()}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  className="bg-transparent border border-purple-500/50 hover:bg-purple-500/10 text-foreground transition-all duration-300 relative group overflow-hidden"
                  onClick={() => window.location.href = '/ai-match'}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    AI Match
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>

                <Button
                  variant="ghost"
                  className="text-base font-medium"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                >
                  Login
                </Button>
                <Button
                  className="bg-[#0f172a] text-white hover:bg-[#1e293b] rounded-full px-6"
                  onClick={() => window.location.href = '/contact'}
                >
                  Book a demo
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t py-4 space-y-4 bg-background h-screen">
            <div className="px-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Platform</h4>
                <Link to="/filter" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium">Influencer Discovery</Link>
                <Link to="/campaign" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium">Campaign Management</Link>
                <Link to="/brand-dashboard" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium">Analytics</Link>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Services</h4>
                <Link to="/agency" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium">Agency Services</Link>
                <Link to="/stories" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium">Customer Stories</Link>
              </div>

              <div className="pt-4 border-t">
                {!isAuthenticated ? (
                  <div className="grid gap-3">
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => {
                        setIsOpen(false);
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="w-full justify-center bg-[#0f172a] text-white rounded-full"
                      onClick={() => {
                        setIsOpen(false);
                        window.location.href = '/contact';
                      }}
                    >
                      Book a demo
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full justify-center"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                  >
                    Log out
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </nav>
  );
};

export default Navbar;
