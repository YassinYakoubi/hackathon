import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = "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";

// List of free models to try in order
const FREE_MODELS = [
  "allenai/olmo-3-32b-think:free",
  "qwen/qwen-2-7b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "mistralai/mistral-7b-instruct:free"
];

// Store conversation history (in production, use a database)
const conversations = new Map();

app.post("/chat", async (req, res) => {
  try {
    const { message, conversationId = "default" } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    // Get or create conversation history
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, [
        {
          role: "system",
          content: "You are a helpful medical AI assistant. Provide informative responses about symptoms and health concerns. Always remind users to consult with a healthcare professional for proper diagnosis and treatment."
        }
      ]);
    }

    const history = conversations.get(conversationId);
    
    // Add user message to history
    history.push({ role: "user", content: message });

    console.log(`\n💬 Conversation ${conversationId} - Message ${history.length - 1}`);
    console.log("User:", message);
    
    let lastError = null;
    
    // Try each model until one works
    for (const model of FREE_MODELS) {
      console.log(`\n🔄 Trying model: ${model}`);
      
      try {
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
            messages: history, // Send full conversation history
            max_tokens: 1000
          })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices.length > 0) {
          const reply = data.choices[0]?.message?.content;
          
          if (reply) {
            // Add assistant response to history
            history.push({ role: "assistant", content: reply });
            
            console.log(`✅ Success with ${model}!`);
            console.log("Assistant:", reply.substring(0, 100) + "...");
            
            return res.json({ 
              reply, 
              model,
              conversationId,
              messageCount: history.length - 1 // Exclude system message
            });
          }
        } else if (response.status === 429) {
          console.log(`⏭️  ${model} is rate-limited, trying next...`);
          lastError = data;
        } else {
          console.log(`❌ ${model} failed:`, data.error?.message);
          lastError = data;
        }
      } catch (err) {
        console.log(`❌ ${model} error:`, err.message);
        lastError = err;
      }
    }
    
    // If all models failed, remove the user message from history
    history.pop();
    
    console.error("❌ All models failed");
    return res.status(503).json({ 
      error: "All free models are currently rate-limited or unavailable",
      suggestion: "Please wait a few minutes and try again",
      lastError: lastError
    });

  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Clear conversation endpoint
app.post("/clear", (req, res) => {
  const { conversationId = "default" } = req.body;
  conversations.delete(conversationId);
  console.log(`🗑️  Cleared conversation: ${conversationId}`);
  res.json({ success: true, message: "Conversation cleared" });
});

// Get conversation history endpoint
app.get("/history/:conversationId?", (req, res) => {
  const conversationId = req.params.conversationId || "default";
  const history = conversations.get(conversationId) || [];
  res.json({ conversationId, messages: history });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Using API key: ${OPENROUTER_API_KEY.substring(0, 20)}...`);
  console.log(`🤖 Will try these models in order:`);
  FREE_MODELS.forEach((model, i) => console.log(`   ${i + 1}. ${model}`));
  console.log(`\n📝 Endpoints:`);
  console.log(`   POST /chat - Send message`);
  console.log(`   POST /clear - Clear conversation`);
  console.log(`   GET /history/:id - Get conversation history`);
});
