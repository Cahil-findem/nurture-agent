import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}