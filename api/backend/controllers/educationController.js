import { client } from '../config/database.js';

// Static educational resources
const educationalResources = [
  {
    id: 1,
    title: 'Building Your Personal Brand as a Creator',
    category: 'Branding',
    content: 'Learn how to establish a strong personal brand that resonates with your audience...',
    type: 'article'
  },
  {
    id: 2,
    title: 'Content Creation Best Practices',
    category: 'Content',
    content: 'Discover strategies for creating engaging content that drives engagement and growth...',
    type: 'guide'
  },
  {
    id: 3,
    title: 'Monetization Strategies for Creators',
    category: 'Business',
    content: 'Explore various ways creators can monetize their content and build sustainable income...',
    type: 'article'
  },
  {
    id: 4,
    title: 'Understanding Analytics and KPIs',
    category: 'Analytics',
    content: 'Learn how to interpret social media analytics and key performance indicators...',
    type: 'tutorial'
  },
  {
    id: 5,
    title: 'Collaborating with Brands Effectively',
    category: 'Partnerships',
    content: 'Tips for successful brand collaborations and maintaining authentic partnerships...',
    type: 'guide'
  }
];

export const getEducationalResources = async (c) => {
  try {
    const category = c.req.query('category');
    let resources = educationalResources;

    if (category) {
      resources = resources.filter(resource =>
        resource.category.toLowerCase() === category.toLowerCase()
      );
    }

    return c.json({ resources });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch educational resources' }, 500);
  }
};

export const getResourceById = async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const resource = educationalResources.find(r => r.id === id);

    if (!resource) {
      return c.json({ error: 'Resource not found' }, 404);
    }

    return c.json({ resource });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch resource' }, 500);
  }
};

export const getResourceCategories = async (c) => {
  try {
    const categories = [...new Set(educationalResources.map(r => r.category))];
    return c.json({ categories });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
};
