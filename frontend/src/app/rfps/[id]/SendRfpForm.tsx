
'use client';

import { useState, useEffect } from 'react';

interface Vendor {
    id: number;
    name: string;
    email: string;
}

export default function SendRfpForm({ rfpId, currentStatus }: { rfpId: number, currentStatus: string }) {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<Set<number>>(new Set());
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState(''); // Added message state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => {
                setVendors(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const toggleVendor = (id: number) => {
        const newSet = new Set(selectedVendors);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedVendors(newSet);
    };

    const handleSelectAll = () => {
        if (selectedVendors.size === vendors.length) {
            setSelectedVendors(new Set());
        } else {
            setSelectedVendors(new Set(vendors.map(v => v.id)));
        }
    };

    const handleSend = async () => {
        // If nothing selected, assume intent is to send to ALL vendors
        let targetIds = Array.from(selectedVendors);

        if (selectedVendors.size === 0) {
            const confirmSendAll = window.confirm(`No specific vendors selected. Send to ALL ${vendors.length} vendors?`);
            if (!confirmSendAll) return;
            targetIds = vendors.map(v => v.id);
            // Visually update selection to match action
            setSelectedVendors(new Set(targetIds));
        }

        if (targetIds.length === 0) return;

        setSending(true);
        setMessage('');

        try {
            const res = await fetch(`/api/rfps/${rfpId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendorIds: targetIds })
            });

            if (!res.ok) throw new Error("Failed to send emails");

            const data = await res.json();
            setMessage(`Success! Sent to ${data.sentCount} vendor(s).`);
            setSelectedVendors(new Set()); // Clear selection after success
        } catch (err) {
            setMessage("Error: Failed to send emails.");
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="glass-panel p-6 border border-indigo-500/20">
            <h2 className="text-lg font-semibold mb-2 text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Distribute to Vendors
            </h2>
            <p className="text-sm text-slate-400 mb-6">
                Email this RFP to your registered vendors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <div className="flex-1 w-full">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Current Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border
                        ${currentStatus === 'SENT' ? 'bg-blue-900/20 text-blue-300 border-blue-800/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {currentStatus}
                    </span>
                </div>

                <button
                    onClick={handleSend}
                    disabled={sending || currentStatus === 'SENT'}
                    className="w-full sm:w-auto btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                >
                    {sending ? (
                        <>Sending...</>
                    ) : currentStatus === 'SENT' ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Sent
                        </>
                    ) : (
                        <>Send to All Vendors</>
                    )}
                </button>
            </div>
            {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.includes('Success') ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-800/30' : 'bg-red-900/20 text-red-300 border border-red-800/30'}`}>
                    {message}
                </div>
            )}

            <div className="mb-4 mt-6">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm font-medium text-gray-300">Select Vendors to Email:</h3>
                    <button
                        onClick={handleSelectAll}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                        type="button"
                    >
                        {selectedVendors.size === vendors.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                {loading ? <p className="text-slate-400">Loading vendors...</p> : (
                    <div className="max-h-40 overflow-y-auto border border-slate-700 rounded p-2 bg-slate-800/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {vendors.map(v => (
                            <label key={v.id} className="flex items-center space-x-2 p-2 hover:bg-slate-700/50 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedVendors.has(v.id)}
                                    onChange={() => toggleVendor(v.id)}
                                    className="rounded text-blue-500 focus:ring-blue-500 bg-slate-600 border-slate-500"
                                />
                                <span className="text-sm">
                                    <span className="font-medium">{v.name}</span> <span className="text-gray-500 text-xs">({v.email})</span>
                                </span>
                            </label>
                        ))}
                    </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                    {selectedVendors.size} selected
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSend}
                    disabled={sending}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {sending ? 'Sending...' : (selectedVendors.size === 0 ? 'Send to ALL Vendors' : `Send to ${selectedVendors.size} Selected`)}
                    {!sending && <span className="text-xs opacity-75">➤</span>}
                </button>
            </div>
        </div>
    );
}
