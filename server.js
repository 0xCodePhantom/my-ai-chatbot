const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = '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'; // REPLACE WITH YOUR REAL GROQ API KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serves index.html

app.post('/chat', async (req, res) => {
    const { messages, model, temperature, max_tokens } = req.body;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'system', content: 'You are a helpful, professional AI assistant. Respond concisely and accurately.' }, ...messages],
                model: model || 'llama-3.1-8b-instant', // Fastest default (active as of Dec 2025)
                temperature: temperature || 0.7,
                max_tokens: max_tokens || 1024,
                stream: true
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Groq Error:', response.status, errText);
            return res.status(response.status).json({ error: errText });
        }

        // Streaming headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Reliable chunk-by-chunk streaming
        for await (const chunk of response.body) {
            res.write(chunk);
        }

        res.end();
    } catch (error) {
        console.error('Server Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/index.html to chat`);
});