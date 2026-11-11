import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: 'SMART MOO4',
    village: 'บ้านหนองบัวคำมูลหมู่ที่ 4',
    time: new Date().toISOString()
  });
});

// Gemini AI Assistant Streaming Endpoint (ตอบกลับแบบ Streaming Real-Time)
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { prompt, villageContext } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ text: 'ขออภัยครับ ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในระบบ กรุณาตรวจสอบการตั้งค่า Secrets เพื่อเปิดใช้งาน AI ผู้ช่วยเต็มรูปแบบครับ' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `คุณคือ "น้องสมาร์ท ม.4" (SMART AI ASSISTANT) ผู้ช่วยดิจิทัลประจำหมู่บ้าน "บ้านหนองบัวคำมูล หมู่ที่ 4"
หน้าที่ของคุณคือตอบคำถามชาวบ้านและคณะกรรมการหมู่บ้านอย่างรวดเร็ว ตรงประเด็น สุภาพ นอบน้อม ชัดเจน กระชับ ไม่เยิ่นเย้อ

ข้อมูลสำคัญของหมู่บ้าน:
- ชื่อหมู่บ้าน: บ้านหนองบัวคำมูล หมู่ที่ 4
- ผู้ใหญ่บ้าน / ประธานกรรมการหมู่บ้าน: นายธนพล เสนบี้ (โทร 081-234-5678)

ข้อมูลปัจจุบันของหมู่บ้านดึงสดจากระบบฐานข้อมูล Cloud Firestore:
${JSON.stringify(villageContext || {}, null, 2)}

กฎการตอบแบบรวดเร็วและเรียลไทม์:
1. ตอบตรงคำถามทันที สั้นกระชับได้ใจความ ชัดเจน ไม่ต้องเกริ่นอารัมภบทยาว
2. ใช้ข้อมูลตามจริงจากฐานข้อมูล Firestore ข้างต้นเสมอ เช่น ผู้ใหญ่บ้านชื่อนายธนพล เสนบี้ (โทร 081-234-5678), คณะกรรมการ 15 ท่าน, ข่าวประกาศ, วันเวลากิจกรรม, รายการตลาดชุมชน, รายงานแจ้งเหตุ
3. หากไม่มีข้อมูลในระบบ ให้ตอบอย่างสุภาพสั้นๆ ว่า "ขณะนี้ยังไม่มีข้อมูลเรื่องนี้ในระบบฐานข้อมูลหมู่บ้านครับ" และแนะนำให้ติดต่อผู้ใหญ่บ้าน นายธนพล เสนบี้ หรือคณะกรรมการ
4. ภาษาไทยสุภาพ นอบน้อม มีหางเสียง (ครับ/ค่ะ)`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW
        }
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat/stream:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Streaming failed' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Gemini AI Assistant Standard endpoint (fallback)
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, villageContext } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        reply: 'ขออภัยครับ ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในระบบ กรุณาตรวจสอบการตั้งค่า Secrets เพื่อเปิดใช้งาน AI ผู้ช่วยเต็มรูปแบบครับ'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `คุณคือ "น้องสมาร์ท ม.4" (SMART AI ASSISTANT) ผู้ช่วยดิจิทัลอัจฉริยะคิดเร็วตอบไวประจำ "บ้านหนองบัวคำมูล หมู่ที่ 4"
ผู้ใหญ่บ้าน / ประธานกรรมการหมู่บ้านชื่อ: นายธนพล เสนบี้ (โทร 081-234-5678)

ข้อมูลปัจจุบันดึงสดจากระบบฐานข้อมูล Cloud Firestore:
${JSON.stringify(villageContext || {}, null, 2)}

กฎการตอบแบบรวดเร็ว:
1. ตอบตรงคำถามทันที สั้นกระชับได้ใจความ ชัดเจน ไม่ต้องเกริ่นยาว
2. ให้ข้อมูลตามฐานข้อมูลจริง เช่น ผู้ใหญ่บ้านชื่อนายธนพล เสนบี้ (โทร 081-234-5678)
3. หากไม่มีข้อมูลในระบบ ให้ตอบอย่างสุภาพสั้นๆ ว่า "ขณะนี้ยังไม่มีข้อมูลเรื่องนี้ในระบบฐานข้อมูลหมู่บ้านครับ" และแนะนำให้ติดต่อผู้ใหญ่บ้าน นายธนพล เสนบี้ หรือคณะกรรมการ
4. ภาษาไทยสุภาพ นอบน้อม มีหางเสียง (ครับ/ค่ะ)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW
        }
      }
    });

    const reply = response.text || 'ขออภัยครับ ไม่สามารถสร้างคำตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้งครับ';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI chat request'
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SMART MOO4 server running on http://0.0.0.0:${port}`);
  });
}

startServer();
