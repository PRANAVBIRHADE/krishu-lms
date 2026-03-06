'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, KeyRound, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function ManageUsersPage() {
    const { user: currentUser } = useAuthStore();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }
        fetchUsers();
    }, [currentUser, router]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (userId === currentUser?.id) {
            alert("You cannot delete your own admin account.");
            return;
        }

        const confirm = window.confirm(`⚠️ WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete ${userName}?\nThis will erase all their chat messages, course progress, and assignment submissions.`);
        if (!confirm) return;

        setActionLoading(`delete-${userId}`);
        try {
            await api.delete(`/admin/users/${userId}`);
            await fetchUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
            alert('Failed to delete user. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetPassword = async (userId: string, userName: string) => {
        const confirm = window.confirm(`Force reset the password for ${userName} to 'happyhacker123'?`);
        if (!confirm) return;

        setActionLoading(`reset-${userId}`);
        try {
            const { data } = await api.post(`/admin/users/${userId}/reset-password`);
            alert(`✅ Success: ${data.message}\n\nPlease inform the student to log in with this new password.`);
        } catch (error) {
            console.error('Failed to reset password', error);
            alert('Failed to reset password.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Users className="text-primary" /> Manage Users
                    </h1>
                    <p className="text-gray-400">View, delete, or recover student accounts and passwords.</p>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-darker border-b border-white/10">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hacker</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Level</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((u: any, i: number) => (
                                <motion.tr
                                    key={u.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className="font-bold text-white flex items-center gap-2">
                                            {u.role === 'ADMIN' && <ShieldCheck size={16} className="text-red-400" />}
                                            {u.name}
                                            {u.id === currentUser?.id && <span className="ml-2 text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">You</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">{u.email}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`text-xs font-bold px-2 py-1 rounded border ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                {u.role}
                                            </span>
                                            {u.role === 'STUDENT' && (
                                                <span className="text-xs text-gray-500">Lv. {Math.floor(u.xp / 200) + 1} ({u.xp} XP)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleResetPassword(u.id, u.name)}
                                                disabled={actionLoading !== null}
                                                title="Force Password Reset"
                                                className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 p-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                                            >
                                                {actionLoading === `reset-${u.id}` ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                disabled={actionLoading !== null || u.id === currentUser?.id}
                                                title={u.id === currentUser?.id ? "Can't delete yourself" : "Delete Account entirely"}
                                                className={`p-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 border ${u.id === currentUser?.id ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'}`}
                                            >
                                                {actionLoading === `delete-${u.id}` ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="p-8 text-center text-gray-500 italic">No users found in the system.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
