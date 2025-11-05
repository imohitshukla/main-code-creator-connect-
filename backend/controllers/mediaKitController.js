import client from '../config/database.js';
import PDFDocument from 'pdfkit';
import axios from 'axios';

export const generateMediaKit = async (c) => {
  try {
    const userId = c.get('userId');
    const { socialLinks } = await c.req.json();

    // Fetch creator profile
    const creator = await client.query(`
      SELECT cp.name, cp.bio, cp.niche, cp.followers, cp.engagement_rate,
             u.email
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.user_id = $1
    `, [userId]);

    if (creator.rows.length === 0) {
      return c.json({ error: 'Creator not found' }, 404);
    }

    const creatorData = creator.rows[0];

    // Pull social data (mock for now - replace with real API calls)
    const socialData = {};
    for (const [platform, link] of Object.entries(socialLinks)) {
      try {
        // Example: For Instagram, use Graph API
        if (platform === 'instagram') {
          // const response = await axios.get(`https://graph.instagram.com/...`);
          socialData[platform] = {
            followers: creatorData.followers || 0,
            engagement: creatorData.engagement_rate || 0,
            recentPosts: [] // Mock data
          };
        }
      } catch (error) {
        console.error(`Error fetching ${platform} data:`, error);
      }
    }

    // Generate PDF
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Add content to PDF
    doc.fontSize(25).text('Media Kit', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Creator: ${creatorData.name || creatorData.email}`);
    doc.fontSize(14).text(`Bio: ${creatorData.bio || 'No bio available'}`);
    doc.text(`Niche: ${creatorData.niche || 'Not specified'}`);
    doc.text(`Followers: ${creatorData.followers || 0}`);
    doc.text(`Engagement Rate: ${creatorData.engagement_rate || 0}%`);

    doc.moveDown();
    doc.fontSize(18).text('Social Media Stats:');
    for (const [platform, data] of Object.entries(socialData)) {
      doc.fontSize(14).text(`${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${data.followers} followers, ${data.engagement}% engagement`);
    }

    doc.end();

    // Wait for PDF to finish
    await new Promise((resolve) => doc.on('end', resolve));

    const pdfBuffer = Buffer.concat(buffers);

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="media-kit.pdf"'
      }
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to generate media kit' }, 500);
  }
};

export const getMediaKitData = async (c) => {
  try {
    const userId = c.get('userId');

    const creator = await client.query(`
      SELECT cp.name, cp.bio, cp.niche, cp.social_links, cp.followers, cp.engagement_rate,
             u.email
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.user_id = $1
    `, [userId]);

    if (creator.rows.length === 0) {
      return c.json({ error: 'Creator not found' }, 404);
    }

    return c.json({ mediaKitData: creator.rows[0] });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch media kit data' }, 500);
  }
};
