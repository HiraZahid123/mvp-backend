import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import axios from 'axios';
import PaymentModal from '@/Components/Payments/PaymentModal';
import { router } from '@inertiajs/react';

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

        const content = newMessage;
        setNewMessage('');
        handleTyping(false);

        axios.post(route('api.chats.messages.store', activeChat.id), { content })
            .then(response => {
                console.log('Message sent successfully:', response.data);
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

    const handleHire = (performerId) => {
        if (!confirm(t('Are you sure you want to hire this person? This will initiate the payment hold for the mission budget.'))) return;
        
        axios.post(route('missions.hire', { mission: activeChat.mission_id, performer: performerId }))
            .then(response => {
                if (response.data.stripe_client_secret) {
                    setClientSecret(response.data.stripe_client_secret);
                    setShowPaymentModal(true);
                } else {
                    alert(t('Performer hired successfully!'));
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error("Failed to hire performer", error);
                alert(t('Failed to hire performer. Please try again.'));
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
                        <h2 className="text-2xl font-black text-primary-black">{t('Conversations')}</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {chats.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-6xl mb-4">💬</div>
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
                                            isActive ? 'bg-oflem-cream/40 border-l-4 border-l-gold-accent' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gold-accent flex items-center justify-center text-primary-black font-black shrink-0">
                                                {other.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-black text-primary-black truncate">{other.name}</h3>
                                                    <span className="text-[10px] text-gray-muted font-bold">
                                                        {chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-muted font-bold mb-1 truncate">
                                                    📋 {chat.mission?.title || t('Mission')}
                                                </p>
                                                <p className="text-xs text-gray-muted font-medium truncate">
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
                                    <div className="w-12 h-12 rounded-full bg-gold-accent flex items-center justify-center text-primary-black font-black">
                                        {getOtherParticipant(activeChat).name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-primary-black">{getOtherParticipant(activeChat).name}</h2>
                                        <p className="text-sm text-gray-muted font-bold">📋 {activeChat.mission?.title}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((msg) => (
                                    msg.user_id === null || msg.is_system_message ? (
                                        <div key={msg.id} className="flex justify-center my-4">
                                            <div className="bg-oflem-cream/50 border border-gold-accent/30 px-6 py-3 rounded-2xl text-xs font-bold text-primary-black/70 text-center max-w-[80%]">
                                                {msg.content}
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={msg.id} className={`flex ${msg.user_id === auth.user.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] ${msg.user_id === auth.user.id ? '' : 'flex items-start gap-2'}`}>
                                                {msg.user_id !== auth.user.id && (
                                                    <div className="w-8 h-8 rounded-full bg-gold-accent flex items-center justify-center text-primary-black font-black text-xs shrink-0">
                                                        {msg.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className={`p-4 rounded-[20px] text-sm font-medium shadow-sm ${
                                                        msg.user_id === auth.user.id 
                                                            ? 'bg-primary-black text-white rounded-br-sm' 
                                                            : 'bg-white text-primary-black border border-gray-border rounded-bl-sm'
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
                                                <span className="w-2 h-2 bg-gold-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-muted">{typingUsers[0].name} {t('is typing...')}</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={sendMessage} className="p-6 bg-white border-t border-gray-border">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping(true);
                                        }}
                                        placeholder={t('Type your message...')}
                                        className="flex-1 bg-oflem-cream border-gray-border rounded-full px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-gold-accent focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="w-14 h-14 bg-primary-black text-white rounded-full flex items-center justify-center hover:bg-black transition-all disabled:opacity-30 shadow-lg"
                                    >
                                        <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-8xl mb-6">💬</div>
                                <h3 className="text-2xl font-black text-primary-black mb-2">{t('Select a conversation')}</h3>
                                <p className="text-gray-muted font-bold">{t('Choose a chat from the sidebar to start messaging')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Mission Details (Upwork Style) */}
                {activeChat && (
                    <div className="w-80 bg-white border-l border-gray-border flex flex-col overflow-y-auto">
                        <div className="p-6 border-b border-gray-border">
                            <h3 className="text-lg font-black text-primary-black mb-2">{t('Mission Details')}</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <p className="text-xs text-gray-muted font-bold uppercase mb-3">{t('Status')}</p>
                                <div className={`px-4 py-3 rounded-xl font-black text-sm text-center ${
                                    activeChat.mission?.status === 'OUVERTE' ? 'bg-blue-100 text-blue-700' :
                                    activeChat.mission?.status === 'EN_NEGOCIATION' ? 'bg-gold-accent/20 text-gold-accent' :
                                    activeChat.mission?.status === 'VERROUILLEE' ? 'bg-gold-accent/20 text-gold-accent' :
                                    activeChat.mission?.status === 'EN_COURS' ? 'bg-yellow-100 text-yellow-700' :
                                    activeChat.mission?.status === 'EN_VALIDATON' ? 'bg-orange-100 text-orange-700' :
                                    activeChat.mission?.status === 'TERMINEE' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {activeChat.mission?.status === 'OUVERTE' ? '🔓 ' + t('Open') :
                                     activeChat.mission?.status === 'EN_NEGOCIATION' ? '✅ ' + t('Assigned') :
                                     activeChat.mission?.status === 'VERROUILLEE' ? '✅ ' + t('Assigned') :
                                     activeChat.mission?.status === 'EN_COURS' ? '⏳ ' + t('In Progress') :
                                     activeChat.mission?.status === 'EN_VALIDATON' ? '✅ ' + t('In Validation') :
                                     activeChat.mission?.status === 'TERMINEE' ? '✔️ ' + t('Completed') :
                                     t(activeChat.mission?.status || 'Unknown')}
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <p className="text-xs text-gray-muted font-bold uppercase mb-3">{t('Budget')}</p>
                                <p className="text-3xl font-black text-gold-accent">
                                    {activeChat.mission?.budget ? `€${activeChat.mission.budget}` : t('Not set')}
                                </p>
                            </div>

                            {/* Deadline */}
                            {activeChat.mission?.deadline && (
                                <div>
                                    <p className="text-xs text-gray-muted font-bold uppercase mb-3">{t('Deadline')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">📅</span>
                                        <span className="text-lg font-black text-primary-black">
                                            {new Date(activeChat.mission.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Active Offer Section */}
                            {getActiveOffer(activeChat) && (
                                <div className="p-4 bg-oflem-cream/20 border border-gold-accent/20 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-muted font-black uppercase">{t('Pending Offer')}</p>
                                        <span className="px-2 py-0.5 bg-gold-accent text-primary-black text-[10px] font-black rounded text-uppercase">
                                            {t('Pending')}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-primary-black">€{getActiveOffer(activeChat).amount}</span>
                                        <span className="text-xs text-gray-muted font-bold">{t('Proposed')}</span>
                                    </div>
                                    {getActiveOffer(activeChat).message && (
                                        <p className="text-xs text-primary-black/70 italic leading-relaxed">
                                            "{getActiveOffer(activeChat).message}"
                                        </p>
                                    )}
                                    
                                    {activeChat.mission?.user_id === auth.user.id && (
                                        <button
                                            onClick={() => handleAcceptOffer(getActiveOffer(activeChat))}
                                            className="w-full py-3 bg-gold-accent text-primary-black font-black rounded-full hover:shadow-lg transition-all text-sm"
                                        >
                                            {t('Accept Offer')}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Direct Hire Section (If no offer exists) */}
                            {!getActiveOffer(activeChat) && activeChat.mission?.user_id === auth.user.id && activeChat.mission?.status === 'OUVERTE' && (
                                <div className="p-4 bg-primary-black/5 border border-primary-black/10 rounded-2xl space-y-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-muted font-black uppercase mb-1">{t('Ready to start?')}</p>
                                        <p className="text-sm text-primary-black font-bold">{t('Hire this person immediately')}</p>
                                    </div>
                                    <button
                                        onClick={() => handleHire(getOtherParticipant(activeChat).id)}
                                        className="w-full py-3 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all text-sm shadow-md"
                                    >
                                        💼 {t('Hire')} {getOtherParticipant(activeChat).name}
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
                                    <p className="text-sm text-primary-black font-medium leading-relaxed">
                                        {activeChat.mission.description}
                                    </p>
                                </div>
                            )}

                            {/* View Full Mission */}
                            <Link
                                href={route('missions.show', activeChat.mission_id)}
                                className="w-full block text-center px-4 py-3 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all"
                            >
                                {t('View Full Mission')} →
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
