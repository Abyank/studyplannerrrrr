import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const MODEL = "google/gemma-2-2b-it";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false });

  const { type, prompt } = req.body;
  if (!prompt) return res.json({ success: false, error: "Missing prompt" });

  try {
    const hf = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const out = await hf.json();
    const text = out[0]?.generated_text || "(no response)";

    if (type === "flashcards") {
      const parsed = text.split("\n").filter(Boolean).slice(0, 12).map(line => {
        const parts = line.split(":");
        return { q: parts[0] || "Question", a: parts[1] || "Answer" };
      });
      return res.json({ success: true, data: parsed });
    }

    if (type === "quiz") {
      const lines = text.split("\n").filter(Boolean);
      const quiz = lines.slice(0, 10).map((l, i) => ({
        q: l,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: 0
      }));
      return res.json({ success: true, data: quiz });
    }

    if (type === "chat") {
      return res.json({ success: true, data: text });
    }

    res.json({ success: false, error: "Unknown type" });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
}
