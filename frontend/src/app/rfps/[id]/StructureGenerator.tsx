"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StructureGeneratorProps {
    rfpId: number;
    description: string;
    existingData: string; // This will now be parsed into an object
}

export default function StructureGenerator({ rfpId, description, existingData: initialExistingData }: StructureGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(initialExistingData ? JSON.parse(initialExistingData) : null); // Parse initial data
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Generate JSON from text
            const res = await fetch('/api/rfps/from-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: description }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Generation failed');
            }

            const generatedStructure = await res.json();
            const jsonString = JSON.stringify(generatedStructure, null, 2);

            // 2. Save to DB
            const updateRes = await fetch(`/api/rfps/${rfpId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ structuredData: jsonString }),
            });

            if (!updateRes.ok) {
                const errorData = await updateRes.json();
                throw new Error(errorData.message || 'Failed to save structure');
            }

            setData(generatedStructure); // Store the parsed object
            router.refresh(); // Refresh server components to reflect changes

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate/save structure.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 border border-indigo-500/20">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        AI Structure Analysis
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Extract structured data from your description to auto-evaluate proposals.
                    </p>
                </div>
                {!data && ( // Use 'data' state instead of 'existingData' prop for conditional rendering
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin">✨</span> Analyzing...
                            </>
                        ) : (
                            <>
                                ✨ Generate Structure
                            </>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            {data ? ( // Use 'data' state here
                <div className="bg-slate-900/40 rounded-xl border border-white/5 p-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Analysis Complete
                        </span>
                        <button onClick={handleGenerate} disabled={loading} className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                            Re-generate
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
                            <div>
                                <span className="block text-slate-500 text-xs uppercase tracking-wide">Budget</span>
                                <span className="text-slate-200 font-mono text-lg">{data.budget ? `${data.budget} ${data.currency}` : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 text-xs uppercase tracking-wide mb-1">Items</span>
                                <ul className="space-y-1">
                                    {data.items?.map((item: any, i: number) => (
                                        <li key={i} className="text-slate-300 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                                            {item.quantity}x {item.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <span className="block text-slate-500 text-xs uppercase tracking-wide mb-1">Requirements</span>
                                <div className="space-y-1 text-slate-300">
                                    {data.delivery_requirements && <p><span className="text-slate-500">Delivery:</span> {data.delivery_requirements}</p>}
                                    {data.warranty_requirements && <p><span className="text-slate-500">Warranty:</span> {data.warranty_requirements}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5">
                        <details className="text-xs">
                            <summary className="cursor-pointer text-slate-500 hover:text-indigo-400 transition-colors">View Raw JSON</summary>
                            <pre className="mt-2 p-2 bg-slate-950 rounded text-slate-400 overflow-x-auto border border-white/5">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 bg-slate-900/20 rounded-xl border border-dashed border-slate-700/50">
                    <p className="text-slate-500 text-sm">No structured data generated yet.</p>
                </div>
            )}
        </div>
    );
}
