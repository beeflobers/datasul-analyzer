// pages/api/analyze.js
import OpenAI from "openai";
import { Input } from "postcss";

const client = new OpenAI({
  baseURL: "https://api.x.ai/v1/responses",
  apiKey: process.env.key,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, content } = req.body;

    if (!prompt && !content) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await fetch("https://api.x.ai/v1/responses", {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.key}`
      },

      body: JSON.stringify({
      model: "grok-4-0709",
      input: [
        {
          role: "user",
          content: content || prompt
        }
      ], 
      tools: [
        {
          type:"web_search"
        }
      ],
      temperature: 0.4,
      max_completion_tokens: 4000
    })
    });

    const data = await response.json()

    if (!response.ok) {
  throw new Error(data.error?.message || 'Erro na API do Grok');
}



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