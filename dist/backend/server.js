import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Sentiment from 'sentiment';

dotenv.config();

const app = express();
const PORT = 3001;

// Updated API key
const OPENROUTER_API_KEY = "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";

app.use(cors());
app.use(express.json());

const sentiment = new Sentiment();
const conversations = new Map();
const userTasks = new Map();
const dashboardMetrics = new Map();

// Free models list - DeepSeek first
const FREE_MODELS = [
  "deepseek/deepseek-chat",           // DeepSeek - FREE (first choice)
  "meta-llama/llama-3.2-3b-instruct", // Llama 3.2 3B
  "meta-llama/llama-3.1-8b-instruct", // Llama 3.1 8B
  "google/gemini-flash-1.5",          // Gemini Flash
  "mistralai/mistral-7b-instruct",    // Mistral 7B
  "nousresearch/hermes-3-llama-3.1-405b", // Hermes 405B (free tier)
];

// Persona-based system prompts
function getSystemPrompt(personaId, primaryChallenge) {
  const prompts = {
    'The Overthinker': `You are a supportive mental wellbeing companion specializing in anxiety and overthinking. The user tends to worry and feel on edge, with racing thoughts and worst-case scenarios.

Your approach:
- Validate their feelings without amplifying worry
- Use calming language and gentle redirection
- Suggest grounding techniques (5-4-3-2-1, box breathing)
- Help them challenge catastrophic thoughts
- Keep responses brief (2-4 sentences), warm, and non-judgmental
- Encourage small, manageable steps

Remember: You're not a therapist. If they mention crisis/self-harm, gently suggest professional help.`,

    'The Heavy Heart': `You are a supportive mental wellbeing companion specializing in low mood and motivation. The user is experiencing sadness, lack of interest, and reduced energy.

Your approach:
- Offer empathy and emotional validation
- Help them reconnect with small joys
- Suggest gentle behavioral activation (tiny achievable tasks)
- Normalize their experience without toxic positivity
- Keep responses brief (2-4 sentences), compassionate, and hopeful
- Celebrate any small steps forward

Remember: You're not a therapist. If they mention crisis/self-harm, gently suggest professional help.`,

    'The Exhausted Achiever': `You are a supportive mental wellbeing companion specializing in burnout and exhaustion. The user is running on empty from constant demands and feels drained.

Your approach:
- Validate their exhaustion as real and important
- Help them recognize rest is productive, not lazy
- Suggest boundary-setting and energy management
- Encourage self-compassion and saying "no"
- Keep responses brief (2-4 sentences), gentle, and permission-giving
- Help them prioritize recovery over productivity

Remember: You're not a therapist. If they mention crisis/self-harm, gently suggest professional help.`,

    'The Scattered Mind': `You are a supportive mental wellbeing companion specializing in focus and organization challenges. The user struggles with concentration, starting tasks, and follow-through.

Your approach:
- Normalize their experience (it's common and manageable)
- Break tasks into tiny, concrete steps
- Suggest structure and external reminders
- Use encouraging, action-oriented language
- Keep responses brief (2-4 sentences), clear, and practical
- Celebrate effort, not just completion

Remember: You're not a therapist. If they mention crisis/self-harm, gently suggest professional help.`
  };

  return prompts[personaId] || `You are a supportive mental wellbeing companion. Be empathetic, non-judgmental, and helpful. Keep responses brief and conversational (2-4 sentences). Focus on ${primaryChallenge.replace('_', ' ')}. You're not a therapist - if someone mentions crisis/self-harm, gently suggest professional help.`;
}

