import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Brandfetch logo endpoint
app.get('/api/logo', async (req, res) => {
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
});

// Crawl endpoint
app.get('/api/crawl', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log('Crawling URL:', url);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    res.send(response.data);
  } catch (error) {
    console.error('Crawling error:', error.message);
    res.status(500).json({
      error: 'Failed to crawl URL',
      details: error.message
    });
  }
});

// AI Analysis endpoint
app.post('/api/analyze-content', async (req, res) => {
  try {
    const { mainContent, aboutText, blogPosts } = req.body;

    console.log('Analyzing content with OpenAI...');

    const prompt = `You are a web crawler and content analyzer. Based on the following website content, generate a company summary and tone of voice example.

Website Content:
${mainContent}

About Section:
${aboutText}

Recent Blog Posts:
${blogPosts.map(post => `- ${post.title}: ${post.summary}`).join('\n')}

Please analyze this content and provide:

1. A concise company summary (2-3 sentences, plain language) that describes what the company does and their value proposition.

2. A tone of voice example: write a short paragraph (2-3 sentences) in the company's own style, as if the company wrote it themselves. Match their communication style, formality level, and vocabulary.

Respond only with a JSON object in this exact format:
{
  "company_summary": "Your 2-3 sentence company summary here",
  "tone_of_voice_example": "Your 2-3 sentence tone example here"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const result = completion.choices[0].message.content;
    console.log('OpenAI response:', result);

    try {
      // Remove markdown code blocks if present
      let cleanedResult = result;
      if (result.includes('```json')) {
        cleanedResult = result.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (result.includes('```')) {
        cleanedResult = result.replace(/```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedResult = JSON.parse(cleanedResult);
      res.json(parsedResult);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback response
      res.json({
        company_summary: aboutText ? aboutText.slice(0, 200) : 'Company information will be populated after website analysis.',
        tone_of_voice_example: 'We are committed to delivering exceptional value to our customers through innovative solutions and outstanding service.'
      });
    }

  } catch (error) {
    console.error('AI Analysis error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze content',
      details: error.message,
      // Fallback data
      company_summary: 'Company information will be populated after website analysis.',
      tone_of_voice_example: 'We are committed to delivering exceptional value to our customers through innovative solutions and outstanding service.'
    });
  }
});

// Email generation endpoint
app.post('/api/generate-email', async (req, res) => {
  try {
    const { companyName, companyWebsite, logoUrl, blogPosts, companyDescription, toneOfVoice, userName, targetRole } = req.body;

    console.log('Generating email for company:', companyName);
    console.log('User name received:', userName);
    console.log('Target role:', targetRole);

    // Get the most recent blog post
    const recentBlog = blogPosts && blogPosts.length > 0 ? blogPosts[0] : null;

    // Define role-specific content focus
    const roleContext = {
      'Software Engineer': {
        focus: 'technical innovation, engineering challenges, cutting-edge technology stack, development practices, and technical growth opportunities',
        interests: 'coding, architecture, scalability, new technologies, technical problem-solving, and engineering culture',
        callToAction: 'explore engineering opportunities and technical challenges'
      },
      'Marketing Manager': {
        focus: 'brand growth, market disruption, customer acquisition strategies, marketing innovation, and brand positioning',
        interests: 'brand building, growth marketing, customer engagement, market expansion, creative campaigns, and marketing analytics',
        callToAction: 'discuss marketing leadership opportunities and growth strategies'
      },
      'Sales Representative': {
        focus: 'sales growth, customer relationships, market expansion, revenue generation, and sales enablement',
        interests: 'client relationships, sales processes, market penetration, revenue targets, customer success, and sales technology',
        callToAction: 'explore sales opportunities and revenue growth potential'
      }
    };

    const roleInfo = roleContext[targetRole] || roleContext['Software Engineer'];

    const prompt = `You are an expert email copywriter creating a personalized nurture email for a recruiting campaign targeting a ${targetRole}.

Company Information:
- Company: ${companyName}
- Website: ${companyWebsite}
- Description: ${companyDescription}
- Tone of Voice: ${toneOfVoice}
- Recipient Name: ${userName}
- Target Role: ${targetRole}

Recent Blog Post:
${recentBlog ? `- Title: ${recentBlog.title}
- Summary: ${recentBlog.summary}
- URL: ${recentBlog.url}` : 'No recent blog posts available'}

Role-Specific Context:
- Focus areas for ${targetRole}: ${roleInfo.focus}
- Key interests: ${roleInfo.interests}
- Call-to-action focus: ${roleInfo.callToAction}

Create an engaging email that:
1. Has a compelling title that MUST start with "At ${companyName} we" and then continue with something specifically relevant to ${targetRole} and their interests in ${roleInfo.focus}
2. Highlights how ${companyName} is disrupting their industry, with specific emphasis on aspects that would appeal to a ${targetRole}
3. References their recent blog content (if available) through the lens of how it relates to ${targetRole} work
4. Positions a hypothetical ${targetRole} opportunity as a chance to join their disruptive mission
5. Includes specific details about what a ${targetRole} would find exciting about working at ${companyName}
6. Matches their tone of voice while speaking directly to ${targetRole} interests
7. Includes a role-specific call-to-action focused on ${roleInfo.callToAction}

The email should feel personally crafted for a ${targetRole}, showing deep understanding of their professional interests and career motivations.

Respond with a JSON object containing:
{
  "subject": "Email subject line tailored to ${targetRole}",
  "content": "Full email body in HTML format with proper styling and a compelling H1 title that starts with 'At ${companyName} we...' and relates to ${targetRole}",
  "preview_text": "Email preview text (50-100 characters) relevant to ${targetRole}"
}

IMPORTANT:
- The HTML content MUST include an H1 title that starts with "At ${companyName} we" followed by something compelling about their business that specifically appeals to a ${targetRole}.
- Start the email body with a personal greeting using the recipient's name: "Hi ${userName}," or "Hello ${userName}," - this is REQUIRED
- Address the email to "${userName}" specifically throughout the content
- Tailor ALL content specifically for a ${targetRole} - use terminology, challenges, and opportunities relevant to their role
- Use GREY 900 color (#111827) for H1 heading text and BLACK color (#000000) for other heading text (H2, H3, etc.)
- Use proper email styling with standard body text colors for all content
- Make sure the HTML content includes proper styling and is ready to display in an email preview.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const result = completion.choices[0].message.content;
    console.log('OpenAI email response:', result);

    try {
      // Remove markdown code blocks if present
      let cleanedResult = result;
      if (result.includes('```json')) {
        cleanedResult = result.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (result.includes('```')) {
        cleanedResult = result.replace(/```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedResult = JSON.parse(cleanedResult);

      // Add logo URL and company info to the response
      res.json({
        ...parsedResult,
        logoUrl,
        companyName,
        companyWebsite
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI email response:', parseError);
      // Fallback email
      res.json({
        subject: `Exciting opportunity at ${companyName}`,
        content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Join ${companyName}'s Mission</h2>
          <p>Hi there,</p>
          <p>I've been following ${companyName} and I'm impressed by how you're transforming your industry. Your innovative approach caught my attention.</p>
          <p>We have an exciting opportunity that could be perfect for someone looking to make an impact in a forward-thinking company like yours.</p>
          <p>Would you be interested in learning more?</p>
          <p>Best regards,<br>The Recruiting Team</p>
        </div>`,
        preview_text: `Join ${companyName}'s innovative mission`,
        logoUrl,
        companyName,
        companyWebsite
      });
    }

  } catch (error) {
    console.error('Email generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate email',
      details: error.message
    });
  }
});

// Chat endpoint for Cleo
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, candidateData, conversationStage } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured'
      });
    }

    const createSystemPrompt = (candidateData, conversationStage) => {
      const candidateContext = candidateData ? `
Current Candidate Profile:
- Name: ${candidateData.name}
- Job Titles: ${candidateData.jobPreferences.titles.join(', ')}
- Locations: ${candidateData.jobPreferences.locations.join(', ')}
- Level/Seniority: ${candidateData.jobPreferences.levelSeniority}
- Job Specifics: ${candidateData.jobPreferences.jobSpecifics.join(', ') || 'None specified'}
- Professional Interests: ${candidateData.professionalInterests.join(', ')}
- Company: ${candidateData.jobPreferences.company}
- Current Stage: ${conversationStage}
` : 'No candidate data available yet.';

      return `You are Cleo, a personal talent advocate and insider at ${candidateData?.jobPreferences.company || 'Kong'}. You help candidates explore opportunities by understanding their preferences and professional interests.

## Purpose
Your primary objective is to understand the candidate's job preferences, as this profile will be used to send them relevant job opportunities when positions open up. Your secondary objective is to optionally learn about their professional interests, which will be used to send them interesting company updates and industry content. You maintain and update their profile through natural conversation to enable targeted job matching and relevant content sharing.

## Scope
- Collect and validate job preferences (titles, locations, seniority, specifics)
- Understand professional interests (technologies, learning topics, development areas)
- Update candidate profiles based on their feedback
- Progress through conversation stages systematically

## Tone & Personality
- Warm, professional, and genuinely supportive
- Act as their advocate and insider who wants to help them succeed
- Natural conversational flow, not robotic or scripted
- Acknowledge their feedback and show you understand their goals

## Context
${candidateContext}

## Conversation Stages
1. **job_verification** - Confirm understanding of job preferences
2. **professional_interests** - Learn about their professional development interests
3. **professional_verification** - Confirm professional interests
4. **complete** - Wrap up with next steps

## Key Behaviors

### When interpreting feedback:
- Extract specific information (job titles, technologies, locations, etc.)
- ALWAYS ask if they want to ADD to existing preferences or REPLACE them completely if they have existing preferences
- Never assume - always confirm the type of change they want
- Don't just repeat what they said - interpret what changes they want
- Ask for clarification if their intent is unclear

### Critical Rules for Profile Changes:
- When a candidate mentions new job titles, locations, or interests, ALWAYS ask: "Would you like me to ADD this to your existing preferences, or REPLACE your current preferences with this new information?"
- Never make changes without explicit confirmation of add vs replace
- If unclear, ask them to clarify their intent before making any updates

### When updating profiles:
- Clearly articulate what changes you understand they want
- Show updated summaries after making changes
- Ask for confirmation that the updates are correct
- When updating a profile would result in removing a preference, ask if they want to keep the existing preferences or replace them with the new ones

### Response format for summaries:
🚨 MANDATORY HTML FORMATTING 🚨
You are displaying content in a web browser that requires HTML formatting. You MUST use HTML tags, NOT plain text.

REQUIRED FORMAT for ALL summaries:
"Let me confirm what I understand:<br><br><strong>Job Preferences:</strong><br>• Job Title(s): [titles]<br>• Location(s): [locations]<br>• Level/Seniority: [level]<br>• Ideal job specifics: [specifics] (if any)<br><br><strong>Professional Interests:</strong><br>• [interest 1]<br>• [interest 2]<br>• [interest 3]<br>"

🚨 CRITICAL FORMATTING RULES:
- Use <strong></strong> for bold headers, NOT **text**
- Use <br> for line breaks, NOT plain line breaks
- Put <br> after EVERY bullet point
- Put <br><br> between sections
- This is HTML content - plain text will display incorrectly

### Conversation Flow:
- Start with personalized greeting using their first name
- Present initial summary and ask if it's accurate
- If they confirm: move to professional interests
- If they want changes: interpret their feedback and update accordingly
- Always confirm understanding before moving to next stage
- End by confirming you have what you need to help them

## Question Guidelines:
- **One question at a time:** Only ask one focused question per response, covering one topic
- **Clarity questions:** When seeking clarification on a candidate's response, you may ask up to 3 questions maximum, but fewer is better
- **Stay focused:** Each question should have a single, clear purpose

## What NOT to do:
- Don't repeat their exact words back to them
- Don't ask multiple questions at once (except when clarifying, max 3)
- Don't mix multiple topics in one question
- Don't fabricate or assume information they haven't provided
- Don't move to next stage without confirmation
- Don't make profile changes without being clear about what you're updating

Remember: You're their advocate. Focus on understanding their goals and helping them find the right opportunities at ${candidateData?.jobPreferences.company || 'Kong'}.`;
    };

    const systemPrompt = createSystemPrompt(candidateData, conversationStage || 'job_verification');

    console.log('=== CHAT API DEBUG ===');
    console.log('Conversation Stage:', conversationStage);
    console.log('Messages received:', JSON.stringify(messages, null, 2));
    console.log('Candidate Data:', JSON.stringify(candidateData, null, 2));
    console.log('System Prompt Length:', systemPrompt.length);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    console.log('=== AI RESPONSE ===');
    console.log('AI Response:', message);
    console.log('==================');

    res.json({ message });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET  /api/crawl?url=<website_url>`);
  console.log(`- POST /api/analyze-content`);
  console.log(`- GET  /api/health`);
});