
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewRfpPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    // AI Generated fields
    const [structuredData, setStructuredData] = useState<any>(null);

    const handleGenerate = async () => {
        if (!description) {
            setError("Please enter a description first.");
            return;
        }
        setGenerating(true);
        setError('');

        try {
            const res = await fetch('/api/rfps/from-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: description })
            });

            if (!res.ok) throw new Error("AI generation failed");

            const data = await res.json();
            setStructuredData(data);

            // Auto-fill fields if empty and present in AI data
            if (!title && data.title) setTitle(data.title);
            // We could also autofill budget, etc. if we had individual state for them, 
            // but for now we'll save them as part of the structured JSON blob primarily,
            // or extract them in the submit handler.

        } catch (err) {
            console.error(err);
            setError("Failed to generate structure from AI.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // If we have structured data, use its values for explicit DB columns if available
        const budget = structuredData?.budget;
        const currency = structuredData?.currency || 'USD';
        // date parsing could be complex, skipping for now or doing simple check

        try {
            const res = await fetch('/api/rfps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    budget: budget,
                    currency: currency,
                    // Save the full AI JSON structure
                    structuredData: structuredData ? JSON.stringify(structuredData) : '{}'
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to create RFP');
            }

            const rfp = await res.json();
            router.push(`/rfps/${rfp.id}`);
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-6">Create New RFP</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Inputs */}
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                                    What do you need? (Natural Language)
                                </label>
                                <p className="text-xs text-slate-400 mb-2">
                                    Describe your requirements clearly (items, quantities, budget, timeline).
                                </p>
                                <textarea
                                    id="description"
                                    rows={10}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 align-top"
                                    placeholder="e.g. I need to procure 50 ergonomic office chairs and 20 standing desks. Budget is $30k. Need them delivered to NYC office by next month. 5 year warranty required."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                                <div className="mt-3 text-right">
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={generating || !description}
                                        className="text-sm bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg hover:bg-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2 ml-auto shadow-sm"
                                    >
                                        {generating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating...
                                            </>
                                        ) : (
                                            <>Generate Structure with AI</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
                                    RFP Title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Will be auto-filled by AI"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Save & Publish RFP'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: AI Preview */}
                <div>
                    <div className="h-full glass-card p-6 border border-dashed border-slate-700/50 bg-slate-900/20">
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            AI Structured Preview
                        </h3>
                        {structuredData ? (
                            <div className="space-y-4 text-sm animate-fade-in">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 shadow-inner">
                                    <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">Calculated Budget</span>
                                    <span className="font-mono text-lg text-emerald-400">
                                        {structuredData.budget ? `${structuredData.budget} ${structuredData.currency}` : 'N/A'}
                                    </span>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 shadow-inner">
                                    <span className="text-slate-400 block text-xs uppercase tracking-wider mb-2">Items Identified</span>
                                    {structuredData.items && structuredData.items.length > 0 ? (
                                        <ul className="space-y-2">
                                            {structuredData.items.map((item: any, idx: number) => (
                                                <li key={idx} className="flex justify-between items-start border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                    <span className="font-medium text-slate-200">{item.quantity}x {item.name}</span>
                                                    <span className="text-xs text-slate-500 max-w-[120px] text-right">{item.specs}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <span className="text-slate-500">None</span>}
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 shadow-inner">
                                    <span className="text-slate-400 block text-xs uppercase tracking-wider mb-2">Key Requirements</span>
                                    <div className="space-y-2 text-slate-300">
                                        {structuredData.delivery_requirements && (
                                            <div className="flex gap-2 text-xs"><span className="text-indigo-400 shrink-0">Delivery:</span> <span>{structuredData.delivery_requirements}</span></div>
                                        )}
                                        {structuredData.warranty_requirements && (
                                            <div className="flex gap-2 text-xs"><span className="text-indigo-400 shrink-0">Warranty:</span> <span>{structuredData.warranty_requirements}</span></div>
                                        )}
                                        {structuredData.payment_terms && (
                                            <div className="flex gap-2 text-xs"><span className="text-indigo-400 shrink-0">Payment:</span> <span>{structuredData.payment_terms}</span></div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <details className="text-xs group">
                                        <summary className="cursor-pointer text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2">
                                            <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            View Raw JSON
                                        </summary>
                                        <pre className="mt-3 p-3 bg-slate-950 rounded-lg overflow-x-auto text-indigo-300 font-mono border border-indigo-500/10">
                                            {JSON.stringify(structuredData, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center p-6">
                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <p className="text-slate-400 font-medium">AI Agent Ready</p>
                                <p className="text-xs mt-2 max-w-[200px]">Enter your request on the left and I'll structure it for you instantly.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
