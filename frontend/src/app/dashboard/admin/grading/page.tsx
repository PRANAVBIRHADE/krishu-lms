'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { FileCheck, Download, Code, Loader2, Search } from 'lucide-react';
import api from '@/lib/api';

export default function AdminGradingPage() {
    const { user } = useAuthStore();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gradingId, setGradingId] = useState<string | null>(null);
    const [gradeScore, setGradeScore] = useState(100);
    const [feedback, setFeedback] = useState('Great job! +100XP');
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const { data } = await api.get('/admin/submissions/pending');
                setSubmissions(data);
            } catch (error) {
                console.error("Failed to fetch submissions", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'ADMIN') {
            fetchPending();
        }
    }, [user]);

    const handleGradeSubmission = async (e: React.FormEvent, submissionId: string) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            // Re-using the student-facing route that admins can access
            await api.post(`/assignments/submissions/${submissionId}/grade`, {
                grade: gradeScore,
                feedback
            });

            // Remove graded submission from list
            setSubmissions(prev => prev.filter(s => s.id !== submissionId));
            setGradingId(null);

            // reset form defaults
            setGradeScore(100);
            setFeedback('Great job! +100XP');
        } catch (error) {
            console.error('Grading failed', error);
            alert('Failed to save grade');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <FileCheck className="text-accent" /> Pending Grading
                    </h1>
                    <p className="text-gray-400">Review student code submissions and award XP.</p>
                </div>
                <div className="bg-primary/20 text-primary font-bold px-4 py-2 rounded-lg border border-primary/30">
                    {submissions.length} Ungraded
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center">
                    <FileCheck size={48} className="mb-4 opacity-20" />
                    <p className="text-lg mb-2">You are all caught up!</p>
                    <p className="text-sm">There are no pending assignments waiting for your review.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence>
                        {submissions.map((sub, index) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-6 overflow-hidden relative"
                            >
                                <div className="flex flex-col lg:flex-row justify-between gap-6">

                                    {/* Submission Context */}
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">
                                                {sub.assignment.lesson.course.title} • {sub.assignment.lesson.title}
                                            </p>
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                Student: <span className="text-primary">{sub.student.name}</span>
                                            </h3>
                                        </div>

                                        <div className="bg-darker p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Code size={18} className="text-gray-400" />
                                                <span className="font-mono text-sm text-accent max-w-sm truncate">
                                                    {sub.fileUrl.split('/').pop()}
                                                </span>
                                            </div>
                                            {/* Note: since this is local file system, we make this point to absolute local host static files, 
                                                if this were S3 it would be the full URL. */}
                                            <a
                                                href={`http://localhost:5000${sub.fileUrl}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/10"
                                            >
                                                <Download size={14} /> Download File to Review
                                            </a>
                                        </div>
                                    </div>

                                    {/* Action Box */}
                                    <div className="lg:w-96 flex-shrink-0 bg-darker/50 p-6 rounded-2xl border border-white/5">
                                        {gradingId === sub.id ? (
                                            <form onSubmit={(e) => handleGradeSubmission(e, sub.id)} className="space-y-4">
                                                <div>
                                                    <label className="text-xs text-gray-400 font-bold mb-1 block">XP Grade Output (max 100)</label>
                                                    <input
                                                        type="number"
                                                        min="0" max="100"
                                                        value={gradeScore}
                                                        onChange={(e) => setGradeScore(parseInt(e.target.value))}
                                                        className="w-full bg-dark border border-primary/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary h-12 text-2xl font-black text-center"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400 font-bold mb-1 block">Feedback Comment</label>
                                                    <textarea
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                        className="w-full bg-dark border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm h-20 resize-none"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setGradingId(null)}
                                                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={submitLoading}
                                                        className="flex-[2] py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors neon-border flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        {submitLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Grade'}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="h-full flex flex-col justify-center gap-4">
                                                <div className="text-center text-gray-400 text-sm mb-2">
                                                    Review the downloaded code and assign an XP value.
                                                </div>
                                                <button
                                                    onClick={() => setGradingId(sub.id)}
                                                    className="w-full py-4 text-center bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all transform hover:scale-[1.02]"
                                                >
                                                    Grade Setup
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
