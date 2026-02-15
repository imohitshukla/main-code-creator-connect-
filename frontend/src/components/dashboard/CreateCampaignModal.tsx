import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from 'lucide-react';

interface CreateCampaignModalProps {
    onCampaignCreated: () => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onCampaignCreated }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        product_type: 'UGC',
        budget_range: '',
        description: '',
        requirements: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('auth_token'); // Or use AuthContext
            const response = await fetch('http://localhost:5000/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create campaign');
            }

            setOpen(false);
            setFormData({
                title: '',
                product_type: 'UGC',
                budget_range: '',
                description: '',
                requirements: ''
            });
            onCampaignCreated(); // Refresh list

        } catch (error) {
            console.error('Error creating campaign:', error);
            // Ideally show toast error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Post New Campaign
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                        Post a new job for creators. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g. Summer Skincare UGC"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product_type" className="text-right">
                                Type
                            </Label>
                            <select
                                id="product_type"
                                value={formData.product_type}
                                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="UGC">UGC</option>
                                <option value="Reels">Reels</option>
                                <option value="TikTok">TikTok</option>
                                <option value="YouTube">YouTube</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="budget" className="text-right">
                                Budget
                            </Label>
                            <Input
                                id="budget"
                                value={formData.budget_range}
                                onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g. $100 - $300"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                                placeholder="Briefly describe the campaign..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="requirements" className="text-right">
                                Requirements
                            </Label>
                            <Textarea
                                id="requirements"
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                className="col-span-3"
                                placeholder="List specific deliverables..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Post Campaign'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCampaignModal;
