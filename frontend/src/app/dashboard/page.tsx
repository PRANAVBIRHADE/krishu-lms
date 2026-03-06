'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Video, Trophy, ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DashboardHome() {
    const { user } = useAuthStore();
    const [dashData, setDashData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/dashboard');
                setDashData(data);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8">

            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-primary/20 to-transparent p-8 rounded-3xl border border-primary/20 neon-border">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="text-accent">{user?.name}</span> 👋</h1>
                    <p className="text-gray-400">Ready to write some code today?</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-darker px-4 py-2 rounded-lg border border-white/10">
                    <Trophy className="text-yellow-500" size={20} />
                    <span className="font-bold">
                        {loading ? 'Crunching data...' : `Level ${dashData?.user?.level || 1} Hacker (${dashData?.user?.xp || 0} XP)`}
                    </span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main content) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Next Live Class */}
                    <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border-accent/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Video size={24} className="text-red-400" /> Next Live Class</h2>
                            {dashData?.nextClass && <span className="text-sm font-medium bg-red-500/20 text-red-400 px-3 py-1 rounded-full animate-pulse">Upcoming</span>}
                        </div>
                        {dashData?.nextClass ? (
                            <div className="bg-darker p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <h3 className="font-bold text-lg mb-1">{dashData.nextClass.title}</h3>
                                <p className="text-sm text-gray-400 mb-4">{dashData.nextClass.courseName}</p>
                                <a href={dashData.nextClass.meetLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white font-medium px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors neon-border inline-flex">
                                    <Video size={18} />
                                    Join Google Meet
                                </a>
                            </div>
                        ) : (
                            <div className="text-gray-400 italic">No live classes scheduled.</div>
                        )}
                    </motion.div>

                    {/* Enrolled Courses */}
                    <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen size={24} className="text-primary" /> My Courses</h2>
                            <Link href="/dashboard/courses" className="text-sm text-gray-400 hover:text-white flex items-center">View All <ArrowRight size={16} className="ml-1" /></Link>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center text-gray-400 py-4"><Loader2 className="animate-spin mx-auto mb-2" /> Loading progress...</div>
                            ) : dashData?.courseProgress?.length > 0 ? (
                                dashData.courseProgress.map((course: any, i: number) => (
                                    <div key={course.id || i} className="bg-darker p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium group-hover:text-accent transition-colors">{course.title}</h3>
                                            <span className="text-xs text-gray-400">{course.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className={`h-full ${i % 2 === 0 ? 'bg-blue-500' : 'bg-pink-500'}`}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 italic">Start submitting assignments to see progress here!</div>
                            )}
                        </div>
                    </motion.div>

                </div>

                {/* Right Column (Sidebar widgets) */}
                <div className="space-y-8">

                    {/* Announcements */}
                    <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl bg-gradient-to-b from-white/5 to-transparent">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Announcements</h2>
                            <Link href="/dashboard/announcements" className="text-xs text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {dashData?.announcements?.length > 0 ? (
                                dashData.announcements.map((ann: any) => (
                                    <div key={ann.id} className="border-l-2 border-primary pl-4 pb-2">
                                        <h4 className="font-medium text-sm">{ann.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 italic">No announcements here!</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Global Chat Preview */}
                    <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare size={20} className="text-accent" /> Club Chat</h2>
                        </div>
                        <div className="space-y-3 mb-4 h-48 overflow-hidden relative flex flex-col justify-end">
                            <div className="absolute top-0 w-full h-12 bg-gradient-to-b from-darker to-transparent z-10" />
                            {dashData?.recentChats?.length > 0 ? (
                                dashData.recentChats.map((chat: any) => {
                                    const isMe = chat.senderId === user?.id;
                                    return (
                                        <div key={chat.id} className={`p-3 rounded-xl w-[85%] text-sm ${isMe ? 'bg-primary/20 rounded-tr-none ml-auto border border-primary/30' : 'bg-white/5 rounded-tl-none'}`}>
                                            <span className={`text-xs font-bold block mb-1 ${isMe ? 'text-white' : 'text-primary'}`}>
                                                {isMe ? 'You' : chat.sender.name}
                                            </span>
                                            {chat.message}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-gray-500 text-sm text-center mt-auto mb-4 italic">No recent messages.</div>
                            )}
                        </div>
                        <Link href="/dashboard/chat" className="w-full py-2 bg-white/5 hover:bg-white/10 text-center rounded-lg text-sm block transition-colors">
                            Open Chat Room
                        </Link>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
}
