import { Link } from 'react-router-dom';

// Define a type for the props, allowing for extra classes
type LogoProps = {
  className?: string;
};

const Logo = ({ className = '' }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center space-x-2 ${className}`}>
      {/* Icon Box */}
      <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">CC</span>
      </div>
      
      {/* Text */}
      <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
        Creator Connect
      </span>
    </Link>
  );
};

export default Logo;