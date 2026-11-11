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

// Local Intelligent Answer Generator for Village Context (Fallback if API unavailable)
function generateLocalVillageAnswer(prompt: string, context: any): string {
  const p = prompt.toLowerCase();
  
  if (p.includes('ผู้ใหญ่บ้าน') || p.includes('ประธาน') || p.includes('หัวหน้า') || p.includes('เสนบี้')) {
    return 'ผู้ใหญ่บ้านและประธานกรรมการหมู่บ้านหนองบัวคำมูล หมู่ที่ 4 คือ **นายธนพล เสนบี้** เบอร์โทรศัพท์ติดต่อ: **081-234-5678** ครับ สามารถติดต่อสอบถามเรื่องงานปกครอง ความสงบเรียบร้อย และเอกสารราชการได้ตลอดครับ';
  }

  if (p.includes('กรรมการ') || p.includes('รายชื่อ') || p.includes('ทำเนียบ') || p.includes('รองประธาน') || p.includes('เหรัญญิก')) {
    const committeeList = context?.committee || [];
    if (committeeList.length > 0) {
      const top5 = committeeList.slice(0, 5).map((c: any) => `- ${c.name} (${c.position}) โทร: ${c.phone}`).join('\n');
      return `คณะกรรมการหมู่บ้านหนองบัวคำมูล ม.4 มีทั้งหมด 15 ท่าน โดยมีผู้นำสำคัญดังนี้ครับ:\n${top5}\n\nท่านสามารถดูรายชื่อเต็มทั้ง 15 ท่านได้ที่เมนู "ผู้นำชุมชน" ครับ`;
    }
    return 'ทำเนียบคณะกรรมการหมู่บ้านหนองบัวคำมูล ม.4 มีทั้งหมด 15 ท่าน นำโดย **นายธนพล เสนบี้** (ผู้ใหญ่บ้าน) นายสำรอง คำมูล และนายทองพูล คำมูล (รองประธาน) สามารถดูรายละเอียดทั้งหมดได้ที่เมนู "ผู้นำชุมชน" ครับ';
  }

  if (p.includes('ประชุม') || p.includes('กิจกรรม') || p.includes('ปฏิทิน') || p.includes('งาน')) {
    const events = context?.upcomingEvents || [];
    if (events.length > 0) {
      const evStr = events.map((e: any) => `- **${e.title}** วันที่ ${e.date} เวลา ${e.time} น. ณ ${e.location}`).join('\n');
      return `กิจกรรมและนัดหมายประชุมล่าสุดของหมู่ 4 มีดังนี้ครับ:\n${evStr}\n\nดูตารางเต็มได้ที่เมนู "ปฏิทินกิจกรรม" ครับ`;
    }
    return 'กิจกรรมชุมชนล่าสุด สามารถตรวจสอบตารางปฏิทิน การนัดประชุมประชาคม และลงทะเบียนเข้าร่วมได้ที่เมนู "กิจกรรม" (ปฏิทินชุมชน ม.4) ครับ';
  }

  if (p.includes('ข่าว') || p.includes('ประกาศ') || p.includes('แจ้งเตือน')) {
    const news = context?.recentNews || [];
    if (news.length > 0) {
      const newsStr = news.slice(0, 3).map((n: any) => `- **${n.title}** (${n.category})`).join('\n');
      return `ข่าวสารและประกาศสำคัญล่าสุดจากหมู่บ้านหนองบัวคำมูล ม.4:\n${newsStr}\n\nอ่านรายละเอียดเพิ่มเติมได้ที่เมนู "ข่าวสาร" ครับ`;
    }
    return 'ท่านสามารถติดตามข่าวสาร Announcements ประกาศแจ้งเตือนภัย และข่าวกิจกรรมล่าสุดของหมู่บ้านได้ที่เมนู "ข่าวสาร" ครับ';
  }

  if (p.includes('ขาย') || p.includes('ตลาด') || p.includes('ผัก') || p.includes('ซื้อ')) {
    const market = context?.marketItems || [];
    if (market.length > 0) {
      const mStr = market.slice(0, 4).map((m: any) => `- **${m.title}** ราคา ${m.price} (ผู้ขาย: ${m.seller} โทร: ${m.phone})`).join('\n');
      return `สินค้าชุมชน ม.4 ที่กำลังเปิดขายในขณะนี้:\n${mStr}\n\nสั่งซื้อหรือลงขายสินค้าเพิ่มเติมได้ที่เมนู "ตลาดชุมชน" ครับ`;
    }
    return 'ตลาดชุมชนบ้านหนองบัวคำมูล ม.4 มีผักสดอินทรีย์ สินค้าเกษตร และอาหารปลอดสารพิษ วางจำหน่ายโดยชาวบ้านในหมู่ 4 สามารถเข้าชมได้ที่เมนู "ตลาด" ครับ';
  }

  if (p.includes('แจ้งเหตุ') || p.includes('ไฟดับ') || p.includes('น้ำไม่ไหล') || p.includes('ถนนชำรุด') || p.includes('ร้องเรียน')) {
    return 'หากพบปัญหาโคมไฟถนนดับ น้ำประปาไม่ไหล ถนนชำรุด หรือเหตุเดือดร้อน สามารถกดแจ้งผ่านระบบ **Citizen Voice** ที่เมนู "แจ้งเหตุ" ได้ทันทีครับ ระบบจะมีรหัสติดตามเรื่อง เช่น MOO4-2026-XXXXX หรือแจ้งผู้ใหญ่บ้านธนพล เสนบี้ โทร 081-234-5678 ครับ';
  }

  return `สวัสดีครับ! ผมคือน้องสมาร์ท ม.4 ผู้ช่วยดิจิทัลประจำบ้านหนองบัวคำมูล หมู่ที่ 4\n\nท่านสามารถสอบถามข้อมูลได้หลายด้าน เช่น:\n- ข้อมูลผู้ใหญ่บ้านและคณะกรรมการ 15 ท่าน\n- ประกาศข่าวสารและกำหนดการประชุมหมู่บ้าน\n- รายการสินค้าในตลาดชุมชน ม.4\n- ขั้นตอนการแจ้งเหตุร้องเรียนและติดตามเรื่อง\n\nหรือติดต่อผู้ใหญ่บ้าน นายธนพล เสนบี้ โทร 081-234-5678 ได้โดยตรงครับ`;
}

