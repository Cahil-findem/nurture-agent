interface BlogPost {
  title: string;
  url: string;
  publish_date: string;
  summary: string;
}

interface ColorSwatch {
  color: string;
  hex: string;
}

interface CrawlerResult {
  logo_url: string;
  brand_colors: ColorSwatch[];
  blog_posts: BlogPost[];
  about_text: string;
  company_summary: string;
  tone_of_voice_example: string;
}

export async function crawlCompanyWebsite(domain: string): Promise<CrawlerResult> {
  try {
    // Ensure domain has protocol
    const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;

    // Crawl main page
    const mainPageData = await crawlPage(baseUrl);

    // Try to find blog/news pages
    const blogPosts = await findBlogPosts(baseUrl);

    // Extract logo and colors using Brandfetch
    const logoData = await extractLogoWithBrandfetch(baseUrl);

    // Extract about section
    const aboutText = extractAboutText(mainPageData);

    // Generate AI analysis
    const analysis = await generateAIAnalysis(mainPageData, aboutText, blogPosts);

    return {
      logo_url: logoData.logo_url || '',
      brand_colors: logoData.brand_colors || [],
      blog_posts: blogPosts.slice(0, 4),
      about_text: aboutText,
      company_summary: analysis.company_summary,
      tone_of_voice_example: analysis.tone_of_voice_example
    };

  } catch (error) {
    console.error('Web crawling error:', error);
    throw new Error(`Failed to crawl website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function crawlPage(url: string): Promise<string> {
  try {
    const response = await fetch(`http://localhost:3004/api/crawl?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function findBlogPosts(baseUrl: string): Promise<BlogPost[]> {
  const blogPaths = ['/blog', '/news', '/articles', '/insights', '/posts'];
  const posts: BlogPost[] = [];

  for (const path of blogPaths) {
    try {
      const blogUrl = new URL(path, baseUrl).toString();
      const blogPageContent = await crawlPage(blogUrl);
      const extractedPosts = extractBlogPostsFromPage(blogPageContent, baseUrl);
      posts.push(...extractedPosts);

      if (posts.length >= 4) break;
    } catch (error) {
      // Continue to next path if this one fails
      continue;
    }
  }

  return posts.sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
}

function extractBlogPostsFromPage(html: string, baseUrl: string): BlogPost[] {
  const posts: BlogPost[] = [];

  // Create a temporary DOM to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Common blog post selectors
  const selectors = [
    'article',
    '.post',
    '.blog-post',
    '.entry',
    '[class*="post"]',
    '[class*="article"]'
  ];

  for (const selector of selectors) {
    const elements = doc.querySelectorAll(selector);

    elements.forEach((element, index) => {
      if (posts.length >= 10) return; // Limit to prevent too many results

      const titleEl = element.querySelector('h1, h2, h3, .title, [class*="title"]');
      const linkEl = element.querySelector('a[href]') || titleEl?.closest('a');
      const dateEl = element.querySelector('time, .date, [class*="date"]');
      const summaryEl = element.querySelector('p, .excerpt, .summary, [class*="excerpt"]');

      if (titleEl && linkEl) {
        const title = titleEl.textContent?.trim() || '';
        const relativeUrl = linkEl.getAttribute('href') || '';
        const url = relativeUrl.startsWith('http') ? relativeUrl : new URL(relativeUrl, baseUrl).toString();
        const publishDate = dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || new Date().toISOString().split('T')[0];
        const summary = summaryEl?.textContent?.trim() || '';

        if (title && url) {
          posts.push({
            title,
            url,
            publish_date: publishDate,
            summary: summary.slice(0, 200) // Limit summary length
          });
        }
      }
    });

    if (posts.length >= 4) break;
  }

  return posts;
}

async function extractLogoWithBrandfetch(baseUrl: string): Promise<{logo_url: string, brand_colors: ColorSwatch[]}> {
  try {
    const response = await fetch(`http://localhost:3004/api/logo?domain=${encodeURIComponent(baseUrl)}`);

    if (!response.ok) {
      throw new Error(`Logo API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Brandfetch logo response:', data);

    return data || { logo_url: '', brand_colors: [] };
  } catch (error) {
    console.error('Logo extraction error:', error);
    return { logo_url: '', brand_colors: [] };
  }
}

// Keep the old function as fallback
async function extractLogo(baseUrl: string, html: string): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Common logo selectors
  const logoSelectors = [
    'img[alt*="logo" i]',
    '.logo img',
    '#logo img',
    '[class*="logo"] img',
    'header img:first-of-type',
    '.navbar img:first-of-type',
    '.header img:first-of-type'
  ];

  console.log('Extracting logo from:', baseUrl);

  for (const selector of logoSelectors) {
    const logoEl = doc.querySelector(selector) as HTMLImageElement;
    if (logoEl?.src) {
      const logoUrl = logoEl.src.startsWith('http') ? logoEl.src : new URL(logoEl.src, baseUrl).toString();
      console.log('Found logo with selector:', selector, 'URL:', logoUrl);
      return logoUrl;
    }
  }

  console.log('No logo found with standard selectors');
  return '';
}

function extractAboutText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Common about section selectors
  const aboutSelectors = [
    '[id*="about" i]',
    '[class*="about" i]',
    '[id*="company" i]',
    '[class*="company" i]',
    '.hero p',
    '.intro p',
    'main p:first-of-type'
  ];

  for (const selector of aboutSelectors) {
    const element = doc.querySelector(selector);
    if (element?.textContent) {
      const text = element.textContent.trim();
      if (text.length > 50) { // Ensure it's substantial content
        return text.slice(0, 500); // Limit length
      }
    }
  }

  // Fallback: get first substantial paragraph
  const paragraphs = doc.querySelectorAll('p');
  for (const p of paragraphs) {
    const text = p.textContent?.trim() || '';
    if (text.length > 100 && !text.toLowerCase().includes('cookie')) {
      return text.slice(0, 500);
    }
  }

  return '';
}

async function generateAIAnalysis(mainContent: string, aboutText: string, blogPosts: BlogPost[]): Promise<{company_summary: string, tone_of_voice_example: string}> {
  try {
    const response = await fetch('http://localhost:3004/api/analyze-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mainContent: mainContent.slice(0, 5000), // Limit content size
        aboutText,
        blogPosts
      })
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    return await response.json();
  } catch (error) {
    // Fallback to basic analysis
    return {
      company_summary: aboutText ? aboutText.slice(0, 200) : 'Company information will be populated after website analysis.',
      tone_of_voice_example: 'We are committed to delivering exceptional value to our customers through innovative solutions and outstanding service.'
    };
  }
}