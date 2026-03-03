import { Hono } from 'hono';
import { v2 as cloudinary } from 'cloudinary';

const router = new Hono();

// Configure Cloudinary from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload/image
 * Uploads a profile picture directly to Cloudinary (permanent CDN storage).
 * Returns a permanent https://res.cloudinary.com/... URL.
 */
router.post('/image', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        // Reject non-File (text) fields
        if (typeof file === 'string') {
            return c.json({ error: 'Invalid file upload' }, 400);
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

        // Convert File/Blob to Buffer for Cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary via upload_stream (returns a permanent CDN URL)
        const cloudinaryUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'creator-connect/avatars',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }
            );
            stream.end(buffer);
        });

        return c.json({
            success: true,
            url: cloudinaryUrl,
            message: 'Profile picture uploaded successfully'
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return c.json({ error: 'File upload failed', details: error.message }, 500);
    }
});

export default router;
