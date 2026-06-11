// pages/api/analyze.js


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input } = req.body;
    const rawContent = input?.[0]?.content;

    if (!rawContent || !Array.isArray(rawContent)) {
      return res.status(400).json({ error: 'Content array is required' });
    }

   
    const textObj = rawContent.find(item => item.type === "input_text" || item.type === "text");
    const textPrompt = textObj ? (textObj.text || textObj.content) : "";

    const imageObjs = rawContent.filter(item => item.type === "input_image" || item.type === "image_url");

    
    let messagesContent = [];

   
    if (textPrompt) {
      messagesContent.push({ type: "text", text: textPrompt });
    }

    
    imageObjs.forEach(img => {
      const base64Url = img.image_url?.url;
      if (base64Url) {
        messagesContent.push({
          type: "image_url",
          image_url: {
            url: base64Url 
          }
        });
      }
    });

    
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.key}`
      },
      body: JSON.stringify({
        model: "grok-4", 
        messages: [
          {
            role: "user",
            content: messagesContent 
          }
        ],
        tools: [
          {
            type: "web_search" 
          }
        ],
        temperature: 0.4,
        max_output_tokens: 4000
      })
    });

    const data = await response.json();

    console.log("xAI status:", response.status);

    if (!response.ok) {
      console.error("Erro detalhado da API xAI:", JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || JSON.stringify(data));
    }

    
    const grokResponse = data.choices?.[0]?.message?.content || '';

    if (!grokResponse) {
      throw new Error('A API retornou uma resposta vazia.');
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