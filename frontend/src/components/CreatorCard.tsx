import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import SmartAvatar from '@/components/SmartAvatar';

export interface Creator {
  id: number;
  name: string;
  niche: string;
  bio: string;
  image: string;
  avatar?: string; // Added avatar field from backend
  followers?: string;
  rating?: number;
  audience?: any;
  budget?: any;
  social_links?: any;
  portfolio_links?: any;
  email?: string; // Added for SmartAvatar fallback
}

interface CreatorCardProps {
  creator: Creator;
  onContact: (creator: Creator) => void;
}

const CreatorCard = ({ creator, onContact }: CreatorCardProps) => {
  return (
    <Card className="group hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 bg-gradient-card border-0 overflow-hidden cursor-pointer" onClick={() => window.location.href = `/profile/${creator.id}`}>
      <CardContent className="p-0">
        <div className="flex flex-col items-center p-8 text-center bg-card/50">
          <div className="relative mb-4">
            <SmartAvatar
              src={creator.avatar || creator.image}
              name={creator.name}
              email={creator.email}
              type="creator"
              alt={creator.name}
              className="w-24 h-24 rounded-full border-4 border-background shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            {creator.rating && (
              <div className="absolute bottom-0 right-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                {creator.rating}
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {creator.name}
          </h3>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              {creator.niche || 'General'}
            </span>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 max-w-[250px] min-h-[40px]">
            {creator.bio || 'Open to collaborations'}
          </p>

          <div className="w-full grid grid-cols-2 gap-4 border-t border-border pt-4 mb-4">
            <div>
              <p className="text-lg font-bold text-foreground">{creator.followers || '0'}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{creator.audience?.engagement || 'N/A'}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Engagement</p>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 rounded-xl"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onContact(creator);
            }}
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Creator
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorCard;