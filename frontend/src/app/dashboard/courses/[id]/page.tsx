'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { PlayCircle, FileText, CheckCircle, Upload, Loader2, Video } from 'lucide-react';

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingAssignment, setUploadingAssignment] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/courses/${params.id}`);
                setCourse(data);
            } catch (error) {
                console.error('Failed to load course details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [params.id]);

    const handleUpload = async (assignmentId: string) => {
        if (!file) return alert('Please select a file first.');

        setUploadingAssignment(assignmentId);
        const formData = new FormData();
        formData.append('document', file);

        try {
            await api.post(`/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Mission complete! Assignment submitted successfully. 🚀');
            setFile(null);
            // Refresh course details to show updated data
            const { data } = await api.get(`/courses/${params.id}`);
            setCourse(data);
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Upload failed. Check your file format.');
        } finally {
            setUploadingAssignment(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!course) return <div>Course not found 😢</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Course Header */}
            <div className="glass-card p-8 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent border-primary/20 neon-border">
                <div className="inline-block bg-accent/20 text-accent font-bold px-3 py-1 text-xs rounded-full mb-4 border border-accent/20">
                    Grade {course.gradeLevel}
                </div>
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-gray-300 max-w-2xl">{course.description}</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-primary" /> Lessons & Missions
                </h2>

                {course.lessons?.map((lesson: any, i: number) => (
                    <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-2xl border-white/5 relative overflow-hidden group"
                    >
                        <div className="absolute left-0 top-0 w-1 h-full bg-dark group-hover:bg-primary transition-colors" />

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                    <PlayCircle className="text-accent" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{lesson.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed mb-3">{lesson.content}</p>

                                    {lesson.meetLink && (
                                        <a href={lesson.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors">
                                            <Video size={16} /> Join Live Class
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Assignments within Lesson */}
                        {lesson.assignments && lesson.assignments.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-white/10 pl-16">
                                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Missions (Assignments)</h4>
                                {lesson.assignments.map((assignment: any) => {
                                    const isPastDeadline = new Date() > new Date(assignment.deadline);
                                    const hasSubmitted = assignment.submissions?.length > 0;

                                    return (
                                        <div key={assignment.id} className="bg-darker p-4 rounded-xl border border-white/5 mb-3">
                                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                <div className="font-medium text-primary">{assignment.instructions}</div>
                                                <div className="flex items-center gap-2">
                                                    {hasSubmitted ? (
                                                        <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                                                            <CheckCircle size={14} /> SUBMITTED
                                                        </span>
                                                    ) : isPastDeadline ? (
                                                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                                                            DEADLINE PASSED
                                                        </span>
                                                    ) : null}
                                                    <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                                                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
                                                <input
                                                    type="file"
                                                    disabled={isPastDeadline || hasSubmitted}
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                    className="w-full sm:w-auto text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary file:cursor-pointer hover:file:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                                <button
                                                    onClick={() => handleUpload(assignment.id)}
                                                    disabled={uploadingAssignment === assignment.id || !file || isPastDeadline || hasSubmitted}
                                                    className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {uploadingAssignment === assignment.id ? <Loader2 className="animate-spin" size={16} /> : hasSubmitted ? <CheckCircle size={16} /> : <Upload size={16} />}
                                                    {hasSubmitted ? 'Completed' : isPastDeadline ? 'Closed' : 'Submit File'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
