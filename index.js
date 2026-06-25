import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve static paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, 'public');

// Middlewares setup
app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

// Active configuration keys
let activeGeminiKey = process.env.GEMINI_API_KEY || "";
let activeGroqKey = process.env.GROQ_API_KEY || "";

// Re-instantiable clients
let aiClient = null;
let groqClient = null;

function initializeClients() {
  if (activeGeminiKey) {
    aiClient = new GoogleGenAI({ apiKey: activeGeminiKey });
  }
  if (activeGroqKey) {
    groqClient = new Groq({ apiKey: activeGroqKey });
  }
}

// Boot up clients
initializeClients();

// Unified System Instruction
const SYSTEM_INSTRUCTION = "Kamu adalah C.A.K.R.A. (Cakrawala Analisis Kebijakan & Risiko Aliran), sistem simulasi prediktif dan analis makro tingkat lanjut. Pengguna akan memberikan skenario peristiwa, kebijakan, atau tren. Tugasmu menjalankan simulasi masa depan dan memprediksi efek dominonya secara runtut. Berikan laporan dengan format: 1. EXECUTIVE SUMMARY, 2. MACRO-ECONOMIC IMPACT, 3. PUBLIC SENTIMENT & BEHAVIOR, 4. MICRO-BUSINESS & LOGISTICS, 5. CONCLUSION & STRATEGIC RECOMMENDATION. Gunakan nada bicara yang sangat analitis, objektif, teknis, dan futuristik layaknya AI berteknologi tinggi. Gunakan bahasa Indonesia dan Markdown. Pada baris paling akhir laporan (di dalam Bagian 5), Anda WAJIB menyertakan satu baris data kesimpulan dampak kuantitatif dengan format tepat berikut: [OUTLOOK: X% (STATUS)] di mana X adalah angka persentase dampak (0-100%) dan STATUS diisi dengan salah satu kata: BAIK (jika dampak dominan menguntungkan/stabil), BURUK (jika dampak dominan merugikan/krisis), atau NETRAL.";

/**
 * Chat Simulation Endpoint
 * Automatically routes through active API keys with a try-catch failover mechanism.
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ error: "Invalid payload: 'conversation' array is required." });
    }

    // Extract latest user message
    const lastTurn = conversation[conversation.length - 1];
    const latestMessage = lastTurn ? lastTurn.text : "";

    // Owner backdoor activation trigger
    const cleanMsg = latestMessage.trim().toLowerCase();
    if (cleanMsg === "muhammad latief saputra") {
      activeGeminiKey = process.env.GEMINI_API_KEY || "";
      activeGroqKey = process.env.GROQ_API_KEY || "";
      initializeClients();
      
      console.log("[SYSTEM] C.A.K.R.A. API keys dynamically restored via authorization.");
      return res.json({ 
        text: "### AKSES SISTEM DIBUKA\n\nKredensial API untuk **Muhammad Latief Saputra** berhasil dipulihkan secara otomatis. Jalur koneksi untuk sistem utama (GEMINI) dan sistem cadangan (GROQ) kini **ONLINE**. Silakan masukkan skenario simulasi Anda berikutnya.",
        engine: "system"
      });
    }

    // -------------------------------------------------------------------------
    // SYSTEM ROUTING AUTOMATIC FAILOVER
    // -------------------------------------------------------------------------
    
    // Attempt 1: Gemini (Primary Engine)
    if (activeGeminiKey && aiClient) {
      try {
        console.log("[SYSTEM] Processing request through primary engine (Gemini)...");
        
        // Map conversation logs to Gemini format
        const mappedHistory = conversation.map(item => {
          const role = item.role === 'model' || item.role === 'assistant' ? 'model' : 'user';
          return {
            role: role,
            parts: [{ text: item.text }]
          };
        });

        const historyLatestMessage = mappedHistory[mappedHistory.length - 1].parts[0].text;
        const history = mappedHistory.slice(0, -1);

        const chat = aiClient.chats.create({
          model: 'gemini-2.5-flash',
          history: history,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.6,
            topP: 0.9,
            topK: 40
          }
        });

        const response = await chat.sendMessage({ message: historyLatestMessage });
        
        // Return Gemini response
        return res.json({ 
          text: response.text, 
          engine: 'gemini' 
        });
      } catch (geminiError) {
        console.warn("[FAILOVER WARNING] Primary engine (Gemini) failed. Detail:", geminiError.message);
        console.log("[SYSTEM] Initiating failover fallback route...");
      }
    }

    // Attempt 2: Groq Llama (Backup Engine)
    if (activeGroqKey && groqClient) {
      try {
        console.log("[SYSTEM] Processing request through backup engine (Groq Llama)...");
        
        const messages = [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          ...conversation.map(item => ({
            role: item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user',
            content: item.text
          }))
        ];

        const completion = await groqClient.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.6,
          top_p: 0.9
        });

        const replyText = completion.choices[0]?.message?.content || "";
        
        // Return Groq response
        return res.json({ 
          text: replyText, 
          engine: 'groq' 
        });
      } catch (groqError) {
        console.error("[ERROR] Backup engine (Groq) also failed. Detail:", groqError.message);
      }
    }

    // Both engines failed or keys are not initialized
    throw new Error("Semua core kognitif gagal memproses simulasi. Pastikan API key terisi di file .env, atau ketik nama lengkap pemilik sistem 'Muhammad Latief Saputra' untuk mengaktifkan kunci darurat.");

  } catch (error) {
    console.error("[ERROR] C.A.K.R.A. Execution Failure:", error);
    res.status(500).json({ 
      error: error.message || "Simulasi gagal dikalkulasi akibat gangguan koneksi server."
    });
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`[SYSTEM ONLINE] C.A.K.R.A. Core server initialized on port ${PORT}`);
});
