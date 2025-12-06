
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Define type based on our API response
interface Rfp {
    id: number;
    title: string;
    status: string;
    createdAt: string;
    _count: {
        proposals: number;
    };
}

export default function RfpListPage() {
    const [rfps, setRfps] = useState<Rfp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/rfps')
            .then((res) => res.json())
            .then((data) => {
                setRfps(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load RFPs', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-bold text-white tracking-tight">RFP Management</h1>
                <Link
                    href="/rfps/new"
                    className="btn-primary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New RFP
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-400">Loading RFPs...</div>
            ) : rfps.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                    <p className="text-slate-400 text-lg mb-4">No RFPs found in workspace.</p>
                    <Link
                        href="/rfps/new"
                        className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                    >
                        Get started by creating your first RFP
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rfps.map((rfp) => (
                        <div
                            key={rfp.id}
                            className="glass-card p-6 flex flex-col h-full hover:border-indigo-500/40 relative group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                    {rfp.title}
                                </h2>
                                <span
                                    className={`text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wider border ${rfp.status === 'DRAFT'
                                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                                        : rfp.status === 'SENT'
                                            ? 'bg-blue-900/30 text-blue-300 border-blue-800/30'
                                            : rfp.status === 'EVALUATION'
                                                ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700/30'
                                                : 'bg-emerald-900/20 text-emerald-300 border-emerald-800/30'
                                        }`}
                                >
                                    {rfp.status}
                                </span>
                            </div>
                            <div className="text-sm text-slate-400 mb-6 font-mono">
                                Created on {new Date(rfp.createdAt).toLocaleDateString()}
                            </div>
                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    {rfp._count.proposals} Proposals
                                </span>
                                <Link
                                    href={`/rfps/${rfp.id}`}
                                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                                >
                                    View Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
