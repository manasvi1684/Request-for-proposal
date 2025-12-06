
'use client';

import { useState } from 'react';

export default function ComparisonView({ rfpId }: { rfpId: number }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchComparison = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/proposals/compare/${rfpId}`);
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Failed to fetch comparison');
            }
            const d = await res.json();
            setData(d);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!data && !loading && !error) {
        return (
            <div className="mt-8 text-center bg-gray-50 p-8 rounded-lg border border-dashed border-gray-300">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Compare?</h3>
                <p className="text-gray-500 mb-4">Compare all proposals by price, delivery, warranty, and AI qualitative analysis.</p>
                <button
                    onClick={fetchComparison}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition shadow-sm font-medium"
                >
                    ✨ Run AI Comparison & Scoring
                </button>
            </div>
        );
    }

    return (
        <section className="glass-panel p-6 border border-emerald-500/20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Proposal Comparison
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">AI-scored evaluation of all vendor proposals.</p>
                </div>
                <button
                    onClick={fetchComparison}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Run AI Comparison
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {loading && (
                <div className="animate-pulse space-y-4">
                    <div className="h-40 bg-gray-700 rounded-xl"></div>
                    <div className="h-60 bg-gray-700 rounded-xl"></div>
                </div>
            )}

            {data && (
                <div className="space-y-8 animate-fade-in">
                    {/* Scores Table */}
                    <div className="overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Vendor</th>
                                    <th className="px-4 py-3 font-semibold">Total Score</th>
                                    <th className="px-4 py-3 font-semibold">Price Score</th>
                                    <th className="px-4 py-3 font-semibold">Tech Score</th>
                                    <th className="px-4 py-3 font-semibold">Trust Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-slate-800/20">
                                {data.proposals.map((p: any) => (
                                    <tr key={p.id} className={p.vendor.id === data.recommendation.recommended_vendor_id ? "bg-indigo-900/20 hover:bg-indigo-900/30 transition-colors" : "hover:bg-white/5 transition-colors"}>
                                        <td className="px-4 py-3 font-medium text-white">
                                            {p.vendor.name}
                                            {p.vendor.id === data.recommendation.recommended_vendor_id && <span className="ml-2 text-emerald-400">🏆</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                {p.calculatedScore}/100
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">{p.priceScore}</td>
                                        <td className="px-4 py-3 text-slate-300">{p.completenessScore}</td> {/* Assuming completenessScore maps to Tech Score */}
                                        <td className="px-4 py-3 text-slate-300">{p.reliabilityScore || 'N/A'}</td> {/* Assuming a new reliabilityScore or similar */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <span className="text-xl">🏆</span> AI Recommendation
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed relative z-10">
                            <p className="text-lg font-medium mb-4">
                                Assuming all data is accurate,
                                <span className="font-bold text-emerald-400 mx-1">
                                    Vendor #{data.recommendation.recommended_vendor_id}
                                </span>
                                appears to be the strongest candidate.
                            </p>
                            <div className="bg-white/10 p-4 rounded border border-indigo-500/20 mb-4">
                                <p className="italic text-slate-300">"{data.recommendation.reasoning}"</p>
                            </div>

                            {data.recommendation.pros_cons && (
                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    {Object.entries(data.recommendation.pros_cons).map(([vendor, details]: [string, any]) => (
                                        <div key={vendor} className="bg-slate-800/50 p-3 rounded-lg shadow-sm text-xs border border-white/10">
                                            <strong className="block mb-2 text-white border-b border-white/10 pb-1">{vendor}</strong>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="text-emerald-400 font-bold block mb-1">PROS</span>
                                                    <ul className="list-disc list-inside text-slate-300">
                                                        {details.pros?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <span className="text-red-500 font-bold block mb-1">CONS</span>
                                                    <ul className="list-disc list-inside text-gray-600">
                                                        {details.cons?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Scoring Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Detailed Scoring Matrix</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completeness</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Score</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.proposals.map((p: any) => (
                                        <tr key={p.id} className={p.vendor.id === data.recommendation.recommended_vendor_id ? "bg-indigo-50" : ""}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                {p.vendor.name}
                                                {p.vendor.id === data.recommendation.recommended_vendor_id && <span className="ml-2 text-indigo-600">🏆</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {p.totalPrice ? `$${p.totalPrice.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {p.deliveryDays ? `${p.deliveryDays} d` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {p.warrantyMonths ? `${p.warrantyMonths} mo` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {p.completenessScore ? `${(p.completenessScore * 100).toFixed(0)}%` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {p.calculatedScore} / 100
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
