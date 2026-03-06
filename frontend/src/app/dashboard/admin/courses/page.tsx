'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, PlusCircle, LayoutList, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // View state
    const [view, setView] = useState<'list' | 'create_course' | 'create_lesson' | 'create_assignment'>('list');
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    // Form states
    const [courseForm, setCourseForm] = useState({ title: '', description: '', gradeLevel: 1 });
    const [lessonForm, setLessonForm] = useState({ title: '', content: '', meetLink: '', videoUrl: '' });
    const [assignmentForm, setAssignmentForm] = useState({ instructions: '', deadline: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/courses', courseForm);
            await fetchCourses();
            setView('list');
            setCourseForm({ title: '', description: '', gradeLevel: 1 });
        } catch (error) {
            console.error(error);
            alert('Failed to create course');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post(`/courses/${activeCourseId}/lessons`, lessonForm);
            await fetchCourses();
            setView('list');
            setLessonForm({ title: '', content: '', meetLink: '', videoUrl: '' });
        } catch (error) {
            console.error(error);
            alert('Failed to create lesson');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/assignments', { ...assignmentForm, lessonId: activeLessonId });
            await fetchCourses();
            setView('list');
            setAssignmentForm({ instructions: '', deadline: '' });
        } catch (error) {
            console.error(error);
            alert('Failed to create assignment');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <LayoutList className="text-accent" /> Manage Courses
                    </h1>
                    <p className="text-gray-400">Build the curriculum: Create courses, add lessons, and set assignments.</p>
                </div>
                {view === 'list' ? (
                    <button
                        onClick={() => setView('create_course')}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors neon-border"
                    >
                        <Plus size={20} /> New Course
                    </button>
                ) : (
                    <button
                        onClick={() => setView('list')}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-colors border border-white/10"
                    >
                        Back to List
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' && (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        {courses.length === 0 ? (
                            <div className="text-center text-gray-500 py-12 italic">No courses found. Create one!</div>
                        ) : (
                            courses.map((course: any) => (
                                <div key={course.id} className="glass-card p-6 border-white/5">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl font-bold">{course.title}</h2>
                                                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Grade {course.gradeLevel}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">{course.description}</p>
                                        </div>
                                        <button
                                            onClick={() => { setActiveCourseId(course.id); setView('create_lesson'); }}
                                            className="text-xs flex items-center gap-1 text-primary hover:text-white transition-colors bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20"
                                        >
                                            <PlusCircle size={14} /> Add Lesson
                                        </button>
                                    </div>

                                    <div className="space-y-3 pl-4 border-l-2 border-white/10">
                                        {course.lessons?.length > 0 ? (
                                            course.lessons.map((lesson: any, i: number) => (
                                                <div key={lesson.id} className="bg-darker p-4 rounded-xl border border-white/5 flex justify-between items-center group">
                                                    <div>
                                                        <span className="text-primary text-xs font-bold mr-2">L{i + 1}</span>
                                                        <span className="font-medium text-sm">{lesson.title}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => { setActiveLessonId(lesson.id); setView('create_assignment'); }}
                                                        className="opacity-0 group-hover:opacity-100 text-xs flex items-center gap-1 text-accent hover:text-white transition-all"
                                                    >
                                                        <PlusCircle size={14} /> Add Assignment
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500 italic py-2">No lessons yet.</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {/* Course Form */}
                {view === 'create_course' && (
                    <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-6 text-primary">Create New Course</h2>
                        <form onSubmit={handleCreateCourse} className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Course Title</label>
                                <input type="text" required value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" placeholder="e.g. Intro to Python" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Description</label>
                                <textarea required value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary h-24 resize-none" placeholder="What will they learn?" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Target Grade Level</label>
                                <select value={courseForm.gradeLevel} onChange={e => setCourseForm({ ...courseForm, gradeLevel: parseInt(e.target.value) })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(g => <option key={g} value={g}>Grade {g}</option>)}
                                </select>
                            </div>
                            <button type="submit" disabled={submitLoading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 mt-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex justify-center">{submitLoading ? <Loader2 className="animate-spin" /> : 'Save Course'}</button>
                        </form>
                    </motion.div>
                )}

                {/* Lesson Form */}
                {view === 'create_lesson' && (
                    <motion.div key="lesson" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-6 text-accent">Add Lesson to Course</h2>
                        <form onSubmit={handleCreateLesson} className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Lesson Title</label>
                                <input type="text" required value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Lesson Content (Text/Markdown)</label>
                                <textarea required value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent h-32 resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Google Meet Link (Optional)</label>
                                <input type="url" value={lessonForm.meetLink} onChange={e => setLessonForm({ ...lessonForm, meetLink: e.target.value })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" placeholder="https://meet.google.com/..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Video Reference URL (Optional)</label>
                                <input type="url" value={lessonForm.videoUrl} onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" placeholder="https://youtube.com/..." />
                            </div>
                            <button type="submit" disabled={submitLoading} className="w-full bg-accent hover:bg-accent/90 text-dark font-bold py-3 mt-4 rounded-xl transition-all flex justify-center">{submitLoading ? <Loader2 className="animate-spin" /> : 'Save Lesson'}</button>
                        </form>
                    </motion.div>
                )}

                {/* Assignment Form */}
                {view === 'create_assignment' && (
                    <motion.div key="assignment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="glass-card p-8 border-yellow-500/30">
                        <h2 className="text-2xl font-bold mb-6 text-yellow-500">Add Assignment to Lesson</h2>
                        <form onSubmit={handleCreateAssignment} className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Instructions</label>
                                <textarea required value={assignmentForm.instructions} onChange={e => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 h-32 resize-none" placeholder="What should they build/upload?" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Deadline Date</label>
                                <input type="datetime-local" required value={assignmentForm.deadline} onChange={e => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 scheme-dark" />
                            </div>
                            <button type="submit" disabled={submitLoading} className="w-full bg-yellow-500 hover:bg-yellow-400 text-dark font-bold py-3 mt-4 rounded-xl transition-all flex justify-center">{submitLoading ? <Loader2 className="animate-spin" /> : 'Save Assignment'}</button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
