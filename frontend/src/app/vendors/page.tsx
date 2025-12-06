
'use client';

import { useEffect, useState } from 'react';

interface Vendor {
    id: number;
    name: string;
    email: string;
    contactInfo: string | null;
    notes: string | null;
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/vendors');
            const data = await res.json();
            setVendors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, contactInfo, notes }),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Failed to create vendor');
            }

            // Reset form and refresh list
            setName('');
            setEmail('');
            setContactInfo('');
            setNotes('');
            fetchVendors();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Vendor Management</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Vendor List */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-200">Existing Vendors</h2>
                    {loading ? (
                        <p className="text-slate-400">Loading...</p>
                    ) : vendors.length === 0 ? (
                        <p className="text-slate-500">No vendors found.</p>
                    ) : (
                        <div className="grid gap-4">
                            {vendors.map((v) => (
                                <div key={v.id} className="glass-card p-5 group hover:border-indigo-500/30">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{v.name}</h3>
                                            <span className="text-slate-400 text-sm block mt-1">{v.email}</span>
                                        </div>
                                    </div>
                                    {v.contactInfo && <p className="text-sm text-slate-400 mt-2 border-l-2 border-indigo-500/50 pl-3">{v.contactInfo}</p>}
                                    {v.notes && <p className="text-sm text-slate-500 mt-3 italic bg-slate-900/50 p-2 rounded">"{v.notes}"</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Vendor Form */}
                <div>
                    <div className="glass-panel p-6 sticky top-24">
                        <h2 className="text-xl font-semibold text-white mb-6">Add Vendor</h2>
                        {error && (
                            <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-3 rounded text-sm mb-4">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full mt-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Vendor Company Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Email *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full mt-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="contact@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Contact Info</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500"
                                    value={contactInfo}
                                    onChange={e => setContactInfo(e.target.value)}
                                    placeholder="Phone, Address, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Notes</label>
                                <textarea
                                    className="w-full mt-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500"
                                    rows={3}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Additional details..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {submitting ? 'Adding...' : 'Add Vendor'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