// Generate realistic fake historical data
function generateFakeHistoricalData(conversationId, days = 30) {
  const metrics = [];
  const now = new Date();
  
  const patterns = {
    improving: { moodBase: 4, moodTrend: 0.1, energyBase: 4.5, resilienceBase: 5 },
    declining: { moodBase: 7, moodTrend: -0.08, energyBase: 7, resilienceBase: 6.5 },
    stable: { moodBase: 6.5, moodTrend: 0, energyBase: 6, resilienceBase: 6 },
    volatile: { moodBase: 5.5, moodTrend: 0, energyBase: 5.5, resilienceBase: 5.5 }
  };
  
  const pattern = patterns.improving;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const dayVariation = Math.sin(i / 7) * 1.5;
    const randomNoise = (Math.random() - 0.5) * 1.2;
    const daysTrend = (days - i) * pattern.moodTrend;
    
    const moodScore = Math.max(1, Math.min(10, 
      pattern.moodBase + daysTrend + dayVariation + randomNoise
    ));
    
    const energyScore = Math.max(1, Math.min(10,
      pattern.energyBase + daysTrend * 0.8 + dayVariation * 0.7 + randomNoise * 0.9
    ));
    
    const resilienceScore = Math.max(1, Math.min(10,
      pattern.resilienceBase + daysTrend * 0.6 + dayVariation * 0.5 + randomNoise * 0.8
    ));
    
    const insights = [];
    
    if (i % 7 === 0) {
      if (moodScore > 7) {
        insights.push({
          icon: '🌟',
          text: 'You\'ve been maintaining a positive mindset this week. Great work!',
          timestamp: date.toISOString()
        });
      } else if (moodScore < 4) {
        insights.push({
          icon: '🫂',
          text: 'This week seemed challenging. Remember to be kind to yourself.',
          timestamp: date.toISOString()
        });
      }
      
      if (energyScore < 4) {
        insights.push({
          icon: '💤',
          text: 'Your energy has been lower lately. Consider taking more breaks.',
          timestamp: date.toISOString()
        });
      }
      
      if (resilienceScore > 6.5) {
        insights.push({
          icon: '💪',
          text: 'You\'re showing strong resilience in facing challenges.',
          timestamp: date.toISOString()
        });
      }
    }
    
    metrics.push({
      moodScore: Math.round(moodScore * 10) / 10,
      energyScore: Math.round(energyScore * 10) / 10,
      resilienceScore: Math.round(resilienceScore * 10) / 10,
      insights: insights,
      timestamp: date.toISOString()
    });
  }
  
  return metrics;
}

// Initialize fake data
function initializeFakeData() {
  const conversationId = "main";
  
  if (!dashboardMetrics.has(conversationId)) {
    console.log('📊 Generating 30 days of fake historical data...');
    const fakeMetrics = generateFakeHistoricalData(conversationId, 30);
    dashboardMetrics.set(conversationId, fakeMetrics);
    console.log(`✅ Generated ${fakeMetrics.length} data points`);
    
    const initialTasks = [
      {
        id: 'task-1',
        title: '5-Minute Breathing Exercise for Anxiety Relief',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=odADwWzHR24',
        completed: true,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-2',
        title: 'Understanding Burnout: Signs and Solutions',
        type: 'article',
        url: 'https://www.healthline.com/health/tips-for-identifying-and-preventing-burnout',
        completed: true,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-3',
        title: 'Guided Meditation for Better Sleep',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=aEqlQvczMJQ',
        completed: false
      },
      {
        id: 'task-4',
        title: 'Cognitive Behavioral Therapy (CBT) Basics',
        type: 'article',
        url: 'https://www.verywellmind.com/what-is-cognitive-behavior-therapy-2795747',
        completed: false
      },
      {
        id: 'task-5',
        title: '10-Minute Morning Routine for Mental Clarity',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=we9_CdNPuJg',
        completed: false
      },
      {
        id: 'task-6',
        title: 'Building Resilience: A Practical Guide',
        type: 'article',
        url: 'https://www.apa.org/topics/resilience',
        completed: true,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-7',
        title: 'Yoga for Stress Relief - 15 Minutes',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=VaoV1PrYft4',
        completed: false
      },
      {
        id: 'task-8',
        title: 'Mindfulness Techniques for Daily Life',
        type: 'article',
        url: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
        completed: false
      }
    ];
    
    userTasks.set(conversationId, initialTasks);
    console.log(`✅ Generated ${initialTasks.length} initial tasks (${initialTasks.filter(t => t.completed).length} completed)`);
  }
}

initializeFakeData();

