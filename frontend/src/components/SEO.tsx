import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
}

const SITE_NAME = 'Creator Connect';
const BASE_URL = 'https://www.creatorconnect.tech';
const DEFAULT_DESCRIPTION = "India's leading marketplace for brand-creator collaborations. Find vetted creators, run deals with a 7-step tracker, and pay via Razorpay escrow — zero agency fees.";

/**
 * Reusable SEO component for per-page meta tags.
 * Overrides the default index.html meta for each route.
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  type = 'website',
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Brand-Creator Collaboration Marketplace`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
