const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Railway env variable se

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // index.html serve karega

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Root pe direct chat khulega
});

app.post('/chat', async (req, res) => {
    // Same chat code as before (no change needed)
    const { messages, model, temperature, max_tokens } = req.body;
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'system', content: 'You are a highly intelligent, helpful, and professional AI assistant.' }, ...messages],
                model: model || 'llama-3.1-8b-instant',
                temperature: temperature || 0.7,
                max_tokens: max_tokens || 4096,
                stream: true
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: errText });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of response.body) {
            res.write(chunk);
        }
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