// Gemini AI Assistant Streaming Endpoint (ตอบกลับแบบ Streaming Real-Time)
app.post('/api/chat/stream', async (req, res) => {
  const { prompt, villageContext } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const fallbackAns = generateLocalVillageAnswer(prompt, villageContext);
    res.write(`data: ${JSON.stringify({ text: fallbackAns })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  try {
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

ข้อมูลปัจจุบันดึงสดจากระบบฐานข้อมูล Cloud Firestore:
${JSON.stringify(villageContext || {}, null, 2)}

กฎการตอบแบบรวดเร็วและเรียลไทม์:
1. ตอบตรงคำถามทันที สั้นกระชับได้ใจความ ชัดเจน ไม่ต้องเกริ่นยาว
2. ใช้ข้อมูลตามจริงจากฐานข้อมูลข้างต้นเสมอ เช่น ผู้ใหญ่บ้านชื่อนายธนพล เสนบี้ (โทร 081-234-5678), คณะกรรมการ 15 ท่าน, ข่าวประกาศ, วันเวลากิจกรรม, รายการตลาดชุมชน
3. ภาษาไทยสุภาพ นอบน้อม มีหางเสียง (ครับ/ค่ะ)`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        systemInstruction
      }
    });

    let hasChunk = false;
    for await (const chunk of responseStream) {
      if (chunk.text) {
        hasChunk = true;
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    if (!hasChunk) {
      const fallbackAns = generateLocalVillageAnswer(prompt, villageContext);
      res.write(`data: ${JSON.stringify({ text: fallbackAns })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.warn('Gemini stream error, serving smart local village answer:', error?.message);
    const fallbackAns = generateLocalVillageAnswer(prompt, villageContext);
    res.write(`data: ${JSON.stringify({ text: fallbackAns })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Gemini AI Assistant Standard endpoint (fallback)
app.post('/api/chat', async (req, res) => {
  const { prompt, villageContext } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({ reply: generateLocalVillageAnswer(prompt, villageContext) });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `คุณคือ "น้องสมาร์ท ม.4" (SMART AI ASSISTANT) ผู้ช่วยดิจิทัลประจำบ้าน "บ้านหนองบัวคำมูล หมู่ที่ 4"
ผู้ใหญ่บ้าน / ประธานกรรมการหมู่บ้านชื่อ: นายธนพล เสนบี้ (โทร 081-234-5678)

ข้อมูลปัจจุบันดึงสดจากระบบฐานข้อมูล Cloud Firestore:
${JSON.stringify(villageContext || {}, null, 2)}

กฎการตอบ:
1. ตอบตรงคำถามทันที สั้นกระชับได้ใจความ ชัดเจน
2. ภาษาไทยสุภาพ นอบน้อม มีหางเสียง (ครับ/ค่ะ)`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        systemInstruction
      }
    });

    const reply = response.text || generateLocalVillageAnswer(prompt, villageContext);
    res.json({ reply });
  } catch (error: any) {
    console.warn('Gemini chat error, serving fallback:', error?.message);
    res.json({ reply: generateLocalVillageAnswer(prompt, villageContext) });
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
