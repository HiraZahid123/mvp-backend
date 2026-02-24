import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import useTranslation from '@/Hooks/useTranslation';
import { Send } from 'lucide-react';

export default function ChatWindow({ chat, onClose }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        // Fetch messages
        axios.get(route('api.chats.messages', chat.id)).then(response => {
            setMessages(response.data);
        });

        // Listen for new messages
        const channel = window.Echo.join(`chat.${chat.id}`)
            .here((users) => {
                // Handle online users
            })
            .joining((user) => {
                // User joined
            })
            .leaving((user) => {
                // User left
                setTypingUsers(prev => prev.filter(u => u.id !== user.id));
            })
            .listen('.message.sent', (e) => {
                setMessages(prev => [...prev, e.message]);
            })
            .listen('.typing.indicator', (e) => {
                if (e.userId !== auth.user.id) {
                    if (e.isTyping) {
                        setTypingUsers(prev => [...prev.filter(u => u.id !== e.userId), { id: e.userId, name: e.userName }]);
                    } else {
                        setTypingUsers(prev => prev.filter(u => u.id !== e.userId));
                    }
                }
            });

        return () => {
            window.Echo.leave(`chat.${chat.id}`);
        };
    }, [chat.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage;
        setNewMessage('');
        handleTyping(false);

        axios.post(route('api.chats.messages.store', chat.id), { content })
            .then(response => {
                // Message added via echo listener
            })
            .catch(error => {
                console.error("Failed to send message", error);
            });
    };

    const handleTyping = (typing) => {
        if (isTyping !== typing) {
            setIsTyping(typing);
            axios.post(route('api.chats.typing', chat.id), { is_typing: typing });
        }

        if (typing) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                handleTyping(false);
            }, 3000);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-[32px] shadow-2xl border border-gray-border flex flex-col z-[100] overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            {/* Header */}
            <div className="p-5 bg-oflem-charcoal text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light flex items-center justify-center text-oflem-charcoal font-black text-xs">
                        {chat.mission?.title.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-sm font-black truncate max-w-[180px]">{chat.mission?.title}</h4>
                        <p className="text-[10px] text-gray-muted font-bold tracking-widest uppercase">{t('Chatting')}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-oflem-cream">
                {messages.map((msg) => (
                    msg.user_id === null || msg.is_system ? (
                        <div key={msg.id} className="flex justify-center my-2">
                             <div className="bg-cream-accent/50 border border-oflem-terracotta/20 px-4 py-2 rounded-2xl text-[11px] font-bold text-oflem-charcoal/60 text-center max-w-[90%]">
                                {msg.content}
                             </div>
                        </div>
                    ) : (
                        <div key={msg.id} className={`flex ${msg.user_id === auth.user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-[20px] text-sm font-medium ${
                                msg.user_id === auth.user.id 
                                    ? 'bg-oflem-charcoal text-white rounded-br-sm' 
                                    : 'bg-white text-oflem-charcoal border border-gray-border rounded-bl-sm shadow-sm'
                            }`}>
                                <p>{msg.content}</p>
                                <span className="text-[9px] opacity-40 mt-1 block text-right">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )
                ))}
                
                {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-border px-4 py-2 rounded-full shadow-sm text-[10px] font-bold text-gray-muted flex items-center gap-2">
                             <div className="flex gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                             </div>
                             {typingUsers[0].name} {t('is typing...')}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-border">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping(true);
                        }}
                        placeholder={t('Type a message...')}
                        className="flex-1 bg-oflem-cream border-none rounded-full px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-oflem-terracotta transition-all"
                    />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="w-10 h-10 bg-oflem-charcoal text-white rounded-full flex items-center justify-center hover:bg-black transition-all disabled:opacity-30 shadow-lg group"
                        >
                            <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                </div>
            </form>
        </div>
    );
}
