'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

export default function DirectMessagesPage() {
    const { user, token } = useAuthStore();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Socket
    useEffect(() => {
        if (!user || !token) return;

        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:10000', {
            auth: { token }
        });

        socketRef.current.on('connect', () => {
            socketRef.current?.emit('register_user', user.id);
        });

        socketRef.current.on('receive_private_message', (message) => {
            // Update conversation list or current chat window
            setMessages((prev) => {
                // Only append if it belongs to the currently open chat
                if (selectedUser && (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
                    return [...prev, message];
                }
                return prev;
            });
            fetchConversations(); // Refresh list to show latest message preview
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user, token, selectedUser]);

    // Fetch Conversations
    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations', error);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Fetch Chat History
    useEffect(() => {
        if (!selectedUser) return;
        
        const fetchHistory = async () => {
            try {
                const { data } = await api.get(`/messages/${selectedUser.id}`);
                setMessages(data);
                scrollToBottom();
            } catch (error) {
                console.error('Failed to load history', error);
            }
        };
        fetchHistory();
    }, [selectedUser]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSearch = async (e: any) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length === 0) {
            setSearchResults([]);
            return;
        }
        try {
            const { data } = await api.get(`/messages/search?q=${query}`);
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        socketRef.current?.emit('private_message', {
            senderId: user?.id,
            receiverId: selectedUser.id,
            message: newMessage.trim(),
        });

        setNewMessage('');
    };

    const selectConversation = (partner: any) => {
        setSelectedUser(partner);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="max-w-6xl mx-auto h-[85vh] flex">
            
            {/* Left Sidebar (Conversations & Search) */}
            <div className="w-1/3 border-r border-white/10 flex flex-col glass-card rounded-l-3xl overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-darker">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><MessageSquare className="text-primary" /> Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Find hackers..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full bg-dark border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {searchQuery ? (
                        <div className="p-2">
                            <div className="text-xs text-gray-500 font-bold uppercase mb-2 px-2">Search Results</div>
                            {searchResults.map((resUser) => (
                                <div key={resUser.id} onClick={() => selectConversation(resUser)} className="p-3 hover:bg-white/5 cursor-pointer rounded-xl flex items-center gap-3 transition">
                                    <img src={resUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'} alt="Avatar" className="w-10 h-10 rounded-full bg-dark border border-white/10" />
                                    <div>
                                        <div className="font-bold text-sm text-white">{resUser.name}</div>
                                        <div className="text-xs text-primary">{resUser.role}</div>
                                    </div>
                                </div>
                            ))}
                            {searchResults.length === 0 && <div className="text-center text-gray-500 text-sm mt-4">No hackers found.</div>}
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {conversations.map((conv, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => selectConversation(conv.user)} 
                                    className={`p-3 cursor-pointer rounded-xl flex items-center gap-3 transition ${selectedUser?.id === conv.user.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className="relative">
                                        <img src={conv.user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'} alt="Avatar" className="w-12 h-12 rounded-full bg-dark" />
                                        {conv.unread && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-darker"></span>}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm text-white truncate">{conv.user.name}</span>
                                            <span className="text-[10px] text-gray-500">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">{conv.lastMessage}</div>
                                    </div>
                                </div>
                            ))}
                            {conversations.length === 0 && <div className="text-center text-gray-500 text-sm mt-10 p-4 border border-dashed border-white/10 rounded-xl mx-4">Search for a hacker to start a conversation.</div>}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side (Chat Interface) */}
            <div className="w-2/3 glass-card rounded-r-3xl flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-white/10 bg-darker flex items-center gap-3">
                            <img src={selectedUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'} alt="Avatar" className="w-10 h-10 rounded-full bg-dark border border-white/10" />
                            <div>
                                <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedUser.role === 'ADMIN' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-white/10 text-gray-400 border border-white/5'}`}>
                                    {selectedUser.role}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
                            {messages.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                    <MessageSquare size={48} className="mb-4 opacity-20" />
                                    <p>Say hello to <strong>{selectedUser.name}</strong>!</p>
                                </div>
                            )}
                            
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg.id || index} 
                                        className={`flex flex-col max-w-[70%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                                    >
                                        <div className={`p-4 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-darker border border-white/10 rounded-bl-sm'}`}>
                                            {msg.message}
                                        </div>
                                        <span className="text-[10px] text-gray-500 mt-1 px-1">
                                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-white/10 bg-darker">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a secure message..."
                                    className="flex-1 bg-dark text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition border border-white/5"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-xl p-3 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(108,99,255,0.3)] disabled:shadow-none"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <div className="w-24 h-24 rounded-full bg-darker border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative">
                            <UserIcon size={40} className="text-gray-600 opacity-50" />
                        </div>
                        <h3 className="text-xl font-medium text-white">Your Encrypted Inbox</h3>
                        <p className="max-w-xs text-center text-sm">Select an existing conversation or search for a hacker to send a private direct message.</p>
                    </div>
                )}
            </div>
            
        </div>
    );
}
