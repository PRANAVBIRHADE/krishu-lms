'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, Award } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        grade: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await api.post('/auth/register', {
                ...formData,
                role: 'STUDENT'
            });
            const { token, ...userData } = res.data;
            login(userData, token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-dark px-4 py-12">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-10 relative z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2 inline-block">
                        Happy Hackers
                    </Link>
                    <p className="text-gray-400">Create your Hacker Profile.</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm mb-6 text-center">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                placeholder="Coder Kid"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                placeholder="kid@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Grade</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Award size={18} />
                            </div>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                required
                                className="w-full bg-dark border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition appearance-none"
                            >
                                <option value="" disabled>Select your grade</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                                    <option key={g} value={g}>Grade {g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-3 mt-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Profile'}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-400">
                    Already a Hacker?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Login here
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
