import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = "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";

// List of models to try in order
const MODELS = [
  "nex-agi/deepseek-v3.1-nex-n1:free",
  "mistralai/devstral-2512:free",
  "qwen/qwen-2-7b-instruct:free"
];

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    console.log("Sending request to OpenRouter...");
    console.log("Message:", message);
    
    // Try each model until one works
    for (const model of MODELS) {
      console.log(`Trying model: ${model}`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Medical AI Assistant"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a helpful medical AI assistant. Provide informative responses about symptoms and health concerns. Always remind users to consult with a healthcare professional for proper diagnosis and treatment."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      console.log(`Response status for ${model}:`, response.status);
      
      const data = await response.json();
      
      if (response.ok && data.choices && data.choices.length > 0) {
        const reply = data.choices[0]?.message?.content;
        
        if (reply) {
          console.log(`Success with model: ${model}`);
          console.log("Reply:", reply.substring(0, 100) + "...");
          return res.json({ reply, model });
        }
      } else {
        console.log(`Failed with ${model}:`, data.error?.message || "Unknown error");
      }
    }
    
    // If all models failed
    return res.status(503).json({ 
      error: "All models are currently unavailable. Please try again later.",
      details: "Rate limited on all free models"
    });

  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Will try models in order: ${MODELS.join(", ")}`);
});