// Analyze conversation sentiment
function analyzeConversation(message, reply) {
  const userSentiment = sentiment.analyze(message);
  const aiSentiment = sentiment.analyze(reply);
  
  const moodScore = Math.max(0, Math.min(10, 5 + (userSentiment.score * 0.5)));
  
  const wordCount = message.split(' ').length;
  const energyScore = Math.max(0, Math.min(10, 
    5 + (wordCount > 20 ? 2 : wordCount > 10 ? 1 : -1) + (userSentiment.score > 0 ? 1.5 : -0.5)
  ));
  
  const challengeWords = ['difficult', 'hard', 'struggle', 'try', 'but', 'however', 'tough', 'challenging'];
  const resilienceWords = ['can', 'will', 'able', 'manage', 'handle', 'overcome'];
  const messageLower = message.toLowerCase();
  
  const challengeCount = challengeWords.filter(word => messageLower.includes(word)).length;
  const resilienceCount = resilienceWords.filter(word => messageLower.includes(word)).length;
  const resilienceScore = Math.max(0, Math.min(10, 5 + resilienceCount - (challengeCount * 0.3)));
  
  const insights = [];
  
  if (moodScore > 7) {
    insights.push({
      icon: '🌟',
      text: 'You seem to be in a positive mindset. Keep nurturing this feeling!',
      timestamp: new Date().toISOString()
    });
  } else if (moodScore < 4) {
    insights.push({
      icon: '🫂',
      text: 'You might be going through a difficult time. Remember, it\'s okay to take things one step at a time.',
      timestamp: new Date().toISOString()
    });
  }
  
  if (energyScore < 4) {
    insights.push({
      icon: '💤',
      text: 'Your energy seems low. Consider taking small breaks and being gentle with yourself.',
      timestamp: new Date().toISOString()
    });
  }
  
  if (resilienceScore > 6) {
    insights.push({
      icon: '💪',
      text: 'You\'re showing resilience by continuing to engage. That takes strength!',
      timestamp: new Date().toISOString()
    });
  }
  
  return {
    moodScore: Math.round(moodScore * 10) / 10,
    energyScore: Math.round(energyScore * 10) / 10,
    resilienceScore: Math.round(resilienceScore * 10) / 10,
    insights: insights,
    timestamp: new Date().toISOString()
  };
}

