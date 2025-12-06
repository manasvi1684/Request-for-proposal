
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Vendor {
    id: number;
    name: string;
}

export default function AddProposalForm({ rfpId }: { rfpId: number }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [vendors, setVendors] = useState<Vendor[]>([]);

    // Form State
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [proposalText, setProposalText] = useState('');
    const [parsing, setParsing] = useState(false);
    const [parsedData, setParsedData] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && vendors.length === 0) {
            fetch('/api/vendors')
                .then(res => res.json())
                .then(data => setVendors(data))
                .catch(err => console.error("Failed to load vendors", err));
        }
    }, [isOpen, vendors.length]);

    const handleParse = async () => {
        if (!proposalText) return;
        setParsing(true);
        setError('');

        try {
            const res = await fetch('/api/proposals/parse', {
                method: 'POST',
                body: JSON.stringify({ rfpId, vendorText: proposalText })
            });
            if (!res.ok) throw new Error('Parsing failed');
            const data = await res.json();
            setParsedData(data);
        } catch (err) {
            setError("Failed to parse proposal text.");
            console.error(err);
        } finally {
            setParsing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendorId || !proposalText || !parsedData) {
            setError("Please select a vendor, enter text, and parse it first.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                body: JSON.stringify({
                    rfpId,
                    vendorId: selectedVendorId,
                    rawText: proposalText,
                    parsedData: parsedData,
                    totalPrice: parsedData.totalPrice,
                    currency: parsedData.currency,
                    deliveryDays: parsedData.deliveryDays || 0,
                    warrantyMonths: parsedData.warrantyMonths,
                    completenessScore: parsedData.completenessScore
                })
            });

            if (!res.ok) throw new Error("Failed to save proposal");

            // Success
            setIsOpen(false);
            setProposalText('');
            setParsedData(null);
            setSelectedVendorId('');
            router.refresh();
        } catch (err) {
            setError("Failed to save proposal.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm btn-secondary flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Proposal
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in relative border border-white/10 shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Add Vendor Proposal</h2>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {error && <div className="bg-red-900/20 text-red-200 border border-red-500/30 p-3 rounded mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Vendor Select */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Select Vendor</label>
                            <select
                                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                                value={selectedVendorId}
                                onChange={(e) => setSelectedVendorId(e.target.value)}
                                required
                            >
                                <option value="" className="bg-slate-900 text-slate-400">-- Choose Vendor --</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id} className="bg-slate-900 text-white">{v.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Proposal Text Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Paste Proposal Text</label>
                            <div className="relative">
                                <textarea
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 min-h-[150px]"
                                    value={proposalText}
                                    onChange={(e) => setProposalText(e.target.value)}
                                    placeholder="Paste the email or document content from the vendor here..."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleParse}
                                    disabled={parsing || !proposalText}
                                    className="absolute bottom-3 right-3 text-xs bg-indigo-600/90 text-white px-3 py-1.5 rounded-md hover:bg-indigo-500 shadow-lg backdrop-blur-sm disabled:opacity-50 transition-all"
                                >
                                    {parsing ? 'Extracting...' : '✨ Extract Data with AI'}
                                </button>
                            </div>
                        </div>

                        {/* Extracted Data Preview */}
                        {parsedData && (
                            <div className="bg-slate-900/40 rounded-xl border border-white/5 p-4 space-y-4">
                                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Extracted Data
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Total Price</label>
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 bg-slate-800 border-slate-700 rounded text-white text-sm"
                                            value={parsedData.totalPrice || ''}
                                            onChange={e => setParsedData({ ...parsedData, totalPrice: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Currency</label>
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 bg-slate-800 border-slate-700 rounded text-white text-sm"
                                            value={parsedData.currency || 'USD'}
                                            onChange={e => setParsedData({ ...parsedData, currency: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Delivery Timeline (Days)</label>
                                    <input
                                        type="number"
                                        className="w-full px-2 py-1 bg-slate-800 border-slate-700 rounded text-white text-sm"
                                        value={parsedData.deliveryDays || ''}
                                        onChange={e => setParsedData({ ...parsedData, deliveryDays: parseFloat(e.target.value) })}
                                    />
                                </div>
                                {parsedData.warrantyMonths !== undefined && (
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Warranty (Months)</label>
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 bg-slate-800 border-slate-700 rounded text-white text-sm"
                                            value={parsedData.warrantyMonths || ''}
                                            onChange={e => setParsedData({ ...parsedData, warrantyMonths: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                )}
                                {parsedData.completenessScore && (
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Completeness</label>
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 bg-slate-800 border-slate-700 rounded text-white text-sm"
                                            value={`${(parsedData.completenessScore * 100).toFixed(0)}%`}
                                            readOnly
                                        />
                                    </div>
                                )}
                                {parsedData.risks && parsedData.risks.length > 0 && (
                                    <div className="mt-2">
                                        <span className="block text-red-500 text-xs font-bold">Risks Detected</span>
                                        <ul className="list-disc list-inside text-xs text-red-600">
                                            {parsedData.risks.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <div className="bg-blue-900/10 p-2 rounded text-xs text-blue-200 border border-blue-500/20">
                                    Review extracted values before saving.
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !parsedData}
                                className="btn-primary"
                            >
                                {submitting ? 'Saving...' : 'Save Proposal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
