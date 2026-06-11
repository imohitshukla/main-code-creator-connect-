import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Filter } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

interface Resource {
  id: number;
  title: string;
  category: string;
  content: string;
  type: string;
}

const EducationHub = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchResources();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/education/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const url = selectedCategory === 'all'
        ? `${getApiUrl()}/api/education`
        : `${getApiUrl()}/api/education?category=${selectedCategory}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-green-100 text-green-800';
      case 'tutorial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Branding': 'bg-orange-100 text-orange-800',
      'Content': 'bg-teal-100 text-teal-800',
      'Business': 'bg-indigo-100 text-indigo-800',
      'Analytics': 'bg-pink-100 text-pink-800',
      'Partnerships': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="h-8 w-8" />
          Education Hub
        </h1>
        <p className="text-muted-foreground">
          Learn from expert resources to grow your creator career and business.
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter by category:</span>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedResource ? (
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => setSelectedResource(null)}
            className="mb-4"
          >
            ← Back to Resources
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedResource.title}</CardTitle>
                  <CardDescription className="flex gap-2 mt-2">
                    <Badge className={getCategoryColor(selectedResource.category)}>
                      {selectedResource.category}
                    </Badge>
                    <Badge className={getTypeColor(selectedResource.type)}>
                      {selectedResource.type}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed">{selectedResource.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedResource(resource)}>
              <CardHeader>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription className="flex gap-2">
                  <Badge className={getCategoryColor(resource.category)}>
                    {resource.category}
                  </Badge>
                  <Badge className={getTypeColor(resource.type)}>
                    {resource.type}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {resource.content.substring(0, 150)}...
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  Read more →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {resources.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No resources found for the selected category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EducationHub;
