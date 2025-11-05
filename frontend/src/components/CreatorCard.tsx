import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export interface Creator {
  id: number;
  name: string;
  niche: string;
  bio: string;
  image: string;
  followers?: string;
  rating?: number;
}

interface CreatorCardProps {
  creator: Creator;
  onContact: (creator: Creator) => void;
}

const CreatorCard = ({ creator, onContact }: CreatorCardProps) => {
  return (
    <Card className="group hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 bg-gradient-card border-0">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={creator.image}
              alt={creator.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-smooth"
            />
            {creator.rating && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                {creator.rating}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-smooth">
                  {creator.name}
                </h3>
                <p className="text-sm font-medium text-primary bg-primary-soft px-2 py-1 rounded-full inline-block">
                  {creator.niche}
                </p>
              </div>
            </div>
            
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {creator.bio}
            </p>
            
            {creator.followers && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                {creator.followers} followers
              </p>
            )}
            
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => onContact(creator)}
                className="bg-gradient-hero hover:shadow-glow transition-all duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorCard;