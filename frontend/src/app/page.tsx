'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative overflow-hidden w-full bg-dark">
      {/* Background Particles/Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* Navbar Placeholder */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
        >
          Happy Hackers
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex space-x-6"
        >
          <Link href="/login" className="hover:text-accent transition">Login</Link>
          <Link href="/register" className="px-5 py-2 bg-primary hover:bg-primary/80 neon-border rounded-full font-medium transition-all shadow-[0_0_15px_rgba(108,99,255,0.4)] hover:shadow-[0_0_25px_rgba(108,99,255,0.6)]">
            Join the Club
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight leading-tight">
            From <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-200">Zero</span> to <span className="animated-gradient-text">Hero</span>
          </h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Happy Hackers Make Coding a Blast. Interactive AI-powered learning for Grade 1-8 students.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-full text-lg font-bold shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:shadow-[0_0_50px_rgba(0,245,255,0.5)] transition-all hover:-translate-y-1 inline-block">
              Start Hacking Now 🚀
            </Link>
            <Link href="#courses" className="px-8 py-4 rounded-full text-lg font-bold border border-white/20 hover:bg-white/10 transition-all text-white backdrop-blur-sm">
              Explore Courses
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating 3D/Code elements (Abstract representation) */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:block absolute right-[10%] top-[30%] w-64 h-64 glass-card p-6 rounded-2xl border-accent/30 neon-border -z-10 bg-dark/40"
        >
          <div className="text-accent font-mono text-sm overflow-hidden opacity-80">
            <p>class HappyHacker:</p>
            <p className="ml-4">def __init__(self):</p>
            <p className="ml-8 text-primary">self.skills = ["Python", "AI"]</p>
            <p className="ml-4">def learn(self):</p>
            <p className="ml-8 text-green-400">print("Having a blast!")</p>
            <p className="ml-8 text-primary mt-2">return Hero()</p>
            <div className="w-full h-1 bg-accent/20 mt-4 rounded">
              <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3, repeat: Infinity }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:block absolute left-[10%] bottom-[20%] w-48 h-48 glass-card border-primary/30 p-4 rounded-full flex items-center justify-center -z-10 bg-dark/40 backdrop-blur-lg"
        >
          <div className="text-center font-bold text-3xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-purple-500">
              100%<br />FUN
            </span>
          </div>
        </motion.div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-24 px-4 relative z-10 w-full max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Master the <span className="text-accent">Future</span></h2>
          <p className="text-gray-400 text-lg">Interactive live classes for grades 1-8</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Python Magic", desc: "Build real games and apps using Python.", color: "from-blue-500 to-cyan-400", delay: 0 },
            { title: "Web Creation", desc: "Design beautiful sites with HTML & CSS.", color: "from-pink-500 to-rose-400", delay: 0.2 },
            { title: "Scratch Adventures", desc: "Drag, drop, and animate your imagination.", color: "from-green-400 to-emerald-500", delay: 0.4 },
            { title: "AI Explorers", desc: "Learn basics of Artificial Intelligence.", color: "from-purple-500 to-primary", delay: 0.6 },
          ].map((course, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: course.delay, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass-card p-8 rounded-3xl relative overflow-hidden group border border-white/5 hover:border-white/20 transition-all bg-white/[0.02]"
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${course.color} rounded-full blur-[50px] opacity-20 group-hover:opacity-60 transition-opacity`} />
              <h3 className="text-2xl font-bold mb-4">{course.title}</h3>
              <p className="text-gray-400 mb-8">{course.desc}</p>
              <Link href="/register" className="inline-flex items-center text-accent font-semibold group-hover:underline">
                Explore Course
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">What Parents <span className="text-primary">Say</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah M.", role: "Parent of 5th Grader", text: "My son absolutely loves the live classes. He built his first Python game in just 3 weeks!" },
              { name: "David T.", role: "Parent of 3rd Grader", text: "The interactive platform and amazing teachers make learning to code feel like playing a game." },
              { name: "Elena R.", role: "Parent of 7th Grader", text: "The curriculum is perfectly paced. She's already diving into AI tools with confidence." }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-8 glass-card border-t border-primary/20 bg-gradient-to-b from-white/5 to-transparent text-left rounded-2xl relative"
              >
                <div className="text-4xl text-primary opacity-50 absolute top-4 right-6">"</div>
                <p className="text-gray-300 italic mb-6 relative z-10">{t.text}</p>
                <div className="font-bold text-lg">{t.name}</div>
                <div className="text-sm text-gray-500">{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 bg-black/40">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 flex-col md:flex-row gap-4">
          <div className="text-xl font-bold text-white">Happy <span className="text-primary">Hackers</span> Clubs</div>
          <p>© 2026 Happy Hackers Clubs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
