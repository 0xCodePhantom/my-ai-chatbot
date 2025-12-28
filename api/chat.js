export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, botName } = req.body;

    try {
        // Use Groq API (Free)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are ${botName}, a helpful AI assistant. When greeted, introduce yourself as ${botName}. When asked about your name or identity, explain you are ${botName}. Provide detailed, accurate, and helpful responses.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        res.status(200).json({ response: aiResponse });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response' });
    }
}