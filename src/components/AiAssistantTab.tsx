import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Trash2, 
  HelpCircle, 
  Bot, 
  User, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import type { 
  NewsItem, 
  VillageEvent, 
  CommitteeMember, 
  MarketplaceItem, 
  Report 
} from '../types';

interface AiAssistantTabProps {
  news: NewsItem[];
  events: VillageEvent[];
  committee: CommitteeMember[];
  marketItems: MarketplaceItem[];
  reports: Report[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SAMPLE_QUESTIONS = [
  'ผู้ใหญ่บ้านชื่ออะไร และเบอร์โทรติดต่อคืออะไร?',
  'วันนี้ในหมู่บ้านมีข่าวประกาศอะไรบ้าง?',
  'ประชุมหมู่บ้านมีวันไหน และกี่โมง?',
  'ถ้าไฟถนนดับหรือน้ำไม่ไหล ต้องแจ้งอย่างไร?',
  'ในตลาดชุมชนมีใครขายผักหรือของกินบ้าง?',
  'ขอความช่วยเหลือหรือสมัครจิตอาสาต้องทำอย่างไร?'
];

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({
  news,
  events,
  committee,
  marketItems,
  reports
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'สวัสดีครับพ่อแม่พี่น้องชาวบ้านหนองบัวคำมูล หมู่ที่ 4 ทุกท่าน! ผมคือ "น้องสมาร์ท ม.4" ผู้ช่วยดิจิทัลประจำหมู่บ้าน สอบถามข้อมูลข่าวสาร เบอร์ติดต่อกรรมการ นัดหมายกิจกรรม ตลาดชุมชน หรือขั้นตอนการแจ้งเหตุได้เลยครับ สามารถพิมพ์ถามหรือกดปุ่มไมโครโฟนเพื่อพูดได้เลยครับ',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initialize SpeechRecognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('เบราว์เซอร์ของท่านไม่รองรับการรู้จำเสียงพูด กรุณาพิมพ์ข้อความแทนครับ');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const speakText = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('เบราว์เซอร์ของท่านไม่รองรับ Text-to-Speech');
      return;
    }

    if (activeSpeechId === id) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.95;
    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);
    setActiveSpeechId(id);
    window.speechSynthesis.speak(utterance);
  };

// Client-side Village Knowledge Base Engine (Fallback for static hosts like Netlify)
function generateClientVillageAnswer(
  prompt: string, 
  news: NewsItem[], 
  events: VillageEvent[], 
  committee: CommitteeMember[], 
  marketItems: MarketplaceItem[], 
  reports: Report[]
): string {
  const p = prompt.toLowerCase();

  if (p.includes('ส้มตำ') || p.includes('ตำส้ม') || p.includes('วิธีทำส้มตำ')) {
    return 'สูตรและวิธีทำ "ส้มตำ" แซ่บนัวสไตล์อีสานบ้านเราครับ:\n\n**วัตถุดิบและเครื่องปรุง:**\n1. มะละกอดิบสับหรือขูดเส้นกรอบๆ 1 กำมือใหญ่\n2. พริกขี้หนูสวน (ตามชอบ เผ็ดมากเผ็ดน้อย)\n3. กระเทียมไทย 3-5 กลีบ\n4. น้ำตาลปี๊บ 1 ช้อนโต๊ะ\n5. น้ำปลาดี 1.5 ช้อนโต๊ะ\n6. น้ำมะขามเปียก 1 ช้อนโต๊ะ และมะนาว 1 ซีก\n7. มะเขือเทศสีดาหั่นชิ้น และถั่วฝักยาวหั่นท่อน\n8. น้ำปลาร้าต้มสุกนัวๆ 1.5 ช้อนโต๊ะ\n9. กุ้งแห้งและถั่วลิสงคั่ว (ถ้าชอบ)\n\n**วิธีทำ:**\n1. โขลกกระเทียมและพริกขี้หนูพอแหลม\n2. ใส่น้ำตาลปี๊บ น้ำปลา น้ำมะขามเปียก น้ำปลาร้า และบีบมะนาว คนให้น้ำตาลละลายชิมรสตามชอบ (เปรี้ยว หวาน เค็ม นัว)\n3. ใส่ถั่วฝักยาวและมะเขือเทศ บุบพอช้ำ\n4. ใส่มะละกอดิบลงไป ใช้ส้อมและทัพพีคลุกเคล้าตำเบาๆ ให้รสน้ำยำซึมเข้าเส้นมะละกอ\n5. ตักใส่จาน โรยถั่วลิสงและกุ้งแห้ง พร้อมเสิร์ฟคู่ข้าวเหนียวร้อนๆ และผักสดครับ!';
  }

  if (p.includes('ข้าวสาร') || p.includes('มอด') || p.includes('เก็บข้าวสาร') || p.includes('ถนอมข้าวสาร')) {
    return 'วิธีดูแลและเก็บรักษา "ข้าวสาร" ให้อยู่ได้นาน ปลอดภัยจากมอดและแมลง:\n\n1. **ใช้ภาชนะมีฝาปิดสนิท:** เก็บข้าวสารในถังพลาสติกหรือโอ่งที่มีฝาปิดมิดชิด ป้องกันความชื้นและอากาศเข้า\n2. **เคล็ดลับไล่มอดธรรมชาติ:**\n   - ใส่ **พริกแห้ง** (ประมาณ 10-15 เม็ด) ลงไปในถังข้าวสาร ความเผ็ดร้อนช่วยไล่มอดได้ดีเยี่ยม\n   - ใส่ **ใบมะกรูด** ฉีกหรือใบเตยสด เพื่อไล่แมลงและเพิ่มความหอม\n   - ใส่ **ขิงหรือข่าหั่นแว่น** ก็ช่วยกันมอดได้เช่นกัน\n3. **เก็บในที่แห้งและเย็น:** วางถังข้าวในที่ร่ม อากาศถ่ายเทสะดวก หลีกเลี่ยงบริเวณที่โดนแดดส่องถึงหรือมีความชื้นสูง\n4. **เคล็ดลับเก็บนานเป็นปี:** หากซื้อข้าวสารมาตุนจำนวนมาก สามารถแบ่งใส่ถุงซิปล็อกแช่ช่องแข็ง (Freezer) ประมาณ 3-5 วันเพื่อฆ่าไข่มอด แล้วนำมาเก็บในอุณหภูมิปกติได้ยาวนานครับ';
  }

  if (p.includes('ผู้ใหญ่บ้าน') || p.includes('ประธาน') || p.includes('หัวหน้า') || p.includes('เสนบี้')) {
    return 'ผู้ใหญ่บ้านและประธานกรรมการหมู่บ้านหนองบัวคำมูล หมู่ที่ 4 คือ **นายธนพล เสนบี้** เบอร์โทรศัพท์ติดต่อ: **081-234-5678** ครับ สามารถติดต่อสอบถามเรื่องงานปกครอง ความสงบเรียบร้อย และเอกสารราชการได้ตลอดครับ';
  }

  if (p.includes('กรรมการ') || p.includes('รายชื่อ') || p.includes('ทำเนียบ') || p.includes('รองประธาน') || p.includes('เหรัญญิก')) {
    if (committee.length > 0) {
      const top5 = committee.slice(0, 5).map(c => `- ${c.prefix}${c.firstName} ${c.lastName} (${c.position}) โทร: ${c.phone}`).join('\n');
      return `คณะกรรมการหมู่บ้านหนองบัวคำมูล ม.4 มีทั้งหมด 15 ท่าน โดยมีผู้นำสำคัญดังนี้ครับ:\n${top5}\n\nท่านสามารถกดดูรายชื่อและเบอร์ติดต่อเต็มทั้ง 15 ท่านได้ที่เมนู "ผู้นำชุมชน" ครับ`;
    }
    return 'ทำเนียบคณะกรรมการหมู่บ้านหนองบัวคำมูล ม.4 มีทั้งหมด 15 ท่าน นำโดย **นายธนพล เสนบี้** (ผู้ใหญ่บ้าน/ประธาน) นายสำรอง คำมูล และนายทองพูล คำมูล (รองประธาน) สามารถดูรายละเอียดทั้งหมดได้ที่เมนู "ผู้นำชุมชน" ครับ';
  }

  if (p.includes('ประชุม') || p.includes('กิจกรรม') || p.includes('ปฏิทิน') || p.includes('งาน')) {
    if (events.length > 0) {
      const evStr = events.slice(0, 3).map(e => `- **${e.title}** วันที่ ${e.eventDate} เวลา ${e.startTime} น. ณ ${e.location}`).join('\n');
      return `กิจกรรมและนัดหมายประชุมล่าสุดของหมู่ 4 มีดังนี้ครับ:\n${evStr}\n\nดูตารางปฏิทินเต็มและกดลงทะเบียนเข้าร่วมได้ที่เมนู "กิจกรรม" (ปฏิทินชุมชน ม.4) ครับ`;
    }
    return 'ท่านสามารถตรวจสอบตารางปฏิทินกิจกรรม การนัดประชุมประชาคม และกดเข้าร่วมกิจกรรมได้ที่เมนู "กิจกรรม" (ปฏิทินชุมชน ม.4) ครับ';
  }

  if (p.includes('ข่าว') || p.includes('ประกาศ') || p.includes('แจ้งเตือน')) {
    if (news.length > 0) {
      const newsStr = news.slice(0, 3).map(n => `- **${n.title}** (${n.category})`).join('\n');
      return `ข่าวสารและประกาศสำคัญล่าสุดจากหมู่บ้านหนองบัวคำมูล ม.4:\n${newsStr}\n\nอ่านรายละเอียดเพิ่มเติมได้ที่เมนู "ข่าวสาร" ครับ`;
    }
    return 'ท่านสามารถติดตามข่าวสาร ประกาศแจ้งเตือนภัย และข่าวกิจกรรมล่าสุดของหมู่บ้านได้ที่เมนู "ข่าวสาร" ครับ';
  }

  if (p.includes('ขาย') || p.includes('ตลาด') || p.includes('ผัก') || p.includes('ซื้อ') || p.includes('สินค้า')) {
    if (marketItems.length > 0) {
      const mStr = marketItems.slice(0, 4).map(m => `- **${m.title}** ราคา ฿${m.price}/${m.unit || 'ชิ้น'} (ผู้ขาย: ${m.sellerName} โทร: ${m.sellerPhone})`).join('\n');
      return `สินค้าชุมชน ม.4 ที่กำลังเปิดขายในขณะนี้:\n${mStr}\n\nสั่งซื้อหรือลงประกาศขายสินค้าของท่านเพิ่มเติมได้ที่เมนู "ตลาดชุมชน" ครับ`;
    }
    return 'ตลาดชุมชนบ้านหนองบัวคำมูล ม.4 มีผักสดอินทรีย์ สินค้าเกษตร และอาหารปลอดสารพิษ วางจำหน่ายโดยชาวบ้านในหมู่ 4 สามารถเข้าชมได้ที่เมนู "ตลาด" ครับ';
  }

  if (p.includes('แจ้งเหตุ') || p.includes('ไฟดับ') || p.includes('น้ำไม่ไหล') || p.includes('ถนนชำรุด') || p.includes('ร้องเรียน') || p.includes('ขยะ')) {
    return 'หากพบปัญหาโคมไฟถนนดับ น้ำประปาไม่ไหล ถนนชำรุด หรือเหตุเดือดร้อน สามารถกดแจ้งผ่านระบบ **Citizen Voice** ที่เมนู "แจ้งเหตุ" ได้ทันทีครับ ระบบจะมีรหัสติดตามเรื่อง เช่น MOO4-2026-XXXXX หรือโทรแจ้งผู้ใหญ่บ้านธนพล เสนบี้ 081-234-5678 ครับ';
  }

  return `สวัสดีครับ! ผมคือน้องสมาร์ท ม.4 ผู้ช่วยดิจิทัลประจำบ้านหนองบัวคำมูล หมู่ที่ 4 ตำบลคูคำ อำเภอซำสูง จังหวัดขอนแก่น\n\nท่านสามารถสอบถามข้อมูลได้หลายด้าน เช่น:\n- ข้อมูลผู้ใหญ่บ้านและคณะกรรมการ 15 ท่าน\n- ประกาศข่าวสารและกำหนดการประชุมหมู่บ้าน\n- รายการสินค้าในตลาดชุมชน ม.4\n- ขั้นตอนการแจ้งเหตุร้องเรียนและติดตามเรื่อง\n\nหรือติดต่อผู้ใหญ่บ้าน นายธนพล เสนบี้ โทร 081-234-5678 ได้โดยตรงครับ`;
}

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Append assistant placeholder message
    const assistantMsgId = String(Date.now() + 1);
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, assistantMsg]);

    const localAnswer = generateClientVillageAnswer(
      textToSend.trim(),
      news,
      events,
      committee,
      marketItems,
      reports
    );

    try {
      const villageContext = {
        villageName: 'บ้านหนองบัวคำมูล หมู่ที่ 4 ต.คูคำ อ.ซำสูง จ.ขอนแก่น',
        headman: {
          name: 'นายธนพล เสนบี้',
          position: 'ผู้ใหญ่บ้าน / ประธานกรรมการหมู่บ้าน',
          phone: '081-234-5678'
        },
        committee: committee.map(c => ({
          order: c.order,
          name: `${c.prefix}${c.firstName} ${c.lastName}`,
          position: c.position,
          phone: c.phone
        })),
        recentNews: news.slice(0, 5).map(n => ({
          title: n.title,
          category: n.category
        })),
        upcomingEvents: events.slice(0, 5).map(e => ({
          title: e.title,
          date: e.eventDate,
          time: e.startTime,
          location: e.location
        })),
        marketItems: marketItems.slice(0, 6).map(m => ({
          title: m.title,
          price: `${m.price} บาท/${m.unit || 'ชิ้น'}`,
          seller: m.sellerName,
          phone: m.sellerPhone
        }))
      };

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend.trim(),
          villageContext
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming endpoint not available or returned non-200');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                const updatedText = accumulatedText;
                setMessages(prev =>
                  prev.map(m => (m.id === assistantMsgId ? { ...m, text: updatedText } : m))
                );
              }
            } catch {
              // ignore partial chunk JSON parse errors
            }
          }
        }
      }

      if (!accumulatedText.trim()) {
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, text: localAnswer } : m))
        );
      }
    } catch {
      // Fallback for Netlify static deployment or serverless without node express runtime
      setMessages(prev =>
        prev.map(m => (m.id === assistantMsgId ? { ...m, text: localAnswer } : m))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('ต้องการล้างประวัติการสนทนานี้หรือไม่?')) {
      window.speechSynthesis?.cancel();
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'assistant',
          text: 'ประวัติการสนทนาถูกล้างเรียบร้อยแล้วครับ มีข้อสงสัยเรื่องใดในบ้านหนองบัวคำมูล ม.4 สอบถามได้เลยครับ!',
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] max-w-3xl mx-auto bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden animate-fadeIn pb-1">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#164B3C] via-[#1E5D4B] to-[#23865B] text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="font-extrabold text-base">น้องสมาร์ท ม.4</h2>
              <span className="text-[10px] bg-emerald-400 text-slate-900 font-bold px-1.5 py-0.2 rounded-full">AI Assistant</span>
            </div>
            <p className="text-xs text-emerald-100">ผู้ช่วยดิจิทัลประจำหมู่บ้านหนองบัวคำมูล ม.4</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="ล้างประวัติการสนทนา"
          className="p-2 rounded-xl text-emerald-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAF9]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#23865B] text-white'
                  : 'bg-white text-[#164B3C] border border-emerald-200'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[82%] sm:max-w-[75%] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#164B3C] text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-400 px-1">
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => speakText(msg.id, msg.text)}
                    title="อ่านออกเสียงข้อความนี้"
                    className={`hover:text-emerald-700 transition-colors ${
                      activeSpeechId === msg.id ? 'text-emerald-600 font-bold' : ''
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 inline mr-0.5" />
                    <span>{activeSpeechId === msg.id ? 'กำลังพูด...' : 'ฟังเสียง'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs bg-white p-3 rounded-2xl max-w-[200px] border border-slate-100 shadow-xs animate-pulse">
            <Bot className="w-4 h-4 text-[#23865B] animate-spin" />
            <span>น้องสมาร์ทกำลังคิด...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex overflow-x-auto gap-1.5 no-scrollbar">
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#164B3C] border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Listening Banner */}
      {isListening && (
        <div className="bg-red-50 text-red-700 px-4 py-1.5 text-xs font-semibold flex items-center justify-between border-t border-red-200">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>กำลังฟังเสียงภาษาไทย... กรุณาพูดคำถามของท่าน</span>
          </span>
          <button onClick={toggleMic} className="text-red-800 underline text-[11px]">ยกเลิก</button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleMic}
            title={isListening ? 'หยุดฟัง' : 'กดเพื่อพูดคำถาม'}
            className={`p-2.5 rounded-2xl transition-all shadow-xs ${
              isListening
                ? 'bg-red-600 text-white animate-bounce'
                : 'bg-emerald-50 text-[#164B3C] hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'กำลังรับฟังเสียง...' : 'พิมพ์คำถามเกี่ยวกับหมู่บ้าน ม.4...'}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B] bg-slate-50 focus:bg-white"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-[#164B3C] hover:bg-[#23865B] text-white shadow-md disabled:opacity-40 transition-all active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
