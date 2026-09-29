const SYSTEM_PROMPT = `You are the NearBee assistant. NearBee is a local services marketplace where
customers find trusted local providers (plumbers, electricians, tutors, etc.) and book them directly.
Help users find providers, understand how bookings work, and answer general questions about the platform.
Keep answers short and friendly. If you don't know something specific to their account, tell them to
check "My Bookings" or "My Profile" in the app.`;

const sendMessage = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return res.status(502).json({ message: "Chat service is unavailable right now" });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage };
