'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { User, Edit3, Save, Shield, Award, Star, Settings } from 'lucide-react';
import api from '@/lib/api';

const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver'
];

export default function ProfilePage() {
    const { user, login } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_OPTIONS[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put('/auth/profile', { bio, avatarUrl });
            
            // Update Zustand store
            if (user) {
                const updatedUser = { ...user, bio: data.bio, avatarUrl: data.avatarUrl };
                const currentToken = localStorage.getItem('token') || '';
                login(updatedUser, currentToken);
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const getIcon = (name: string) => {
        switch (name) {
            case 'Award': return <Award className="text-yellow-500" size={32} />;
            case 'Shield': return <Shield className="text-blue-500" size={32} />;
            case 'Star': return <Star className="text-pink-500" size={32} />;
            default: return <Award className="text-white" size={32} />;
        }
    };

    if (!user) return <div className="text-center mt-20 text-gray-400">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-2"><User className="text-primary" /> Hacker Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Avatar & Core Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-3xl text-center space-y-4">
                    <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20 bg-darker">
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30 mt-2 inline-block">
                            Lvl. {user.level || 1} Hacker
                        </span>
                    </div>
                    <div className="font-mono text-accent font-bold text-xl">{user.xp || 0} XP</div>
                </motion.div>

                {/* Right Col: Details & Badges */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-8">
                    
                    {/* Settings / Bio */}
                    <div className="glass-card p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Settings size={20} className="text-gray-400" /> Settings</h3>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                            ) : (
                                <button onClick={handleSaveProfile} disabled={isSaving} className="text-sm font-medium bg-green-500/20 text-green-400 px-4 py-1.5 rounded-lg flex items-center gap-2 hover:bg-green-500/30">
                                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Choose Avatar</label>
                                    <div className="flex flex-wrap gap-2">
                                        {AVATAR_OPTIONS.map((url, idx) => (
                                            <button key={idx} onClick={() => setAvatarUrl(url)} className={`w-12 h-12 rounded-full border-2 overflow-hidden bg-darker ${avatarUrl === url ? 'border-primary shadow-[0_0_10px_rgba(108,99,255,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                                                <img src={url} alt="option" className="w-full h-full" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Hacker Bio</label>
                                    <textarea
                                        value={bio} onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about your coding journey..."
                                        className="w-full bg-darker border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary min-h-[100px]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-darker p-4 rounded-xl border border-white/5 min-h-[100px]">
                                {user.bio ? <p className="text-gray-300 text-sm whitespace-pre-wrap">{user.bio}</p> : <p className="text-gray-500 italic text-sm">No bio written yet. Click Edit Profile to add one!</p>}
                            </div>
                        )}
                    </div>

                    {/* Earned Badges */}
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><Shield size={20} className="text-accent" /> Earned Badges</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {user.badges && user.badges.length > 0 ? (
                                user.badges.map((userBadge: any) => (
                                    <div key={userBadge.id} className="bg-darker p-4 rounded-xl border border-white/5 flex flex-col items-center text-center hover:bg-white/5 transition-colors group">
                                        <div className="mb-3 transform group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)] rounded-full">
                                            {getIcon(userBadge.badge.icon)}
                                        </div>
                                        <div className="font-bold text-sm text-white mb-1">{userBadge.badge.name}</div>
                                        <div className="text-xs text-gray-400">{userBadge.badge.description}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-darker p-8 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-gray-500">
                                    <Award size={32} className="mb-2 opacity-20" />
                                    <p className="text-sm">No badges unlocked yet.</p>
                                    <p className="text-xs mt-1">Submit assignments and level up to earn rewards!</p>
                                </div>
                            )}
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
