import { Hono } from 'hono';
import { upload } from '../middleware/uploadMiddleware.js';
import { serve } from '@hono/node-server';

// Since Hono doesn't directly support Express/Multer middleware in the same way,
// we often need a wrapper or handle it differently.
// However, @hono/node-server allows using some Node.js specific streams.
// But mostly, people use a specific Hono body parser.
// BUT, since we have `multer` and we are running on Node, we can use a wrapper or just use `hono/body` if we weren't using `multer`.
//
// WAIT. mixing Hono and standard Express/Connect middleware (like Multer) is tricky.
// Hono has its own way of handling files: `c.req.parseBody()`.
//
// REF: https://hono.dev/guides/form-data
//
// Let's rewrite this to use NATIVE Hono file handling, which is much cleaner and doesn't require Multer!
// It works perfectly with the node-server adapter.
//
// REVISION: I will use Hono's native file handling instead of Multer to be more "Hono-native" and avoid compatibility issues.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = new Hono();

// Use /image sub-path to avoid any root route ambiguity with app.route
router.post('/image', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file']; // matches formData.append('file', ...)

        if (!file) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        // "file" is a File or Blob object in Hono (standard Web API)
        // We need to convert it to a buffer to write to disk in Node.

        // Safety check
        if (!(file instanceof File)) {
            // Sometimes parseBody returns string for text fields, verify it is a File
            // In some Hono versions/adapters, this might be tricky.
            // Let's check if it has arrayBuffer method.
            if (typeof file === 'string') {
                return c.json({ error: 'Invalid file upload' }, 400);
            }
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Ensure uploads dir
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize original name
        const originalName = file.name || 'image.png';
        const ext = path.extname(originalName);
        const filename = `avatar-${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Write file
        fs.writeFileSync(filepath, buffer);

        // Return URL
        // We need to serve this directory statically in server.js
        const fileUrl = `/uploads/${filename}`;

        return c.json({
            success: true,
            url: fileUrl,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return c.json({ error: 'File upload failed', details: error.message }, 500);
    }
});

export default router;
