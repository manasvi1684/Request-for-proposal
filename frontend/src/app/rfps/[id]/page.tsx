
import prisma from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddProposalForm from './AddProposalForm';
import SendRfpForm from './SendRfpForm';
import StructureGenerator from './StructureGenerator';
import ComparisonView from './ComparisonView';

export default async function RfpDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const rfpId = parseInt(id);

    if (isNaN(rfpId)) {
        return notFound();
    }

    const rfp = await prisma.rfp.findUnique({
        where: { id: rfpId },
        include: {
            proposals: {
                include: { vendor: true },
            },
        },
    });

    if (!rfp) {
        return notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <Link href="/rfps" className="text-slate-400 hover:text-white mb-4 inline-flex items-center gap-1 transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to RFPs
                </Link>
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{rfp.title}</h1>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border
                        ${rfp.status === 'DRAFT' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                            rfp.status === 'SENT' ? 'bg-blue-900/20 text-blue-300 border-blue-800/30' :
                                'bg-emerald-900/20 text-emerald-300 border-emerald-800/30'}`}>
                        {rfp.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Original Request */}
                    <section className="glass-panel p-6">
                        <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Original Request
                        </h2>
                        <div className="prose max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {rfp.description}
                        </div>
                    </section>

                    {/* Structured Data (AI) */}
                    <StructureGenerator
                        rfpId={rfp.id}
                        description={rfp.description}
                        existingData={rfp.structuredData}
                    />

                    <SendRfpForm rfpId={rfp.id} currentStatus={rfp.status} />

                    {/* Proposals List */}
                    <section className="glass-panel p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Proposals ({rfp.proposals.length})
                            </h2>
                            <AddProposalForm rfpId={rfp.id} />
                        </div>

                        {rfp.proposals.length === 0 ? (
                            <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-700/50">
                                <p className="text-slate-500 italic">No proposals received yet.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {rfp.proposals.map((p: any) => (
                                    <li key={p.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-center">
                                            <div className="font-medium text-slate-200">{p.vendor.name}</div>
                                            <div className="text-sm font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{p.totalPrice ? `$${p.totalPrice}` : 'N/A'}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Comparison Container */}
                    <ComparisonView rfpId={rfp.id} />
                </div>

                <div className="md:col-span-1 space-y-6">
                    {/* Meta Card */}
                    <section className="glass-card p-6 sticky top-24">
                        <h3 className="font-semibold text-indigo-300 mb-4 uppercase text-xs tracking-widest">RFP Details</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Created</span>
                                <span className="text-slate-200 font-mono">{new Date(rfp.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Budget</span>
                                <span className="text-slate-200 font-medium">{rfp.budget ? `${rfp.budget} ${rfp.currency}` : 'Not specific'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Deadline</span>
                                <span className="text-slate-200">{rfp.deliveryDeadline ? new Date(rfp.deliveryDeadline).toLocaleDateString() : 'None'}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
