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

    try {
      // Ground prompt with real Firestore data
      const villageContext = {
        villageName: 'บ้านหนองบัวคำมูล หมู่ที่ 4',
        headman: {
          name: 'นายธนพล เสนบี้',
          position: 'ผู้ใหญ่บ้าน / ประธานกรรมการหมู่บ้าน',
          phone: '081-234-5678'
        },
        committee: committee.map(c => ({
          order: c.order,
          name: `${c.prefix}${c.firstName} ${c.lastName}`,
          position: c.position,
          phone: c.phone,
          responsibilities: c.responsibilities
        })),
        recentNews: news.slice(0, 5).map(n => ({
          title: n.title,
          category: n.category,
          source: n.newsSource,
          content: n.content,
          date: n.createdAt
        })),
        upcomingEvents: events.slice(0, 5).map(e => ({
          title: e.title,
          date: e.eventDate,
          time: e.startTime,
          location: e.location,
          description: e.description
        })),
        marketItems: marketItems.slice(0, 6).map(m => ({
          title: m.title,
          price: `${m.price} บาท/${m.unit || 'ชิ้น'}`,
          seller: m.sellerName,
          phone: m.sellerPhone,
          status: m.status
        })),
        recentReportsSummary: {
          total: reports.length,
          inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
          resolved: reports.filter(r => r.status === 'RESOLVED').length
        }
      };

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend.trim(),
          villageContext
        })
      });

      if (!response.body) {
        throw new Error('Streaming response body is missing');
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
              } else if (parsed.error) {
                accumulatedText = parsed.error;
                setMessages(prev =>
                  prev.map(m => (m.id === assistantMsgId ? { ...m, text: accumulatedText } : m))
                );
              }
            } catch {
              // ignore JSON parse errors on partial chunks
            }
          }
        }
      }

      if (!accumulatedText.trim()) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, text: 'ขออภัยครับ ไม่สามารถสร้างคำตอบได้ในขณะนี้' }
              : m
          )
        );
      }
    } catch (err: any) {
      console.warn('Streaming chat error, falling back to standard endpoint:', err);
      try {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend.trim(),
            villageContext: {
              villageName: 'บ้านหนองบัวคำมูล หมู่ที่ 4',
              headman: 'นายธนพล เสนบี้'
            }
          })
        });
        const fallbackData = await fallbackRes.json();
        const replyText = fallbackData.reply || fallbackData.error || 'ขออภัยครับ เกิดข้อขัดข้องในการเชื่อมต่อ';
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, text: replyText } : m))
        );
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, text: 'ขออภัยครับ เกิดข้อขัดข้องในการเชื่อมต่อระบบ AI กรุณาลองใหม่อีกครั้งครับ' }
              : m
          )
        );
      }
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
