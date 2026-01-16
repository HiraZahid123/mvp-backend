import React, { useState, useEffect, useRef } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import useTranslation from '@/Hooks/useTranslation';

export default function ChatInterface({ initialTasks = [], user, chatWith, helperName, missionId, missionTitle }) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const { data, setData, reset } = useForm({
        content: '',
        attachments: [],
    });

    useEffect(() => {
        if (chatWith && missionTitle) {
            setData('content', `${t('Hi')} ${helperName}, ${t('I would like to book you for')}: "${missionTitle}". ${t('Let\'s discuss the details.')}`);
        }
    }, [chatWith, missionTitle, helperName]);

    useEffect(() => {
        const history = initialTasks.flatMap(task => {
            const msgs = [
                {
                    id: `user-${task.id}`,
                    type: 'user',
                    content: task.content,
                    attachments: task.attachments,
                    createdAt: new Date(task.created_at),
                }
            ];
            
            if (task.status === 'processed' || task.metadata) {
                msgs.push({
                    id: `ai-${task.id}`,
                    type: 'ai',
                    content: task.metadata?.summary || t('Task received.'),
                    metadata: task.metadata,
                    createdAt: new Date(task.created_at),
                });
            }
            return msgs;
        }).sort((a, b) => a.createdAt - b.createdAt);
        
        setMessages(history);
    }, [initialTasks]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    }, [data.content]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.content.trim() && data.attachments.length === 0) return;

        setIsProcessing(true);
        const optimisticId = Date.now();

        setMessages(prev => [...prev, {
            id: optimisticId,
            type: 'user',
            content: data.content,
            attachments: Array.from(data.attachments).map(f => ({ file_name: f.name, preview: URL.createObjectURL(f) })),
            createdAt: new Date(),
        }]);
        
        const tempContent = data.content;
        const tempAttachments = data.attachments;
        reset('content', 'attachments');

        router.post(route('tasks.store'), {
            content: tempContent,
            attachments: tempAttachments
        }, {
            preserveScroll: true,
            onSuccess: () => setIsProcessing(false),
            onError: () => {
                setIsProcessing(false);
                setMessages(prev => [...prev, { id: Date.now(), type: 'error', content: t('Failed. Please try again.'), createdAt: new Date() }]);
            }
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const filesWithPreviews = files.map(f => {
            f.preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
            return f;
        });
        setData('attachments', [...data.attachments, ...filesWithPreviews]);
    };

    const removeAttachment = (idxToRemove) => {
        setData('attachments', data.attachments.filter((_, i) => i !== idxToRemove));
    };

    const hasContent = data.content.trim() || data.attachments.length > 0;

    return (
        <div className="flex flex-col h-full bg-off-white-bg font-sans relative overflow-hidden">
            
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
            </div>

            {/* Header - Clean & Minimal */}
            <header className="relative z-50 flex-shrink-0 bg-off-white-bg/80 backdrop-blur-xl border-b border-gray-border/50">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {chatWith ? (
                            <div className="flex items-center gap-4">
                                <Link href={route('dashboard')} className="w-10 h-10 rounded-full bg-gold-accent flex items-center justify-center font-black text-primary-black">
                                    {helperName?.charAt(0)}
                                </Link>
                                <div>
                                    <h1 className="text-lg font-black text-primary-black leading-none">{helperName}</h1>
                                    <p className="text-[10px] font-bold text-gray-muted mt-1 uppercase tracking-wider">
                                        {t('Negotiating')}: <span className="text-primary-black">{missionTitle}</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Link href={route('dashboard')} className="flex items-center gap-4 group">
                                <div className="relative cursor-pointer">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-accent to-yellow-500 flex items-center justify-center shadow-lg shadow-gold-accent/20 transition-transform group-hover:scale-105">
                                        <span className="text-primary-black font-black text-xs">AI</span>
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-off-white-bg rounded-full"></div>
                                </div>
                                <div>
                                    <h1 className="text-lg font-black text-primary-black tracking-tight leading-none group-hover:text-gold-accent transition-colors">{t('Task Assistant')}</h1>
                                    <p className="text-[10px] font-bold text-gray-muted mt-1 uppercase tracking-wider">{t('Powered by Oflem')}</p>
                                </div>
                            </Link>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {chatWith && (
                            <button className="bg-primary-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-accent hover:text-primary-black transition-all shadow-md">
                                {t('Book & Pay')}
                            </button>
                        )}
                        <span className="hidden md:inline-flex px-3 py-1 bg-cream-accent rounded-full text-[10px] font-black text-primary-black uppercase tracking-widest">{t('Beta')}</span>
                        
                        {/* User Menu */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 focus:outline-none group cursor-pointer">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold text-primary-black group-hover:text-gold-accent transition-colors">{user.name}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-border flex items-center justify-center text-primary-black font-black text-sm shadow-sm group-hover:border-gold-accent transition-all overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gold-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-xs font-bold text-gray-muted uppercase tracking-wider">{t('Account')}</p>
                                        <p className="text-sm font-black text-primary-black truncate">{user.email}</p>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        {t('Profile Settings')}
                                    </Dropdown.Link>
                                    <div className="border-t border-gray-100"></div>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        {t('Log Out')}
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <main className="relative z-10 flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                    
                    {/* Empty State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in duration-700">
                            <div className="w-20 h-20 rounded-3xl bg-cream-accent flex items-center justify-center mb-8 shadow-lg">
                                <span className="text-4xl">✨</span>
                            </div>
                            <h2 className="text-3xl font-black text-primary-black tracking-tight mb-3">
                                {t('What can I help you with?')}
                            </h2>
                            <p className="text-gray-muted font-bold text-base max-w-sm leading-relaxed">
                                {t("Describe your task in detail and I'll analyze it, estimate costs, and help you get started.")}
                            </p>
                            
                            {/* Suggestion Pills */}
                            <div className="flex flex-wrap justify-center gap-3 mt-10">
                                {[t('Need a photographer'), t('Home renovation'), t('Event planning'), t('Tech support')].map((suggestion, i) => (
                                    <button 
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            setData('content', suggestion);
                                            textareaRef.current?.focus();
                                        }}
                                        className="px-5 py-2.5 bg-white border border-gray-border rounded-full text-sm font-bold text-gray-muted hover:border-gold-accent hover:text-primary-black hover:shadow-sm transition-all duration-300 active:scale-95"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, index) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className={`max-w-[85%] md:max-w-[75%]`}>
                                
                                {/* AI Avatar for AI messages */}
                                {msg.type === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-gold-accent flex items-center justify-center">
                                            <span className="text-[10px] font-black text-primary-black">AI</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-muted uppercase tracking-widest">{t('Assistant')}</span>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`relative px-6 py-4 text-base font-medium leading-relaxed transition-all duration-300
                                    ${msg.type === 'user' 
                                        ? 'bg-primary-black text-white rounded-3xl rounded-br-lg shadow-xl shadow-black/10' 
                                        : msg.type === 'error'
                                            ? 'bg-red-50 text-red-700 border border-red-100 rounded-3xl rounded-bl-lg'
                                            : 'bg-white text-primary-black border border-gray-border/50 rounded-3xl rounded-bl-lg shadow-sm'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>

                                {/* Attachments */}
                                {msg.attachments?.length > 0 && (
                                    <div className={`flex flex-wrap gap-2 mt-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.attachments.map((file, idx) => (
                                            <div key={idx} className="group relative">
                                                {file.preview ? (
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md">
                                                        <img src={file.preview} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-border rounded-xl text-xs font-bold text-gray-muted shadow-sm">
                                                        <svg className="w-4 h-4 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                        <span className="truncate max-w-[100px]">{file.file_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* AI Metadata Tags */}
                                {msg.metadata && (
                                    <div className="flex flex-wrap items-center gap-2 mt-4 animate-in fade-in duration-500 delay-300">
                                        {msg.metadata.category && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-accent rounded-full text-[10px] font-black text-primary-black uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gold-accent"></span>
                                                {msg.metadata.category}
                                            </span>
                                        )}
                                        {msg.metadata.estimated_cost && (
                                            <span className="px-3 py-1.5 bg-gold-accent rounded-full text-[10px] font-black text-primary-black uppercase tracking-widest shadow-sm">
                                                {msg.metadata.estimated_cost}
                                            </span>
                                        )}
                                        {msg.metadata.timeline && (
                                            <span className="px-3 py-1.5 bg-white border border-gray-border rounded-full text-[10px] font-black text-gray-muted uppercase tracking-widest">
                                                ⏱ {msg.metadata.timeline}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className={`mt-2 text-[10px] font-bold text-gray-muted/50 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                                    {msg.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isProcessing && (
                        <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-gold-accent flex items-center justify-center">
                                    <span className="text-[10px] font-black text-primary-black">AI</span>
                                </div>
                            </div>
                            <div className="ml-2 px-6 py-4 bg-white border border-gray-border/50 rounded-3xl rounded-bl-lg shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-[pulse_1.4s_ease-in-out_infinite]"></span>
                                    <span className="w-2 h-2 bg-gold-accent rounded-full animate-[pulse_1.4s_ease-in-out_0.2s_infinite]"></span>
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-[pulse_1.4s_ease-in-out_0.4s_infinite]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area - Premium Floating Dock */}
            <footer className="relative z-20 bg-gradient-to-t from-off-white-bg via-off-white-bg to-transparent pt-8 pb-6 px-6">
                <div className="max-w-3xl mx-auto">
                    
                    {/* Attachment Previews */}
                    {data.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300">
                            {Array.from(data.attachments).map((file, idx) => (
                                <div key={idx} className="group relative">
                                    {file.preview ? (
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                                            <img src={file.preview} className="w-full h-full object-cover" alt="" />
                                            <button 
                                                type="button" 
                                                onClick={() => removeAttachment(idx)} 
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                            >
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-border rounded-2xl shadow-sm">
                                            <svg className="w-5 h-5 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <span className="text-sm font-bold text-primary-black truncate max-w-[100px]">{file.name}</span>
                                            <button type="button" onClick={() => removeAttachment(idx)} className="text-gray-muted hover:text-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input Label */}
                    <div className="mb-4">
                        <h3 className="text-lg font-black text-primary-black">{t('Enter your mission')}</h3>
                        <p className="text-sm font-bold text-gray-muted mt-1">{t('Tell us what you need done — be as specific as possible')}</p>
                    </div>

                    {/* Main Input Container */}
                    <form onSubmit={handleSubmit}>
                        <div className={`relative bg-white rounded-3xl border-2 transition-all duration-300 shadow-lg ${isFocused ? 'border-gold-accent shadow-gold-accent/20 ring-4 ring-gold-accent/5' : 'border-gray-border'}`}>
                            
                            {/* Inner Input Area */}
                            <div className="px-5 py-4">
                                <textarea
                                    ref={textareaRef}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder={t('e.g. I need a professional photographer for my wedding on March 15th in Paris...')}
                                    rows={3}
                                    className="w-full bg-transparent text-primary-black text-base font-medium placeholder:text-gray-muted/70 placeholder:font-medium focus:outline-none resize-none leading-relaxed"
                                    style={{ maxHeight: '200px' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-border/50 bg-off-white-bg/50 rounded-b-3xl">
                                <div className="flex items-center gap-2">
                                    {/* Attach Button */}
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-gray-muted hover:text-primary-black hover:bg-white border border-transparent hover:border-gray-border transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                        <span className="hidden sm:inline">{t('Attach')}</span>
                                    </button>
                                    <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                                </div>

                                {/* Send Button */}
                                <button 
                                    type="submit" 
                                    disabled={isProcessing || !hasContent}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm transition-all duration-300 ${
                                        hasContent 
                                            ? 'bg-gold-accent text-primary-black shadow-md shadow-gold-accent/30 hover:opacity-90 active:scale-95' 
                                            : 'bg-gray-border/50 text-gray-muted cursor-not-allowed'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span>{t('Sending...')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t('Submit Mission')}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Helper Text */}
                        <p className="text-center text-[10px] font-bold text-gray-muted/40 mt-4">
                            {t('Press Enter to submit • Shift+Enter for new line')}
                        </p>
                    </form>
                </div>
            </footer>
        </div>
    );
}
