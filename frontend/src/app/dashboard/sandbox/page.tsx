'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Code, LayoutTemplate } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_CODE = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: sans-serif;
      text-align: center;
      padding-top: 50px;
      color: #333;
    }
    h1 { color: #6C63FF; }
    button {
      background: #6C63FF;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover { background: #5b54d6; }
  </style>
</head>
<body>
  <h1>Hello Hacker!</h1>
  <p>Write your code below and hit Run!</p>
  <button onclick="showAlert()">Click Me</button>

  <script>
    function showAlert() {
      alert("Hello from your Code Sandbox! 🚀");
    }
  </script>
</body>
</html>`;

export default function CodeSandboxPage() {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [outputUrl, setOutputUrl] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Initial render
    useEffect(() => {
        runCode();
    }, []);

    const runCode = () => {
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
    };

    return (
        <div className="h-[85vh] flex flex-col pt-2 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-4 px-2">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Code className="text-primary" /> Hacker Sandbox
                    </h1>
                    <p className="text-sm text-gray-400">Write HTML, CSS, and JS and see it run instantly.</p>
                </div>
                <button
                    onClick={runCode}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                >
                    <Play size={18} fill="currentColor" /> Run Code
                </button>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Editor Half */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-1/2 rounded-2xl overflow-hidden glass-card border border-white/10 flex flex-col">
                    <div className="bg-darker px-4 py-2 border-b border-white/10 flex items-center text-sm font-bold text-gray-400">
                        index.html
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="html"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                </motion.div>

                {/* Preview Half */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="w-1/2 rounded-2xl overflow-hidden glass-card border border-white/10 flex flex-col bg-white">
                    <div className="bg-darker px-4 py-2 border-b border-white/10 flex items-center text-sm font-bold text-gray-400 gap-2">
                        <LayoutTemplate size={16} /> Live Preview Output
                    </div>
                    <iframe
                        ref={iframeRef}
                        src={outputUrl}
                        sandbox="allow-scripts allow-modals"
                        title="Code Output"
                        className="w-full h-full bg-white border-0"
                    />
                </motion.div>
            </div>
        </div>
    );
}
