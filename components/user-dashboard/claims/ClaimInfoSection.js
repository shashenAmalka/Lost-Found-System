'use client';
import { FileText, MapPin, Calendar, Tag, Image, Clock } from 'lucide-react';

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClaimInfoSection({ claim }) {
    const lost = claim.lostItemId || {};
    const found = claim.foundItemId || {};

    return (
        <div className="space-y-6">
            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lost Item */}
                <div className="p-5 rounded-[16px] space-y-3 bg-red-50 border border-red-100">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">Lost Item</span>
                    <h4 className="text-[#1C2A59] font-bold text-sm">{lost.title || '—'}</h4>
                    <div className="space-y-1.5 text-xs text-[#3E4A56] font-medium">
                        {lost.category && <p className="flex items-center gap-1.5"><Tag size={11} /> {lost.category}</p>}
                        {lost.possibleLocation && <p className="flex items-center gap-1.5"><MapPin size={11} /> {lost.possibleLocation}</p>}
                        {lost.dateLost && <p className="flex items-center gap-1.5"><Calendar size={11} /> Lost {formatDate(lost.dateLost)}</p>}
                    </div>
                </div>

                {/* Found Item */}
                <div className="p-5 rounded-[16px] space-y-3 bg-green-50 border border-green-100">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600">Found Item</span>
                    <h4 className="text-[#1C2A59] font-bold text-sm">{found.title || '—'}</h4>
                    <div className="space-y-1.5 text-xs text-[#3E4A56] font-medium">
                        {found.category && <p className="flex items-center gap-1.5"><Tag size={11} /> {found.category}</p>}
                        {found.locationFound && <p className="flex items-center gap-1.5"><MapPin size={11} /> {found.locationFound}</p>}
                        {found.dateFound && <p className="flex items-center gap-1.5"><Calendar size={11} /> Found {formatDate(found.dateFound)}</p>}
                    </div>
                    {found.photoUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                            <img src={found.photoUrl} alt="Found item" className="w-full h-32 object-cover" />
                        </div>
                    )}
                </div>
            </div>

            {/* Ownership Proof */}
            <div className="p-5 rounded-[16px] space-y-4 bg-white border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-[#3E4A56]">
                    <FileText size={13} /> Ownership Proof Submitted
                </h4>

                <div className="space-y-3">
                    {claim.ownershipExplanation && (
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ownership Explanation</span>
                            <p className="text-sm mt-1 text-[#1C2A59] font-medium">{claim.ownershipExplanation}</p>
                        </div>
                    )}
                    {claim.hiddenDetails && (
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Identifying Marks</span>
                            <p className="text-sm mt-1 text-[#1C2A59] font-medium">{claim.hiddenDetails}</p>
                        </div>
                    )}
                    {claim.exactColorBrand && (
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Exact Color / Brand</span>
                            <p className="text-sm mt-1 text-[#1C2A59] font-medium">{claim.exactColorBrand}</p>
                        </div>
                    )}
                    {claim.proofUrl && (
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Uploaded Proof</span>
                            <div className="mt-1 rounded-lg overflow-hidden border border-gray-200 inline-block">
                                <img src={claim.proofUrl} alt="Proof" className="max-h-40 object-cover" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-5 pt-3 text-xs flex-wrap border-t border-gray-100 text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Clock size={11} /> Submitted {formatDate(claim.createdAt)}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> Updated {formatDate(claim.updatedAt)}</span>
                </div>
            </div>
        </div>
    );
}
