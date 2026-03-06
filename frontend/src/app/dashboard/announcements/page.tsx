'use client';

import { motion } from 'framer-motion';
import { Bell, Calendar, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function AnnouncementsPage() {
    const { user } = useAuthStore();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get('/dashboard/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/dashboard/announcements', formData);
            setFormData({ title: '', message: '' });
            setIsCreating(false);
            await fetchAnnouncements();
        } catch (error) {
            console.error('Failed to create announcement', error);
            alert('Could not post announcement.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Bell className="text-accent" /> Announcements
                    </h1>
                    <p className="text-gray-400">Stay up to date with club news and missions.</p>
                </div>
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors neon-border"
                    >
                        <Plus size={20} /> {isCreating ? 'Cancel' : 'New Broadcast'}
                    </button>
                )}
            </div>

            {isCreating && user?.role === 'ADMIN' && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="glass-card p-6 rounded-2xl mb-8 border-primary/30"
                    onSubmit={handleCreate}
                >
                    <h2 className="text-xl font-bold mb-4">Post New Announcement</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1">Headline</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                placeholder="Hackathon this Friday!"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1">Details</label>
                            <textarea
                                required
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary h-24 resize-none"
                                placeholder="Join us at 5PM for..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitLoading}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {submitLoading ? <Loader2 size={20} className="animate-spin" /> : 'Broadcast Now'}
                        </button>
                    </div>
                </motion.form>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="text-gray-400 italic text-center py-8">Fetching latest news...</div>
                ) : announcements.length > 0 ? (
                    announcements.map((ann, i) => (
                        <motion.div
                            key={ann.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-6 rounded-2xl flex gap-6 hover:border-primary/50 transition-colors group cursor-pointer"
                        >
                            <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 bg-darker rounded-xl border border-white/5 text-gray-400 group-hover:text-primary transition-colors">
                                <Calendar size={24} className="mb-1" />
                                <span className="text-xs font-bold uppercase">{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{ann.title}</h3>
                                    <span className="sm:hidden text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">{ann.message}</p>
                            </div>

                            <div className="flex items-center justify-center text-gray-600 group-hover:text-primary transition-colors">
                                <ChevronRight size={24} />
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-gray-400 italic text-center py-8">No announcements yet. Check back later!</div>
                )}
            </div>
        </div>
    );
}
