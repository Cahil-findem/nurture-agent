import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ error: 'Domain parameter is required' });
    }

    // Clean domain (remove protocol, www, etc.)
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    console.log('Fetching logo for domain:', cleanDomain);

    // Try Brandfetch API
    const brandfetchUrl = `https://api.brandfetch.io/v2/brands/${cleanDomain}`;

    try {
      const brandfetchResponse = await axios.get(brandfetchUrl, {
        timeout: 5000
      });

      if (brandfetchResponse.data && brandfetchResponse.data.logos && brandfetchResponse.data.logos.length > 0) {
        // Prefer logo type over symbol/icon
        const logos = brandfetchResponse.data.logos;
        const bestLogo = logos.find(logo => logo.type === 'logo') ||
                        logos.find(logo => logo.type === 'wordmark') ||
                        logos.find(logo => logo.type === 'symbol') ||
                        logos[0];

        if (bestLogo && bestLogo.formats && bestLogo.formats.length > 0) {
          // Prefer PNG or SVG formats
          const preferredFormat = bestLogo.formats.find(format =>
            format.format === 'png' || format.format === 'svg'
          ) || bestLogo.formats[0];

          console.log('Found logo via Brandfetch (type:', bestLogo.type, '):', preferredFormat.src);

          // Also extract brand colors if available
          const colors = brandfetchResponse.data.colors || [];
          const brandColors = colors.slice(0, 4).map(color => ({
            color: color.hex,
            hex: color.hex
          }));

          return res.json({
            logo_url: preferredFormat.src,
            brand_colors: brandColors
          });
        }
      }
    } catch (brandfetchError) {
      console.log('Brandfetch failed, trying fallback methods...');
    }

    // Fallback: Try common logo URLs
    const fallbackUrls = [
      `https://${cleanDomain}/logo.png`,
      `https://${cleanDomain}/logo.svg`,
      `https://${cleanDomain}/assets/logo.png`,
      `https://${cleanDomain}/images/logo.png`,
      `https://${cleanDomain}/static/logo.png`,
      `https://logo.clearbit.com/${cleanDomain}`
    ];

    for (const logoUrl of fallbackUrls) {
      try {
        const response = await axios.head(logoUrl, { timeout: 3000 });
        if (response.status === 200) {
          console.log('Found logo via fallback:', logoUrl);
          return res.json({ logo_url: logoUrl, brand_colors: [] });
        }
      } catch (error) {
        // Continue to next URL
      }
    }

    console.log('No logo found for domain:', cleanDomain);
    res.json({ logo_url: '', brand_colors: [] });

  } catch (error) {
    console.error('Logo fetch error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch logo',
      details: error.message,
      logo_url: '',
      brand_colors: []
    });
  }
}