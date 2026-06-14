import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize server-side Gemini AI safely.
  // Note: we use pre-installed @google/genai SDK strictly compliant with modern standards.
  const aiApiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: aiApiKey || "MOCK_API_KEY", // fallback to prevent app crashing before key is provided
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Endpoint: automated tips and goals suggestions powered by server-side Gemini
  app.post("/api/ai/suggestions", async (req, res) => {
    if (!aiApiKey) {
      // Return beautiful mock responses so the user experience remains fully interactive in the demo
      // if they haven't set up secrets yet, while alerting gracefully in the console.
      console.warn("GEMINI_API_KEY is not defined. Falling back to structured default suggestions.");
      return res.json({
        dailyTips: [
          "Try setting your air conditioner to 25°C (77°F). Every degree warmer saves about 6% on cooling energy!",
          "Consider carpooling or using transit for your next commute to save on average 3.2 kg of CO2 emissions.",
          "Avoid single-use plastic waste today. Plastic production accounts for significant industrial carbon emissions."
        ],
        goalStrategies: [
          "To complete your active goal, look for local grocery stores within walking distance or bundle errands into one car trip.",
          "Reduce stand-by energy. Turning off computer screens and power-strips at night is highly effective to reach your energy-reduction goal."
        ],
        coachingStatement: "You are doing an exceptional job! Your active habit logs show consistent commitment. Keep pushing towards your target milestone to maximize your peer leaderboard rank and lead the community!"
      });
    }

    try {
      const { userProfile, activeGoals, completedHabits, impactLogs } = req.body;

      const prompt = `
You are an expert personalized sustainability and carbon footprint coach.
Analyze the user's data and provide actionable, highly motivational, and automated suggestions for reducing their carbon emissions, achieving their active goals, and maintaining sustainable habits.

User Current Stats:
- Display Name: ${userProfile?.displayName || 'Eco Warrior'}
- Points: ${userProfile?.points || 0} (Level ${userProfile?.level || 1})
- Total carbon offset: ${userProfile?.totalOffset || 0} kg CO2

Active Goals:
${(activeGoals || []).map((g: any) => `- "${g.title}": Target: ${g.targetValue} ${g.unit}, Current Progress: ${g.currentValue} ${g.unit} (Category: ${g.category})`).join("\n") || 'None current'}

Recently Completed Habits:
${(completedHabits || []).map((h: any) => `- ${h.habitTitle} (${h.category}) saving ${h.carbonSaved} kg CO2`).join("\n") || 'None recorded yet'}

Recent Environmental Impact Activity Logs:
${(impactLogs || []).map((l: any) => `- Category: ${l.activityType}, Quantity: ${l.quantity} ${l.unit}, CO2 Reduction: ${l.carbonSaved} kg CO2`).join("\n") || 'None logged yet'}

Provide a JSON response containing:
1. "dailyTips": An array of precisely 3 short, specific, highly actionable daily tips tailored to their current profile.
2. "goalStrategies": An array of precisely 2 creative strategies focused on helping them complete their active goals soon.
3. "coachingStatement": A personal, supportive coaching message (2-3 sentences) praising their performance and spurring them on.

Make sure suggestions are highly specific to what is listed above and easy for an average person to carry out.
Verify that you return strictly JSON. Do not wrap in formatting blocks like \`\`\`json unless strictly desired by JSON parsers.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              dailyTips: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              goalStrategies: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              coachingStatement: { type: "STRING" }
            },
            required: ["dailyTips", "goalStrategies", "coachingStatement"]
          }
        }
      });

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Gemini API Error in suggestions:", error);
      res.status(500).json({ error: "Failed to load automated AI suggestions", details: error.message });
    }
  });

  // Serve static assets correctly using Vite middleware or production paths
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server start error:", error);
});
