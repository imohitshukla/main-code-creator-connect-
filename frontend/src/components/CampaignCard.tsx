import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, DollarSign, Calendar, Users, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Campaign {
  id: number;
  companyName: string;
  title: string;
  description: string;
  budget: string;
  requirements?: string;
  deadline?: string;
  applicants?: number;
  status?: string;
  progress?: number;
  engagement_rate?: number;
  roi?: number;
  brand_user_id?: number;
}

interface CampaignCardProps {
  campaign: Campaign;
  onApply?: (campaign: Campaign) => void;
  isOwner?: boolean;
  onClose?: (campaign: Campaign) => void;
}

const CampaignCard = ({ campaign, onApply, isOwner, onClose }: CampaignCardProps) => {
  const isClosed = campaign.status === 'closed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`group hover:shadow-hover transition-all duration-300 bg-gradient-card border-0 ${isClosed ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Building className="w-4 h-4" />
                {campaign.companyName}
              </div>
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-smooth">
                {campaign.title}
              </h3>
            </div>
            <Badge variant={isClosed ? "destructive" : "secondary"} className={isClosed ? "" : "bg-primary-soft text-primary"}>
              {isClosed ? 'Closed' : 'Active'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {campaign.description}
          </p>

          {campaign.requirements && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-1">Requirements:</h4>
              <p className="text-xs text-muted-foreground">{campaign.requirements}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{campaign.budget}</span>
            </div>

            {campaign.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{campaign.deadline}</span>
              </div>
            )}

            {campaign.applicants && (
              <div className="flex items-center gap-2 col-span-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{campaign.applicants} applicants</span>
              </div>
            )}

            {campaign.progress !== undefined && (
              <div className="col-span-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{campaign.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${campaign.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {(campaign.engagement_rate || campaign.roi) && (
              <div className="col-span-2 flex gap-4">
                {campaign.engagement_rate && (
                  <div className="text-xs text-muted-foreground">
                    Engagement: {campaign.engagement_rate.toFixed(2)}%
                  </div>
                )}
                {campaign.roi && (
                  <div className="text-xs text-muted-foreground">
                    ROI: ${campaign.roi.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isOwner && !isClosed && (
              <Button
                className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
                onClick={() => onApply?.(campaign)}
              >
                Apply Now
              </Button>
            )}

            {isOwner && !isClosed && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => onClose?.(campaign)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Close Campaign
              </Button>
            )}

            {isClosed && (
              <Button
                variant="secondary"
                className="w-full cursor-not-allowed"
                disabled
              >
                Campaign Closed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CampaignCard;