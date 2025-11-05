import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="text-8xl mb-8">❌</div>
        <h1 className="mb-4 text-display font-bold text-foreground">404 - Page Not Found</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-3 bg-gradient-hero text-white rounded-lg hover:shadow-glow transition-all duration-300 font-medium"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