// Generate tasks based on user profile
function generateTasks(userProfile, conversation) {
  const taskDatabase = {
    anxiety: [
      { title: '5-Minute Box Breathing Exercise', type: 'video', url: 'https://www.youtube.com/watch?v=tEmt1Znux58' },
      { title: 'Grounding Techniques for Anxiety', type: 'article', url: 'https://www.healthline.com/health/grounding-techniques' },
      { title: 'Progressive Muscle Relaxation Guide', type: 'video', url: 'https://www.youtube.com/watch?v=ihO02wUzgkc' },
      { title: 'Understanding Panic Attacks', type: 'article', url: 'https://www.verywellmind.com/what-is-a-panic-attack-2583967' }
    ],
    low_mood: [
      { title: 'Gentle Yoga for Depression', type: 'video', url: 'https://www.youtube.com/watch?v=VaoV1PrYft4' },
      { title: 'Behavioral Activation Strategies', type: 'article', url: 'https://www.apa.org/depression-guideline/behavioral-activation' },
      { title: 'Uplifting Music Therapy Session', type: 'video', url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4' },
      { title: 'Self-Compassion Practices', type: 'article', url: 'https://self-compassion.org/the-three-elements-of-self-compassion-2/' }
    ],
    burnout: [
      { title: 'Setting Healthy Boundaries', type: 'article', url: 'https://www.psychologytoday.com/us/basics/boundaries' },
      { title: '10-Minute Restorative Yoga', type: 'video', url: 'https://www.youtube.com/watch?v=x5lKMQ7TdSk' },
      { title: 'Overcoming Burnout: A Guide', type: 'article', url: 'https://www.helpguide.org/articles/stress/burnout-prevention-and-recovery.htm' },
      { title: 'Energy Management Techniques', type: 'video', url: 'https://www.youtube.com/watch?v=FS1IayMLduM' }
    ],
    focus_difficulties: [
      { title: 'Pomodoro Technique Explained', type: 'video', url: 'https://www.youtube.com/watch?v=VFW3Ld7JO0w' },
      { title: 'ADHD-Friendly Organization Tips', type: 'article', url: 'https://add.org/adhd-organization-tips/' },
      { title: 'Brain Focus Music - 2 Hours', type: 'video', url: 'https://www.youtube.com/watch?v=WPni755-Krg' },
      { title: 'Time Management Strategies', type: 'article', url: 'https://www.mindtools.com/pages/main/newMN_HTE.htm' }
    ]
  };

  if (!userProfile || !userProfile.primaryChallenge) {
    return [];
  }

  const relevantTasks = taskDatabase[userProfile.primaryChallenge] || [];
  const selectedTasks = relevantTasks.slice(0, 2).map((task, index) => ({
    id: `task-${Date.now()}-${index}`,
    ...task,
    completed: false
  }));

  return selectedTasks;
}

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message, userId, conversationId, userProfile } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const convId = conversationId || userId || "main";
    
    if (!conversations.has(convId)) {
      let systemPrompt = "You are a supportive mental wellbeing companion. Be empathetic, non-judgmental, and helpful. Keep responses brief and conversational (2-4 sentences).";
      
      if (userProfile?.personaId && userProfile?.primaryChallenge) {
        systemPrompt = getSystemPrompt(userProfile.personaId, userProfile.primaryChallenge);
      }
      
      conversations.set(convId, [
        { role: "system", content: systemPrompt }
      ]);
    }

    const history = conversations.get(convId);
    history.push({ role: "user", content: message });

    console.log(`\n💬 Chat ${convId}`);
    if (userProfile) {
      console.log(`👤 Persona: ${userProfile.personaId} (${userProfile.primaryChallenge})`);
    }
    console.log(`User: ${message}`);
    
    const failedModels = [];
    
    for (const model of FREE_MODELS) {
      console.log(`🔄 Trying: ${model}`);
      
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "Mental Wellbeing Companion"
          },
          body: JSON.stringify({
            model: model,
            messages: history,
            max_tokens: 400,
            temperature: 0.8
          })
        });

        const data = await response.json();
        
        if (response.ok && data.choices?.[0]?.message?.content) {
          const reply = data.choices[0].message.content;
          history.push({ role: "assistant", content: reply });
          
          const analysis = analyzeConversation(message, reply);
          
          if (!dashboardMetrics.has(convId)) {
            dashboardMetrics.set(convId, []);
          }
          const metrics = dashboardMetrics.get(convId);
          metrics.push(analysis);
          if (metrics.length > 50) {
            metrics.shift();
          }
          
          const tasks = generateTasks(userProfile, { message, reply });
          
          if (!userTasks.has(convId)) {
            userTasks.set(convId, []);
          }
          const existingTasks = userTasks.get(convId);
          userTasks.set(convId, [...existingTasks, ...tasks]);
          
          console.log(`✅ Success with ${model}!`);
          console.log(`📊 Metrics: Mood=${analysis.moodScore}, Energy=${analysis.energyScore}, Resilience=${analysis.resilienceScore}`);
          console.log(`📝 Generated ${tasks.length} new tasks`);
          
          return res.json({ 
            reply, 
            model,
            conversationId: convId,
            personaId: userProfile?.personaId,
            primaryChallenge: userProfile?.primaryChallenge,
            dashboardMetrics: {
              moodScore: analysis.moodScore,
              energyScore: analysis.energyScore,
              resilienceScore: analysis.resilienceScore,
              insights: analysis.insights,
              timestamp: analysis.timestamp
            },
            newTasks: tasks
          });
        }
        
        const errorMsg = data.error?.message || data.error?.metadata?.raw || `Status ${response.status}`;
        console.log(`❌ ${model} failed: ${errorMsg}`);
        failedModels.push({ model, error: errorMsg });
        
      } catch (err) {
        console.log(`❌ ${model} error: ${err.message}`);
        failedModels.push({ model, error: err.message });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    history.pop();
    
    console.error(`\n❌ All ${FREE_MODELS.length} models failed!`);
    console.error('Failed models:', failedModels);
    
    return res.status(503).json({ 
      error: "All models temporarily unavailable",
      details: "All free models are currently rate-limited or unavailable.",
      suggestion: "Please try again in a few minutes",
      failedModels: failedModels
    });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard metrics
app.get("/dashboard/:conversationId", (req, res) => {
  const { conversationId } = req.params;
  const metrics = dashboardMetrics.get(conversationId) || [];
  const tasks = userTasks.get(conversationId) || [];
  
  console.log(`📊 Serving ${metrics.length} metrics for ${conversationId}`);
  
  res.json({ 
    metrics,
    tasks,
    summary: {
      totalInteractions: metrics.length,
      averageMood: metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.moodScore, 0) / metrics.length).toFixed(1) : 0,
      averageEnergy: metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.energyScore, 0) / metrics.length).toFixed(1) : 0,
      averageResilience: metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.resilienceScore, 0) / metrics.length).toFixed(1) : 0,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length
    }
  });
});

// Get user tasks
app.get("/tasks/:conversationId", (req, res) => {
  const { conversationId } = req.params;
  const tasks = userTasks.get(conversationId) || [];
  console.log(`📋 Serving ${tasks.length} tasks for ${conversationId}`);
  res.json({ tasks });
});

// Mark task as completed
app.post("/tasks/:conversationId/complete", (req, res) => {
  const { conversationId } = req.params;
  const { taskId } = req.body;
  
  const tasks = userTasks.get(conversationId) || [];
  const task = tasks.find(t => t.id === taskId);
  
  if (task) {
    task.completed = true;
    task.completedAt = new Date().toISOString();
    console.log(`✅ Task completed: ${task.title}`);
    res.json({ success: true, task });
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Using API key: ${OPENROUTER_API_KEY.substring(0, 20)}...`);
  console.log(`🤖 Primary model: ${FREE_MODELS[0]} (DeepSeek)`);
  console.log(`🔄 Fallback models: ${FREE_MODELS.length - 1} available\n`);
});
