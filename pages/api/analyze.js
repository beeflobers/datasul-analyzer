// pages/api/analyze.js

import { Store } from "lucide-react";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input } = req.body;
    const rawContent = input?.[0]?.content;

    if (!rawContent || (Array.isArray(rawContent) && rawContent.length === 0)) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // 1. Localiza o texto do prompt enviado pelo front
    const textObj = rawContent.find(item => item.type === "input_text" || item.type === "text");
    const textPrompt = textObj ? (textObj.text || textObj.content) : "";

    // 2. Filtra todas as imagens enviadas pelo front
    const imageObjs = rawContent.filter(item => item.type === "input_image" || item.type === "image_url");

    // 3. Monta a lista de anexos (imagens) no padrão aceito pelo xAI
    let attachmentsList = [];
    imageObjs.forEach(img => {
      const base64Url = img.image_url?.url;
      if (base64Url) {
        attachmentsList.push({
          type: "image",
          image_url: {
            url: base64Url 
          }
        });
      }
    });

    // 4. Une texto e imagens em um único bloco de usuário (Essencial para multimodalidade)
    let finalInput = [
      {
        role: "user",
        content: textPrompt, 
        ...(attachmentsList.length > 0 && { attachments: attachmentsList }) 
      }
    ];

    // 5. Faz a chamada ao endpoint v1/responses para manter a Busca Web ativa
    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.key}`
      },
      body: JSON.stringify({
        model: "grok-4.3",
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
    console.log("xAI response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Erro detalhado retornado da xAI:", JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || JSON.stringify(data) || 'Erro na API do Grok');
    }

    // 6. Extração segura da resposta de texto que o Grok devolveu
    const messageBlock = data.output?.find(block => block.type === 'message');
    const grokResponse = messageBlock?.content
      ? messageBlock.content.map(c => c.text).join('')
      : '';

    if (!grokResponse) {
      throw new Error('A API retornou uma resposta vazia.');
    }

    // 7. Retorna a resposta final formatada para o seu hook frontend
    res.status(200).json({ response: grokResponse });

  } catch (error) {
    console.error('Error in analyze API:', error);
    res.status(500).json({ 
      error: 'Failed to analyze routine',
      details: error.message 
    });
  }
}