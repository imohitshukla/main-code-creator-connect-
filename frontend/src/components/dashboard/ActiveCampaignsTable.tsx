import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Campaign {
    id: number;
    title: string;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    product_type: string;
    applicant_count?: number;
    created_at: string;
}

interface ActiveCampaignsTableProps {
    campaigns: Campaign[];
    isLoading: boolean;
    onDelete: (id: number) => void;
}

const ActiveCampaignsTable: React.FC<ActiveCampaignsTableProps> = ({ campaigns, isLoading, onDelete }) => {
    if (isLoading) {
        return <div className="text-center py-10">Loading campaigns...</div>;
    }

    if (campaigns.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No active campaigns found. Create your first one!</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Campaign Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.title}</TableCell>
                            <TableCell>
                                <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {campaign.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{campaign.product_type}</TableCell>
                            <TableCell>{campaign.applicant_count || 0}</TableCell>
                            <TableCell>{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" title="View Details">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" title="Edit">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => onDelete(campaign.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ActiveCampaignsTable;
