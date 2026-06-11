import { Hono } from 'hono';

const welcomeRoutes = new Hono();

welcomeRoutes.get('/', (c) => {
  return c.json({ message: 'Welcome to the CreatorConnect API!' });
});

export default welcomeRoutes;
