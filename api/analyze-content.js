import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}