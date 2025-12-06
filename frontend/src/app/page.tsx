'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ rfps: 0, vendors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/rfps').then(res => res.json()),
      fetch('/api/vendors').then(res => res.json())
    ]).then(([rfps, vendors]) => {
      setStats({
        rfps: rfps.length,
        vendors: vendors.length
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen text-white selection:bg-indigo-500/30 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 rounded-md px-2 py-0.5 text-xs font-bold tracking-wide">AI</div>
          <span className="font-bold text-lg tracking-tight text-white/90">ProcureFlow</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-slate-400">
          <Link href="/rfps" className="hover:text-white transition-colors">RFPs</Link>
          <Link href="/vendors" className="hover:text-white transition-colors">Vendors</Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 flex-1 flex flex-col justify-center pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Intelligent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Procurement</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              This Request for Proposals (RFP) Application is a comprehensive, AI-driven platform designed to streamline your procurement process. From generating structured requirements to analyzing complex vendor bids, this tool empowers you to make faster, data-backed decisions with ease.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/rfps/new"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create New RFP
              </Link>
              <Link
                href="/rfps"
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition-all border border-white/10"
              >
                Visit Dashboard
              </Link>
            </div>
          </div>

          {/* Decorative element or empty space for the image in the screenshot */}
          <div className="hidden lg:block relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-auto pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <h3 className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Total RFPs Managed</h3>
            </div>
            <div className="text-4xl font-bold font-mono text-white">
              {loading ? '-' : stats.rfps}
              <span className="text-sm text-emerald-400 ml-3 font-sans font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">+12% vs last month</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <h3 className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Active Vendors</h3>
            </div>
            <div className="text-4xl font-bold font-mono text-white">
              {loading ? '-' : stats.vendors}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <h3 className="text-slate-400 text-xs uppercase tracking-widest font-semibold">System Status</h3>
            </div>
            <div className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Operational
            </div>
            <p className="text-xs text-slate-500 mt-1">All systems normal</p>
          </div>
        </div>
      </main>
    </div>
  );
}
