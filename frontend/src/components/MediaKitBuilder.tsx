import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const MediaKitBuilder = () => {
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    youtube: '',
    twitter: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/mediakits/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ socialLinks })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'media-kit.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Media kit generated successfully!'
        });
      } else {
        throw new Error('Failed to generate media kit');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate media kit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Media Kit Builder</CardTitle>
        <CardDescription>
          Generate a professional media kit by connecting your social media accounts.
          We'll automatically pull your latest stats and create a PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(socialLinks).map(([platform, link]) => (
            <div key={platform} className="space-y-2">
              <Label htmlFor={platform} className="capitalize">
                {platform} Profile URL
              </Label>
              <Input
                id={platform}
                type="url"
                placeholder={`https://${platform}.com/yourprofile`}
                value={link}
                onChange={(e) => handleInputChange(platform, e.target.value)}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Media Kit'}
        </Button>

        <p className="text-sm text-muted-foreground">
          Note: We'll securely access your public profile data to include stats in your media kit.
        </p>
      </CardContent>
    </Card>
  );
};

export default MediaKitBuilder;
