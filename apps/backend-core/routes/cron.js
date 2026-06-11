import { Hono } from 'hono';
import { runEngagementRateUpdater } from '../services/engagementService.js';

const router = new Hono();

router.get('/sync-socials', async (c) => {
    try {
        // 1. Authorization: Secure against public scraping/triggering
        const authHeader = c.req.header('Authorization');
        const internalCronSecret = process.env.CRON_SECRET;
        
        if (!internalCronSecret) {
            console.error('[Cron] CRON_SECRET is not configured in the environment.');
            return c.json({ error: 'Server misconfiguration' }, 500);
        }

        if (!authHeader || authHeader !== `Bearer ${internalCronSecret}`) {
            console.warn('[Cron] Unauthorized attempt to trigger /sync-socials');
            return c.json({ error: 'Unauthorized route trigger' }, 401);
        }

        // 2. Execute background proxy fetch
        const summary = await runEngagementRateUpdater();

        // 3. Respond with results
        return c.json({
            success: true,
            message: "Social metrics sync completed.",
            data: summary
        });

    } catch (error) {
        console.error('[Cron Endpoint Error]:', error);
        return c.json({ error: 'Failed to execute cron sync' }, 500);
    }
});

export default router;
