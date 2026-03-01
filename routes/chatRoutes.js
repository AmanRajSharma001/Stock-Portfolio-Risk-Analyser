import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();
const LYZR_API_KEY = process.env.LYZR_API_KEY || 'sk-default-m9cMRZXPRyCcPZKTVcvB0CddiDX98ltf';

router.post('/', async (req, res) => {
    try {
        const { message, history, image } = req.body;

        if (!message && !image) {
            return res.status(400).json({ success: false, message: "No message or image provided." });
        }

        // Check if the user is asking for real-time information
        const isSearchIntent = /(news|price|current|today|latest|search|value of|how much is)/i.test(message);
        let searchContext = "";

        if (isSearchIntent) {
            try {
                // Perform a headless scrape of DuckDuckGo HTML for instant answers
                const searchRes = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(message)}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                    }
                });
                const $ = cheerio.load(searchRes.data);
                const snippets = [];
                $('.result__snippet').each((i, el) => {
                    if (i < 3) snippets.push($(el).text().trim());
                });

                if (snippets.length > 0) {
                    searchContext = `[REAL-TIME WEB SEARCH CAPABILITY ENGAGED]\nHere is the latest live data from the internet regarding the user's query:\n${snippets.join('\n')}\n\nUse this exact realtime data to confidently answer the user's question as if you fetched it yourself.\n\n`;
                }
            } catch (e) {
                console.warn("Silent background search failed:", e.message);
            }
        }

        // Intercept Image Generation Requests
        const isImageGenIntent = /(draw|generate|create|make)\s+(an image|a picture|art|a photo|a logo)/i.test(message);
        if (isImageGenIntent) {
            // Strip out the command words to get the pure prompt
            const cleanPrompt = message.replace(/(draw|generate|create|make)\s+(an image|a picture|art|a photo|a logo)\s*(of|about)?\s*/i, '').trim();
            const finalPrompt = cleanPrompt || "A generic abstract financial market visualization";
            const encodedPrompt = encodeURIComponent(finalPrompt);

            // Generate a direct Pollinations AI markdown image string
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
            const markdownImage = `![Generated Image](${imageUrl})`;

            return res.json({
                success: true,
                data: {
                    reply: `Here is the image you requested:\n\n${markdownImage}` // The frontend will parse this MD structure into an actual HTML Image
                }
            });
        }

        let imageContext = "";
        if (image) {
            imageContext = `\n\n[SYSTEM NOTICE: The user has attached an image to this message. You cannot "see" it flawlessly yet, but you must acknowledge they sent it and make assumptions based on their text if they refer to 'this chart' or 'this image'.]`;
        }

        let prompt = `System Command: You are an elite quantitative AI assistant operating in the year 2026. You must answer ANY question. You MUST reply in the exact language the user used to ask the question. Every analysis and numerical assumption you provide must explicitly assume the current date is March 2026.
CRITICAL CAPABILITY - CHART RENDERING: If the user asks for a chart, graph, or visual data representation (like a pie chart of a portfolio, a bar chart of revenues, or a line graph), you MUST append a valid JSON block at the very end of your message. 
The JSON block MUST strictly match this format exactly, starting with \`\`\`json and ending with \`\`\`:
\`\`\`json
{
  "type": "CHART",
  "chartType": "bar", // can be "bar", "line", or "pie"
  "title": "Chart Title Here",
  "data": [
    {"name": "Label1", "value": 100},
    {"name": "Label2", "value": 200}
  ]
}
\`\`\`
\n\n${searchContext}${imageContext}`;
        if (history && history.length > 0) {
            const historyContext = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
            prompt += `Previous conversation context:\n${historyContext}\n\n`;
        }
        prompt += `USER: ${message}`;

        const payload = {
            "user_id": "sankajash@gmail.com",
            "agent_id": "6914c2b3805206bbcf61c802",
            "session_id": "6914c2b3805206bbcf61c802-xvuf7436kms",
            "message": prompt
        };

        const response = await axios.post('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': LYZR_API_KEY
            }
        });

        // The Lyzr API typically returns `{ response: "..." }` or similar in its JSON, we need to extract it safely
        const replyText = response.data.response || response.data.message || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data));

        res.json({
            success: true,
            data: {
                reply: replyText
            }
        });

    } catch (e) {
        console.error("Chat API Error:", e.response?.data || e.message);
        res.status(500).json({ success: false, message: "Error contacting Lyzr AI engine. " + (e.message || "") });
    }
});

export default router;
