// pages/api/analyze.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input } = req.body;
    const content = input?.[0]?.content

     if (!content || (Array.isArray(content) && content.length === 0)) {
      return res.status(400).json({ error: 'Content is required' });
    }


    const response = await fetch("https://api.x.ai/v1/responses", {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.key}`
      },

      body: JSON.stringify({
      model: "grok-4.3",
      input: [
        {
          role: "user",
          content: content
        }
      ],
      tools: [
        {
          type:"web_search"
        }
      ],
      temperature: 0.4,
      max_output_tokens: 4000
    })
    });

    const data = await response.json()

console.log("xAI status:", response.status);
console.log("xAI response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(JSON.stringify(data)|| 'Erro na API do Grok')}



    const grokResponse = data.output
    .filter(block => block.type === 'message')
    .flatMap(block => block.content)
    .filter(c => c.type === 'output_text')
    .map(c => c.text)
    .join('')

    
    res.status(200).json({ response: grokResponse });

  } catch (error) {
    console.error('Error in analyze API:', error);
    res.status(500).json({ 
      error: 'Failed to analyze routine',
      details: error.message 
    });
  }
}