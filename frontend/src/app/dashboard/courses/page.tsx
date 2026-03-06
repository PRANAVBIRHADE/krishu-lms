'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Calendar, Loader2 } from 'lucide-react';

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                setCourses(data);
            } catch (error) {
                console.error('Failed to load courses', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <BookOpen className="text-primary" /> Course Catalog
                    </h1>
                    <p className="text-gray-400">Discover new coding adventures and enroll in live classes.</p>
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-3xl border-dashed border-white/20">
                    <BookOpen className="mx-auto text-gray-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold mb-2">No Courses Available</h3>
                    <p className="text-gray-400">Check back later or ask your instructor to assign a course.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: any, i) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="glass-card rounded-2xl overflow-hidden flex flex-col group border-white/10 hover:border-primary/50 transition-all cursor-pointer"
                        >
                            <div className="h-32 bg-gradient-to-br from-primary/40 to-accent/20 relative">
                                <div className="absolute bottom-3 left-4 bg-dark/80 backdrop-blur text-xs font-bold px-2 py-1 rounded border border-white/10 text-white">
                                    Grade {course.gradeLevel}
                                </div>
                            </div>

                            <div className="p-5 flex-grow flex flex-col">
                                <h2 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{course.title}</h2>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>

                                <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5">
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar size={14} /> {course.lessons?.length || 0} Lessons
                                    </div>
                                    <Link
                                        href={`/dashboard/courses/${course.id}`}
                                        className="text-sm font-bold bg-white/10 hover:bg-primary text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Enter Club
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
