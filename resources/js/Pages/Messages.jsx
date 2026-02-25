import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import axios from 'axios';
import useNotificationSound from '@/Hooks/useNotificationSound';
import PaymentModal from '@/Components/Payments/PaymentModal';
import { router } from '@inertiajs/react';
import { 
    MessageSquare, 
    FileText, 
    Calendar, 
    Briefcase, 
    ArrowRight, 
    Send,
    Circle,
    Lock,
    Handshake,
    CheckCircle,
    Clock,
    RefreshCw,
    Tag,
    Zap
} from 'lucide-react';

export default function Messages({ chats: initialChats, selectedChatId }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [chats, setChats] = useState(initialChats || []);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Payment state
    const [clientSecret, setClientSecret] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { playSound } = useNotificationSound();

    // Load selected chat on mount
    useEffect(() => {
        if (selectedChatId && chats.length > 0) {
            const chat = chats.find(c => c.id == selectedChatId);
            if (chat) {
                loadChat(chat);
            }
        } else if (chats.length > 0) {
            loadChat(chats[0]);
        }
    }, [selectedChatId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    const loadChat = (chat) => {
        setActiveChat(chat);
        
        axios.get(route('api.chats.messages', chat.id)).then(response => {
            setMessages(response.data);
        });

        // Setup Echo listener for this chat
        if (activeChat) {
            window.Echo.leave(`chat.${activeChat.id}`);
        }

        window.Echo.join(`chat.${chat.id}`)
            .here((users) => {
                console.log('Users in chat:', users);
            })
            .joining((user) => {
                console.log('User joined:', user);
            })
            .leaving((user) => {
                console.log('User left:', user);
                setTypingUsers(prev => prev.filter(u => u.id !== user.id));
            })
            .listen('.MessageSent', (e) => {
                console.log('MessageSent event received:', e);
                // Message is in e.message (like QuestionPosted uses e.question)
                const message = e.message;
                console.log('Message data:', message);
                
                // Only add if not already in the list (avoid duplicates)
                setMessages(prev => {
                    const exists = prev.find(m => m.id === message.id);
                    if (exists) {
                        console.log('Message already exists, skipping');
                        return prev;
                    }
                    console.log('Adding new message to UI');
                    // Play sound if message is from others
                    if (Number(message.user_id) !== Number(auth.user.id)) {
                        playSound();
                    }
                    return [...prev, message];
                });
            })
            .listen('.typing.indicator', (e) => {
                console.log('Typing indicator:', e);
                if (e.userId !== auth.user.id) {
                    if (e.isTyping) {
                        setTypingUsers(prev => [...prev.filter(u => u.id !== e.userId), { id: e.userId, name: e.userName }]);
                    } else {
                        setTypingUsers(prev => prev.filter(u => u.id !== e.userId));
                    }
                }
            });
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        // If chat is rejected, don't allow sending
        if (activeChat.status === 'rejected') {
            alert(t('This chat request has been declined.'));
            return;
        }

        const content = newMessage;
        setNewMessage('');
        handleTyping(false);

        // Ensure we send as provider or client context (handled by API)
        axios.post(route('api.chats.messages.store', activeChat.id), { content })
            .then(response => {
                console.log('Message sent successfully:', response.data);
                
                // If it was pending and user is owner, it's now active
                if (activeChat.status === 'pending' && activeChat.mission?.user_id === auth.user.id) {
                    setActiveChat(prev => ({ ...prev, status: 'active' }));
                    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, status: 'active' } : c));
                }

                // Add message immediately to UI
                setMessages(prev => {
                    // Check if this message ID already exists
                    const exists = prev.find(m => m.id === response.data.id);
                    if (exists) return prev;
                    return [...prev, response.data];
                });
            })
            .catch(error => {
                console.error("Failed to send message", error);
                if (error.response?.data?.error) {
                    alert(error.response.data.error);
                } else {
                    alert('Failed to send message. Please try again.');
                }
            });
    };

    const handleTyping = (typing) => {
        if (!activeChat) return;
        
        if (isTyping !== typing) {
            setIsTyping(typing);
            axios.post(route('api.chats.typing', activeChat.id), { is_typing: typing });
        }

        if (typing) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                handleTyping(false);
            }, 3000);
        }
    };

    const getOtherParticipant = (chat) => {
        const otherUserId = chat.participant_ids?.find(id => id !== auth.user.id);
        return chat.mission?.user_id === otherUserId 
            ? { name: chat.mission?.user?.name || 'User', id: otherUserId }
            : { name: chat.mission?.assigned_user?.name || 'User', id: otherUserId };
    };

    const getActiveOffer = (chat) => {
        if (!chat?.mission?.offers) return null;
        const otherUserId = chat.participant_ids?.find(id => id !== auth.user.id);
        // If I am the owner, look for the other person's offer
        // If I am the provider, look for my own offer
        const targetUserId = chat.mission.user_id === auth.user.id ? otherUserId : auth.user.id;
        return chat.mission.offers.find(o => o.user_id === targetUserId && o.status === 'pending');
    };

    const handleAcceptOffer = (offer) => {
        if (!confirm(t('Are you sure you want to accept this offer? This will initiate the payment hold.'))) return;
        
        router.post(route('missions.select-offer', { mission: activeChat.mission_id, offer: offer.id }), {}, {
            onSuccess: (page) => {
                if (page.props.flash?.stripe_client_secret) {
                    setClientSecret(page.props.flash.stripe_client_secret);
                    setShowPaymentModal(true);
                } else {
                    alert(t('Offer accepted successfully!'));
                }
            },
            onError: () => {
                alert(t('Failed to accept offer. Please try again.'));
            }
        });
    };

    const handleHire = (providerId) => {
        if (!confirm(t('Are you sure you want to hire this person? This will initiate the payment hold for the mission budget.'))) return;
        
        axios.post(route('missions.hire', { mission: activeChat.mission_id, provider: providerId }))
            .then(response => {
                if (response.data.stripe_client_secret) {
                    setClientSecret(response.data.stripe_client_secret);
                    setShowPaymentModal(true);
                } else {
                    alert(t('Provider hired successfully!'));
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error("Failed to hire provider", error);
                alert(t('Failed to hire provider. Please try again.'));
            });
    };

    const handleAcceptChat = () => {
        axios.post(route('api.chats.accept', activeChat.id)).then(() => {
            setActiveChat(prev => ({ ...prev, status: 'active' }));
            setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, status: 'active' } : c));
        });
    };

    const handleRejectChat = () => {
        if (!confirm(t('Are you sure you want to decline this chat request?'))) return;
        axios.post(route('api.chats.reject', activeChat.id)).then(() => {
            setActiveChat(prev => ({ ...prev, status: 'rejected' }));
            setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, status: 'rejected' } : c));
        });
    };

    return (
        <AuthenticatedLayout 
            header={t('Messages')}
            maxWidth="max-w-full"
            paddingY="py-0"
        >
            <Head title={t('Messages')} />
            
            <div className="flex h-[calc(100vh-144px)] bg-oflem-cream -mx-4 sm:-mx-6 lg:-mx-8">
                {/* Left Sidebar - Conversations */}
                <div className="w-1/4 bg-white border-r border-gray-border flex flex-col">
                    <div className="p-6 border-b border-gray-border">
                        <h2 className="text-2xl font-black text-oflem-charcoal">{t('Conversations')}</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {chats.length === 0 ? (
                            <div className="p-8 text-center mt-20">
                                <div className="w-16 h-16 bg-oflem-cream rounded-full flex items-center justify-center mx-auto mb-4 text-oflem-terracotta/40">
                                    <MessageSquare size={32} />
                                </div>
                                <p className="text-gray-muted font-bold">{t('No conversations yet')}</p>
                            </div>
                        ) : (
                            chats.map(chat => {
                                const other = getOtherParticipant(chat);
                                const isActive = activeChat?.id === chat.id;
                                
                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => loadChat(chat)}
                                        className={`w-full p-5 border-b border-gray-border/30 hover:bg-oflem-cream/20 transition-all text-left ${
                                            isActive ? 'bg-oflem-cream/40 border-l-4 border-l-oflem-terracotta' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light flex items-center justify-center text-oflem-charcoal font-black shrink-0">
                                                {other.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-black text-oflem-charcoal truncate">{other.name}</h3>
                                                        <span className="text-[10px] text-gray-muted font-bold">
                                                            {chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString() : ''}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-gray-muted font-bold truncate flex items-center gap-1.5">
                                                            <FileText size={10} className="text-oflem-terracotta" /> {chat.mission?.title || t('Mission')}
                                                        </p>
                                                        {chat.status === 'pending' && (
                                                            <span className="text-[10px] bg-oflem-terracotta/10 text-oflem-terracotta px-1.5 py-0.5 rounded font-black uppercase">
                                                                {t('Pending')}
                                                            </span>
                                                        )}
                                                        {chat.status === 'rejected' && (
                                                            <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-black uppercase">
                                                                {t('Declined')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-muted font-medium truncate mt-1">
                                                        {chat.messages?.[0]?.content || t('Start a conversation')}
                                                    </p>
                                                </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Center Panel - Active Chat */}
                <div className="flex-1 flex flex-col">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 bg-white border-b border-gray-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light flex items-center justify-center text-oflem-charcoal font-black">
                                        {getOtherParticipant(activeChat).name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-oflem-charcoal">{getOtherParticipant(activeChat).name}</h2>
                                        <p className="text-sm text-gray-muted font-bold flex items-center gap-1.5 mt-1">
                                            <FileText size={12} className="text-oflem-terracotta" /> {activeChat.mission?.title}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((msg) => (
                                    msg.user_id === null || msg.is_system_message ? (
                                        <div key={msg.id} className="flex justify-center my-4">
                                            <div className="elegant-capsule !px-6 !py-3 !bg-oflem-cream/50 text-xs font-bold text-oflem-charcoal/70 text-center max-w-[80%]">
                                                {msg.content}
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={msg.id} className={`flex ${Number(msg.user_id) === Number(auth.user.id) ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] ${Number(msg.user_id) === Number(auth.user.id) ? '' : 'flex items-start gap-2'}`}>
                                                {Number(msg.user_id) !== Number(auth.user.id) && (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light flex items-center justify-center text-oflem-charcoal font-black text-xs shrink-0">
                                                        {msg.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className={`p-4 rounded-[20px] text-sm font-medium shadow-sm ${
                                                        Number(msg.user_id) === Number(auth.user.id) 
                                                            ? 'bg-oflem-charcoal text-white rounded-br-sm' 
                                                            : 'bg-white text-oflem-charcoal border border-gray-border rounded-bl-sm'
                                                    }`}>
                                                        <p>{msg.content}</p>
                                                    </div>
                                                    <span className="text-[10px] text-gray-muted font-bold mt-1 block">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                                
                                {typingUsers.length > 0 && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-2 bg-white border border-gray-border px-4 py-2 rounded-full shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-muted">{typingUsers[0].name} {t('is typing...')}</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input / Request Actions */}
                            <div className="p-6 bg-white border-t border-gray-border">
                                {activeChat.status === 'pending' && activeChat.mission?.user_id === auth.user.id ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-oflem-cream/30 rounded-2xl border border-gray-border/50">
                                            <div className="w-10 h-10 bg-oflem-terracotta/10 text-oflem-terracotta rounded-full flex items-center justify-center shrink-0">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-oflem-charcoal">{t('Chat Request')}</p>
                                                <p className="text-xs text-gray-muted font-medium">{t('The provider would like to chat about this mission.')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleAcceptChat}
                                                className="flex-1 py-4 bg-oflem-charcoal text-white font-black rounded-full hover:bg-black transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} /> {t('Accept Request')}
                                            </button>
                                            <button
                                                onClick={handleRejectChat}
                                                className="px-8 py-4 bg-gray-100 text-gray-700 font-black rounded-full hover:bg-gray-200 transition-all"
                                            >
                                                {t('Decline')}
                                            </button>
                                        </div>
                                        <div className="relative flex items-center py-2">
                                            <div className="flex-grow border-t border-gray-border"></div>
                                            <span className="flex-shrink mx-4 text-xs font-black text-gray-muted uppercase tracking-widest">{t('Or simply reply')}</span>
                                            <div className="flex-grow border-t border-gray-border"></div>
                                        </div>
                                        <form onSubmit={sendMessage} className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => {
                                                    setNewMessage(e.target.value);
                                                    handleTyping(true);
                                                }}
                                                placeholder={t('Type your reply to automatically accept...')}
                                                className="flex-1 bg-oflem-cream border-gray-border rounded-full px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-oflem-terracotta focus:border-transparent transition-all"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="w-14 h-14 bg-oflem-charcoal text-white rounded-full flex items-center justify-center hover:bg-black transition-all disabled:opacity-30 shadow-lg"
                                            >
                                                <Send size={24} />
                                            </button>
                                        </form>
                                    </div>
                                ) : activeChat.status === 'pending' && activeChat.mission?.user_id !== auth.user.id ? (
                                    <div className="text-center p-6 bg-oflem-cream/30 rounded-2xl border border-gray-border/50">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-oflem-terracotta/40">
                                            <Clock size={24} />
                                        </div>
                                        <p className="text-sm font-black text-oflem-charcoal mb-1">{t('Request Pending')}</p>
                                        <p className="text-xs text-gray-muted font-medium italic">{t('Waiting for the client to accept your chat request.')}</p>
                                    </div>
                                ) : activeChat.status === 'rejected' ? (
                                    <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-red-500/40">
                                            <Lock size={24} />
                                        </div>
                                        <p className="text-sm font-black text-red-600 mb-1">{t('Request Declined')}</p>
                                        <p className="text-xs text-red-500/70 font-medium">{t('The client has declined this chat request.')}</p>
                                    </div>
                                ) : (
                                    <form onSubmit={sendMessage} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                handleTyping(true);
                                            }}
                                            placeholder={t('Type your message...')}
                                            className="flex-1 bg-oflem-cream border-gray-border rounded-full px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-oflem-terracotta focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="w-14 h-14 bg-oflem-charcoal text-white rounded-full flex items-center justify-center hover:bg-black transition-all disabled:opacity-30 shadow-lg group"
                                        >
                                            <Send size={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 text-oflem-terracotta/20">
                                    <MessageSquare size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-oflem-charcoal mb-2">{t('Select a conversation')}</h3>
                                <p className="text-gray-muted font-bold">{t('Choose a chat from the sidebar to start messaging')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Mission Details (Upwork Style) */}
                {activeChat && (
                    <div className="w-80 bg-white border-l border-gray-border flex flex-col overflow-y-auto">
                        <div className="p-6 border-b border-gray-border">
                            <h3 className="text-lg font-black text-oflem-charcoal mb-2">{t('Mission Details')}</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <p className="text-xs text-gray-muted font-bold uppercase mb-3">{t('Status')}</p>
                                <div className={`px-4 py-3 rounded-xl font-black text-sm text-center ${
                                    activeChat.mission?.status === 'OUVERTE' ? 'bg-blue-100 text-blue-700' :
                                    activeChat.mission?.status === 'EN_NEGOCIATION' ? 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/20 text-oflem-terracotta' :
                                    activeChat.mission?.status === 'VERROUILLEE' ? 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/20 text-oflem-terracotta' :
                                    activeChat.mission?.status === 'EN_COURS' ? 'bg-yellow-100 text-yellow-700' :
                                    activeChat.mission?.status === 'EN_VALIDATON' ? 'bg-orange-100 text-orange-700' :
                                    activeChat.mission?.status === 'TERMINEE' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {activeChat.mission?.status === 'OUVERTE' ? (
                                        <span className="flex items-center justify-center gap-1.5"><Circle size={10} fill="currentColor" className="text-blue-500" /> {t('Open')}</span>
                                    ) : activeChat.mission?.status === 'EN_NEGOCIATION' || activeChat.mission?.status === 'VERROUILLEE' ? (
                                        <span className="flex items-center justify-center gap-1.5"><Handshake size={14} /> {t('Assigned')}</span>
                                    ) : activeChat.mission?.status === 'EN_COURS' ? (
                                        <span className="flex items-center justify-center gap-1.5"><RefreshCw size={14} className="animate-spin-slow" /> {t('In Progress')}</span>
                                    ) : activeChat.mission?.status === 'EN_VALIDATON' ? (
                                        <span className="flex items-center justify-center gap-1.5"><Clock size={14} /> {t('In Validation')}</span>
                                    ) : activeChat.mission?.status === 'TERMINEE' ? (
                                        <span className="flex items-center justify-center gap-1.5"><CheckCircle size={14} /> {t('Completed')}</span>
                                    ) : (
                                        t(activeChat.mission?.status || 'Unknown')
                                    )}
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <p className="text-xs text-gray-muted font-bold uppercase mb-3">{t('Budget')}</p>
                                <p className="text-3xl font-black text-oflem-terracotta">
                                    {activeChat.mission?.budget ? `€${activeChat.mission.budget}` : t('Not set')}
                                </p>
                            </div>

                            {/* Deadline */}
                            {activeChat.mission?.deadline && (
                                <div>
                                    <p className="text-xs text-gray-muted font-bold uppercase mb-3">{t('Deadline')}</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-oflem-terracotta" />
                                        <span className="text-lg font-black text-oflem-charcoal">
                                            {new Date(activeChat.mission.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Active Offer Section */}
                            {getActiveOffer(activeChat) && (
                                <div className="elegant-capsule !p-4 !bg-oflem-cream/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-muted font-black uppercase">{t('Pending Offer')}</p>
                                        <span className="px-2 py-0.5 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-oflem-charcoal text-[10px] font-black rounded text-uppercase">
                                            {t('Pending')}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-oflem-charcoal">€{getActiveOffer(activeChat).amount}</span>
                                        <span className="text-xs text-gray-muted font-bold">{t('Proposed')}</span>
                                    </div>
                                    {getActiveOffer(activeChat).message && (
                                        <p className="text-xs text-oflem-charcoal/70 italic leading-relaxed">
                                            "{getActiveOffer(activeChat).message}"
                                        </p>
                                    )}
                                    
                                    {activeChat.mission?.user_id === auth.user.id && (
                                        <button
                                            onClick={() => handleAcceptOffer(getActiveOffer(activeChat))}
                                            className="w-full py-3 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-oflem-charcoal font-black rounded-full hover:shadow-lg transition-all text-sm"
                                        >
                                            {t('Accept Offer')}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Direct Hire Section (If no offer exists) */}
                            {!getActiveOffer(activeChat) && activeChat.mission?.user_id === auth.user.id && activeChat.mission?.status === 'OUVERTE' && (
                                <div className="p-4 bg-oflem-charcoal/5 border border-oflem-charcoal/10 rounded-2xl space-y-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-muted font-black uppercase mb-1">{t('Ready to start?')}</p>
                                        <p className="text-sm text-oflem-charcoal font-bold">{t('Hire this person immediately')}</p>
                                    </div>
                                    <button
                                        onClick={() => handleHire(getOtherParticipant(activeChat).id)}
                                        className="w-full py-3 bg-oflem-charcoal text-white font-black rounded-full hover:bg-black transition-all text-sm shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Briefcase size={16} /> {t('Hire')} {getOtherParticipant(activeChat).name}
                                    </button>
                                    <p className="text-[10px] text-gray-muted text-center italic leading-tight">
                                        {t('Hiring will secure the budget in escrow and assign the task.')}
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            {activeChat.mission?.description && (
                                <div>
                                    <p className="text-xs text-gray-muted font-bold uppercase mb-3">{t('Description')}</p>
                                    <p className="text-sm text-oflem-charcoal font-medium leading-relaxed">
                                        {activeChat.mission.description}
                                    </p>
                                </div>
                            )}

                            {/* View Full Mission */}
                            <Link
                                href={route('missions.show', activeChat.mission_id)}
                                className="w-full block text-center px-4 py-3 bg-oflem-charcoal text-white font-black rounded-full hover:bg-black transition-all"
                            >
                                {t('View Full Mission')} <ArrowRight size={16} className="inline ml-1" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <PaymentModal 
                show={showPaymentModal}
                clientSecret={clientSecret}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={() => {
                    setShowPaymentModal(false);
                    router.reload();
                }}
            />
        </AuthenticatedLayout>
    );
}
