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

    let finalInput = []

    if (Array.isArray(content)) {
      finalInput = content.map(item => {
        if (item.type === "text") {
          return { role: "user", content: item.text }
        } else if (item.type === "image_url") {
          return { role: "user", content: `[Imagem Anexada: ${item.image_url.url.substring(0, 100)}...]` }
        }
        return { role: "user", content: String(item) }
      })
    } else {
      finalInput = [{ role: "user", content: String(content) }]
    }



    const response = await fetch("https://api.x.ai/v1/responses", {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.key}`
      },

      body: JSON.stringify({
      model: "grok-4.3",
      input: finalInput,
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

const messageBlock = data.output?.find(block => block.type === 'message')

    const grokResponse = messageBlock?.content
    ? messageBlock.content.map(c => c.text).join('')
    :'';

    if(!grokResponse) {
      throw new Error(' A API retornou um resposta vazia')
    }


    
    res.status(200).json({ response: grokResponse });

  } catch (error) {
    console.error('Error in analyze API:', error);
    res.status(500).json({ 
      error: 'Failed to analyze routine',
      details: error.message 
    });
  }
}