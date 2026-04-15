'use client';

/**
 * BaZiChat — 多轮对话占卜组件
 *
 * 功能:
 * 1. 多轮对话式命理解读
 * 2. What-If 情境模拟
 * 3. 情感共鸣分析
 */

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BaZiChatProps {
  birthDate: string;
  birthTime: string;
  gender?: string;
  language?: 'zh' | 'en';
  baziChart?: {
    dayHeavenlyStem: string;
    dayMasterElement: string;
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

const QUICK_QUESTIONS = {
  zh: [
    { label: '💼 事业发展', query: '我的事业发展如何？' },
    { label: '❤️ 感情运势', query: '我的感情运势怎么样？' },
    { label: '💰 财富积累', query: '我的财运如何？' },
    { label: '🏥 健康建议', query: '健康方面需要注意什么？' },
    { label: '🔮 What-If情境', query: '如果我换工作会怎样？' },
    { label: '💝 情感共鸣', query: '我最近感觉很迷茫怎么办？' }
  ],
  en: [
    { label: '💼 Career', query: 'How is my career?' },
    { label: '❤️ Love', query: 'How is my love fortune?' },
    { label: '💰 Wealth', query: 'How is my wealth fortune?' },
    { label: '🏥 Health', query: 'Health advice?' },
    { label: '🔮 What-If', query: 'What if I change my job?' },
    { label: '💝 Emotional', query: 'I feel confused lately' }
  ]
};

export default function BaZiChat({ birthDate, birthTime, gender, language = 'zh', baziChart }: BaZiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = QUICK_QUESTIONS[language] || QUICK_QUESTIONS.zh;

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/bazi-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId,
          birthDate,
          birthTime,
          gender,
          language
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      // 保存sessionId
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply || '抱歉，暂时无法回复。',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        role: 'assistant',
        content: language === 'zh'
          ? '⚠️ 服务暂时不可用，请稍后再试。'
          : '⚠️ Service temporarily unavailable. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // 初始问候
  useEffect(() => {
    if (messages.length === 0 && baziChart) {
      const welcome: Message = {
        role: 'assistant',
        content: language === 'zh'
          ? `您好！我是您的专属命理顾问。根据您的八字（${baziChart.dayHeavenlyStem}日主，${baziChart.dayMasterElement}性），我可以为您提供：\n\n💼 事业发展 | ❤️ 感情运势 | 💰 财富积累 | 🏥 健康建议\n🔮 What-If情境 | 💝 情感共鸣\n\n请选择一个话题，或直接输入您的问题。`
          : `Hello! I'm your personal fortune advisor. Based on your BaZi (Day Master ${baziChart.dayHeavenlyStem}, ${baziChart.dayMasterElement} element), I can help with:\n\n💼 Career | ❤️ Love | 💰 Wealth | 🏥 Health\n🔮 What-If Scenarios | 💝 Emotional Resonance\n\nChoose a topic or ask your question directly.`,
        timestamp: new Date()
      };
      setMessages([welcome]);
    }
  }, [baziChart, language]);

  return (
    <div className="bazi-chat">
      {/* 消息列表 */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🔮'}
            </div>
            <div className="message-content">
              <div className="message-text whitespace-pre-wrap">{msg.content}</div>
              <div className="message-time">
                {msg.timestamp.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {/* 加载状态 */}
        {loading && (
          <div className="message message-assistant">
            <div className="message-avatar">🔮</div>
            <div className="message-content">
              <div className="message-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 快捷问题 */}
      <div className="quick-questions">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            className="quick-btn"
            onClick={() => sendMessage(q.query)}
            disabled={loading}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder={language === 'zh' ? '输入您的问题...' : 'Ask your question...'}
          className="chat-input"
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : (language === 'zh' ? '发送' : 'Send')}
        </button>
      </div>

      <style jsx>{`
        .bazi-chat {
          display: flex;
          flex-direction: column;
          height: 500px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message {
          display: flex;
          gap: 12px;
          animation: fadeIn 0.3s ease-out;
        }
        .message-user {
          flex-direction: row-reverse;
        }
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .message-content {
          max-width: 75%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .message-user .message-content {
          align-items: flex-end;
        }
        .message-text {
          background: rgba(255,255,255,0.05);
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.9);
        }
        .message-user .message-text {
          background: rgba(168,130,255,0.3);
          border-bottom-right-radius: 4px;
        }
        .message-assistant .message-text {
          border-bottom-left-radius: 4px;
        }
        .message-time {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
        }
        .message-typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }
        .message-typing span {
          width: 8px;
          height: 8px;
          background: rgba(168,130,255,0.6);
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }
        .message-typing span:nth-child(2) { animation-delay: 0.2s; }
        .message-typing span:nth-child(3) { animation-delay: 0.4s; }
        .quick-questions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
        }
        .quick-btn {
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-btn:hover:not(:disabled) {
          background: rgba(168,130,255,0.2);
          border-color: rgba(168,130,255,0.5);
        }
        .quick-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-input-area {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(0,0,0,0.3);
        }
        .chat-input {
          flex: 1;
          padding: 10px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input:focus {
          border-color: rgba(168,130,255,0.5);
        }
        .chat-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .send-btn {
          padding: 10px 20px;
          border-radius: 20px;
          border: none;
          background: linear-gradient(135deg, #7C3AED, #A782FF);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
