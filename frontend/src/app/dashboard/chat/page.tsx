'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Send, Users, ShieldAlert, Code, MessageSquare, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

interface ChatMessage {
    id?: string;
    senderId: string;
    message: string;
    isAnnouncement?: boolean;
    timestamp?: string;
    sender?: { name: string; role: string };
}

export default function ChatRoomPage() {
    const { user } = useAuthStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isAnnouncementMode, setIsAnnouncementMode] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Connect to Socket.io server
        const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        const newSocket = io(URL);
        setSocket(newSocket);

        newSocket.emit('join_room', 'global_club');

        newSocket.on('receive_message', (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });

        newSocket.on('previous_messages', (msgs: ChatMessage[]) => {
            setMessages(msgs);
        });

        newSocket.on('message_deleted', (deletedId: string) => {
            setMessages((prev) => prev.filter(msg => msg.id !== deletedId));
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentMessage.trim() !== '' && socket && user) {
            const msgData: ChatMessage = {
                senderId: user.id,
                message: currentMessage,
                isAnnouncement: isAnnouncementMode,
                sender: { name: user.name, role: user.role }
            };

            await socket.emit('send_message', { ...msgData, room: 'global_club' });
            setCurrentMessage('');
            if (isAnnouncementMode) setIsAnnouncementMode(false);
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!confirm('Are you sure you want to permanently delete this message?')) return;

        try {
            await api.delete(`/admin/chat/${msgId}`);
            // Tell all sockets to remove this message visually
            socket?.emit('delete_message_broadcast', { room: 'global_club', messageId: msgId });
        } catch (error) {
            console.error('Failed to delete message', error);
            alert('Failed to delete message.');
        }
    };

    const formatCodeBlocks = (text: string) => {
        if (!text.includes('```')) return <span>{text}</span>;
        // VERY simple code block formatter for UI
        const parts = text.split('```');
        return parts.map((part, i) =>
            i % 2 === 0 ? <span key={i}>{part}</span> : (
                <pre key={i} className="bg-darker p-3 rounded-lg border border-white/10 text-accent font-mono text-sm my-2 mt-2 w-full overflow-x-auto inline-block">
                    <code>{part}</code>
                </pre>
            )
        );
    };

    return (
        <div className="max-w-5xl mx-auto h-[80vh] flex flex-col glass-card rounded-3xl overflow-hidden border-primary/20">

            {/* Chat Header */}
            <div className="bg-darker p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Code className="text-primary" /> Global Hacker Room
                    </h1>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <Users size={14} className="text-green-400" /> 24 Hackers Online
                    </p>
                </div>

                {user?.role === 'ADMIN' && (
                    <button
                        onClick={() => setIsAnnouncementMode(!isAnnouncementMode)}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border",
                            isAnnouncementMode ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                        )}
                    >
                        <ShieldAlert size={16} />
                        {isAnnouncementMode ? 'Admin Broadcast ON' : 'Make Announcement'}
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>No messages yet. Be the first to say Hello World!</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isMe = msg.senderId === user?.id;

                    if (msg.isAnnouncement) {
                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                key={i} className="bg-gradient-to-r from-red-500/20 to-transparent p-4 rounded-xl border-l-4 border-red-500 flex items-start gap-4 mx-4"
                            >
                                <ShieldAlert className="text-red-400 shrink-0 mt-1" />
                                <div>
                                    <div className="text-red-400 font-bold text-xs uppercase mb-1">Admin Announcement • {msg.sender?.name}</div>
                                    <div className="text-white">{msg.message}</div>
                                </div>
                            </motion.div>
                        )
                    }

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                        >
                            <div className="text-xs text-gray-500 mb-1 px-1 flex items-center gap-2">
                                {isMe ? 'You' : msg.sender?.name || 'Hacker'}
                                {msg.sender?.role === 'ADMIN' && <span className="text-primary">ADMIN</span>}
                                {user?.role === 'ADMIN' && msg.id && (
                                    <button
                                        onClick={() => handleDeleteMessage(msg.id!)}
                                        className="text-red-400 hover:text-red-300 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Message"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                            <div
                                className={clsx(
                                    "max-w-[75%] px-5 py-3 rounded-2xl",
                                    isMe
                                        ? "bg-primary text-white rounded-br-sm shadow-[0_4px_15px_rgba(108,99,255,0.3)]"
                                        : "bg-white/10 text-gray-100 rounded-bl-sm border border-white/5"
                                )}
                            >
                                {formatCodeBlocks(msg.message)}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-darker border-t border-white/10">
                <form onSubmit={sendMessage} className="flex gap-4">
                    <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder={isAnnouncementMode ? "Type an announcement..." : "Type your message or use ```code```..."}
                        className={clsx(
                            "flex-1 bg-white/5 border rounded-xl px-5 py-3 focus:outline-none transition-colors",
                            isAnnouncementMode ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400" : "border-white/10 focus:border-primary focus:ring-1 focus:ring-primary text-white"
                        )}
                    />
                    <button
                        type="submit"
                        disabled={!currentMessage.trim()}
                        className={clsx(
                            "px-6 py-3 rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50",
                            isAnnouncementMode ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-primary hover:bg-primary/90 text-white neon-border"
                        )}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
