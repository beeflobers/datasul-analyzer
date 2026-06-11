// pages/api/analyze.js

import { Store } from "lucide-react";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input } = req.body;
    const rawContent = input?.[0]?.content

     if (!rawContent || (Array.isArray(rawContent) && rawContent.length === 0)) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let formattedContent = []

    if (Array.isArray(rawContent)) {
      formattedContent = rawContent.map(item => {
        if (item.type === "text") {
          return { type: "input_text", text: item.text};
        } else if (item.type === "image_url") {
          return { type: "input_image", image_url: item.image_url };
        }
        return [{type: "input_text", text: String(item) }];
      })

    } else {
      formattedContent = [{ type: "text", text: String(rawContent) }];
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
         content:formattedContent
        }
      ],
      tools: [
        {
          type:"web_search"
        }
      ],
      temperature: 0.4,
      max_output_tokens: 4000,
      Store: false
    })
    });

    const data = await response.json()

const messageBlock = data.output?.find(block => block.type === 'message')

    const grokResponse = messageBlock?.content
    ? messageBlock.content.map(c => c.text).join('')
    :'';



console.log("xAI status:", response.status);
console.log("xAI response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(JSON.stringify(data)|| 'Erro na API do Grok')}



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