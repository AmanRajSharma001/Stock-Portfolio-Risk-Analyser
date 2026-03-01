"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, Loader2, BarChart2, Paperclip, ImageIcon } from 'lucide-react'
import axios from 'axios'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

interface Message {
    role: 'user' | 'model';
    text: string;
    chartConfig?: any;
    image?: string; // Base64 encoded image string or URL
}
const PRESET_COLORS = ['#f43f5e', '#d946ef', '#f59e0b', '#3b82f6', '#10b981'];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hello! I am the institutional Risk Intelligence AI. How can I assist you with your portfolio today?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;

        const userMsg: Message = { role: 'user', text: input, image: selectedImage || undefined }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        const sentImage = selectedImage
        setSelectedImage(null)
        setIsLoading(true)

        try {
            // Strip the base64 string from history payloads to save bandwidth and prevent 413 Payload Too Large on subsequent messages
            const strippedHistory = messages.map(m => ({ role: m.role, text: m.text }));

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.post(`${API_URL}/api/chat`, {
                message: userMsg.text,
                image: sentImage,
                history: strippedHistory
            });

            if (res.data.success) {
                let aiReply = res.data.data.reply;
                let parsedChart = undefined;

                // Detect if the AI embedded a JSON chart config at the end of the text
                const jsonMatch = aiReply.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        const config = JSON.parse(jsonMatch[1]);
                        if (config.type === 'CHART' && config.data) {
                            parsedChart = config;
                            // Remove the JSON block from the text shown to the user
                            aiReply = aiReply.replace(/```json\n[\s\S]*?\n```/, '').trim();
                        }
                    } catch (e) {
                        console.warn("Found JSON block but failed to parse chart config:", e);
                    }
                }

                // Detect markdown images from Pollinations AI
                const mdImageMatch = aiReply.match(/!\[.*?\]\((.*?)\)/);
                let generatedImageUrl = undefined;
                if (mdImageMatch && mdImageMatch[1]) {
                    generatedImageUrl = mdImageMatch[1];
                    // Clean up the raw markdown from the text
                    aiReply = aiReply.replace(/!\[.*?\]\(.*?\)/, '').trim();
                }

                setMessages(prev => [...prev, {
                    role: 'model',
                    text: aiReply,
                    chartConfig: parsedChart,
                    image: generatedImageUrl
                }])
            } else {
                setMessages(prev => [...prev, { role: 'model', text: "I encountered an error processing that request." }])
            }
        } catch (e) {
            console.error("Chat error", e)
            setMessages(prev => [...prev, { role: 'model', text: "My connection to the API seems to be broken right now." }])
        } finally {
            setIsLoading(false)
        }
    }

    // Helper render function for inline charts
    const renderChart = (config: any) => {
        if (!config || !config.data || !config.chartType) return null;

        return (
            <div className="mt-3 bg-neutral-900 rounded-xl p-3 border border-neutral-700 w-full h-[250px] flex flex-col">
                <div className="text-xs font-bold text-neutral-400 mb-2 truncate flex items-center gap-2">
                    <BarChart2 className="w-3 h-3 text-fuchsia-400" />
                    {config.title || 'Data Visualization'}
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        {config.chartType === 'bar' ? (
                            <BarChart data={config.data}>
                                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px', fontSize: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                <Bar dataKey="value" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : config.chartType === 'line' ? (
                            <LineChart data={config.data}>
                                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px', fontSize: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                <Line type="monotone" dataKey="value" stroke="#d946ef" strokeWidth={2} dot={{ r: 3, fill: '#d946ef' }} />
                            </LineChart>
                        ) : config.chartType === 'pie' ? (
                            <PieChart>
                                <Pie data={config.data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                                    {config.data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={PRESET_COLORS[index % PRESET_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px', fontSize: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                            </PieChart>
                        ) : (
                            <div className="text-xs text-neutral-500 flex h-full items-center justify-center">Unsupported chart format</div>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-fuchsia-500/20 rounded-lg">
                                    <Bot className="w-5 h-5 text-fuchsia-400" />
                                </div>
                                <span className="font-bold">Risk Intelligence Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                        ? 'bg-rose-500 text-white rounded-tr-sm'
                                        : 'bg-neutral-800 text-neutral-200 rounded-tl-sm border border-neutral-700/50'
                                        }`}>

                                        {/* Render Uploaded / Generated Images in Chat */}
                                        {msg.image && (
                                            <div className="mb-2 rounded-xl overflow-hidden border border-white/20 relative">
                                                <img src={msg.image} alt="Attachment" className="w-full h-auto max-h-[250px] object-cover" />
                                            </div>
                                        )}

                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                        {msg.chartConfig && renderChart(msg.chartConfig)}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-neutral-800 rounded-2xl rounded-tl-sm p-3 border border-neutral-700/50">
                                        <Loader2 className="w-4 h-4 text-fuchsia-400 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800">
                            {/* Image Preview Area */}
                            {selectedImage && (
                                <div className="mb-3 relative inline-block">
                                    <div className="w-16 h-16 rounded-xl border-2 border-fuchsia-500 overflow-hidden relative shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <button onClick={() => setSelectedImage(null)} className="p-1 bg-neutral-900/80 rounded-full hover:bg-neutral-800 text-white transition">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="relative flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-xl text-neutral-400 hover:text-fuchsia-400 transition"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>

                                <textarea
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-rose-500 transition resize-none h-[46px] flex items-center custom-scrollbar"
                                    placeholder="Ask about your portfolio..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || (!input.trim() && !selectedImage)}
                                    className="absolute right-2 p-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg text-white disabled:opacity-50 transition"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-500/30 text-white hover:shadow-fuchsia-500/50 transition-shadow"
                >
                    <MessageSquare className="w-6 h-6" />
                </motion.button>
            )}
        </div>
    )
}
