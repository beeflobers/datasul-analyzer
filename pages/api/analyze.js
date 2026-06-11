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

let attachmentsList = [];
    imageObjs.forEach(img => {
      let base64Url = img.image_url?.url;
      if (base64Url) {
        if(base64Url.includes(',')) {
           base64Url = base64Url.split(',') [1]
        }
        attachmentsList.push({
          type: "image",
          image_url: {
            url: base64Url 
          }
        });
      }
    });
   
    let finalInput = [
      {
        role: "user",
        content: textPrompt, 
        ...(attachmentsList.length > 0 && { attachments: attachmentsList }) 
      }
    ];

    imageObjs.forEach(img => {
      let base64Url = img.image_url?.url;
      if (base64Url) {
        finalInput.push({
          role: "user",
          content: "", 
          attachments: [
            {
              type: "image",
              image_url: {
                url: base64Url 
              }
            }
          ]
        });
      }
    });

    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.key}`
      },
      body: JSON.stringify({
        model: "grok-4",
        input: finalInput, 
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
      const apiErrorMessage = data.error?.message || data.error || JSON.stringify(data);
      console.error("Erro retornado da xAI:", apiErrorMessage);
      throw new Error(apiErrorMessage);
    }

   
    const messageBlock = data.output?.find(block => block.type === 'message');
    const grokResponse = messageBlock?.content
      ? messageBlock.content.map(c => c.text).join('')
      : '';

    if (!grokResponse) {
      throw new Error('Não foi possível extrair o texto de resposta da API.');
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