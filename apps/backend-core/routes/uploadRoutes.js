import { Hono } from 'hono';
import crypto from 'crypto';

const router = new Hono();

/**
 * POST /api/upload/image
 * Uploads a profile picture directly to Cloudinary via their REST API (no npm package needed).
 * Returns a permanent https://res.cloudinary.com/... URL.
 */
router.post('/image', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file || typeof file === 'string') {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        // ✅ Image-only check
        if (!file.type.startsWith('image/')) {
            return c.json({ error: 'Only image files are allowed (JPG, PNG, GIF, WebP, etc.)' }, 400);
        }

        // ✅ 5MB size limit
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return c.json({
                error: `File too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`
            }, 413);
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            console.error('Cloudinary env vars missing');
            return c.json({ error: 'Upload service not configured' }, 500);
        }

        // Build signed upload params
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = 'creator-connect/avatars';
        const transformation = 'c_fill,g_face,h_400,w_400/q_auto,f_auto';

        // Cloudinary signature: sign the params alphabetically
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}&transformation=${transformation}`;
        const signature = crypto
            .createHash('sha256')
            .update(paramsToSign + apiSecret)
            .digest('hex');

        // Build multipart form for Cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });

        const formData = new FormData();
        formData.append('file', blob, file.name || 'avatar.jpg');
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        formData.append('folder', folder);
        formData.append('transformation', transformation);

        const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );

        const result = await uploadRes.json();

        if (!uploadRes.ok || result.error) {
            console.error('Cloudinary upload error:', result.error);
            return c.json({ error: result.error?.message || 'Cloudinary upload failed' }, 500);
        }

        return c.json({
            success: true,
            url: result.secure_url,
            message: 'Profile picture uploaded successfully'
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return c.json({ error: 'File upload failed', details: error.message }, 500);
    }
});

export default router;
