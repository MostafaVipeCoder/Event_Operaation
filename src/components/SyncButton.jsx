import { useState } from 'react';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, X, Info, Plus, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { syncEventFromCloud } from '../lib/api';

export default function SyncButton({ eventId, onSyncComplete, className = "" }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null); // 'success' | 'error' | null
    const [previewData, setPreviewData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [stats, setStats] = useState(null);

    const startPreview = async () => {
        try {
            setIsSyncing(true);
            setSyncStatus(null);
            
            const result = await syncEventFromCloud(eventId, true);
            setPreviewData(result.changes);
            setStats(result.stats);
            setShowPreview(true);
        } catch (error) {
            console.error('Preview failed:', error);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus(null), 5000);
        } finally {
            setIsSyncing(false);
        }
    };

    const confirmSync = async () => {
        try {
            setIsSyncing(true);
            setShowPreview(false);

            const result = await syncEventFromCloud(eventId, false);
            
            setSyncStatus('success');
            if (onSyncComplete) onSyncComplete(result.stats);

            setTimeout(() => {
                setSyncStatus(null);
                setPreviewData(null);
            }, 3000);
        } catch (error) {
            console.error('Sync failed:', error);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus(null), 5000);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={startPreview}
                disabled={isSyncing}
                title="Sync With Sheet"
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold transition-premium active:scale-95 disabled:opacity-50 ${syncStatus === 'success'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : syncStatus === 'error'
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-white border text-slate-600 hover:bg-slate-50 border-slate-200'
                    } ${className}`}
            >
                {isSyncing ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : syncStatus === 'success' ? (
                    <CheckCircle2 size={16} />
                ) : syncStatus === 'error' ? (
                    <AlertCircle size={16} />
                ) : (
                    <RefreshCw size={16} />
                )}
            </button>

            {/* Sync Preview Modal */}
            {showPreview && previewData && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 text-[#1a27c9] mb-1">
                                    <div className="w-8 h-8 rounded-xl bg-[#1a27c9]/10 flex items-center justify-center">
                                        <Info size={18} />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight uppercase">Sync Preview</h2>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-11">Review changes before applying to platform</p>
                            </div>
                            <button 
                                onClick={() => setShowPreview(false)}
                                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8" dir="rtl">
                            {/* Stats Summary Bubble */}
                            <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <StatBadge label="إضافات جديدة" count={stats?.experts?.added + stats?.companies?.added} color="text-emerald-600 bg-emerald-50" icon={<Plus size={12} />} />
                                <StatBadge label="تعديلات" count={stats?.experts?.updated + stats?.companies?.updated} color="text-amber-600 bg-amber-50" icon={<Edit3 size={12} />} />
                            </div>

                            <ChangeGroup 
                                title="الموجهين (Mentors)" 
                                items={previewData.experts} 
                                icon={<Plus size={16} className="text-emerald-500" />}
                            />
                            <ChangeGroup 
                                title="الشركات (Startups)" 
                                items={previewData.companies} 
                                icon={<Edit3 size={16} className="text-amber-500" />}
                            />

                            {(stats?.experts?.added === 0 && stats?.experts?.updated === 0 && 
                              stats?.companies?.added === 0 && stats?.companies?.updated === 0) && (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border border-dashed border-slate-200">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">لا توجد تغييرات جديدة في الشيت مقارنة بالمنصة</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center gap-4">
                            <button 
                                onClick={() => setShowPreview(false)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={confirmSync}
                                disabled={isSyncing}
                                className="flex-[2] py-4 bg-[#1a27c9] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-[#0d0e0e] hover:shadow-none transition-premium flex items-center justify-center gap-2"
                            >
                                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                <span>تأكيد المزامنة وحفظ البيانات</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatBadge({ label, count, color, icon }) {
    if (count === 0) return null;
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${color}`}>
            {icon}
            <span>{count} {label}</span>
        </div>
    );
}

function ChangeGroup({ title, items, icon }) {
    if (items.toAdd.length === 0 && items.toUpdate.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                {icon}
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0d0e0e]">{title}</h3>
            </div>
            
            <div className="space-y-3">
                {items.toAdd.map((item, idx) => (
                    <div key={`add-${idx}`} className="flex items-center gap-3 p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-xl group transition-premium hover:bg-emerald-50">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                            <Plus size={14} />
                        </div>
                        <span className="text-sm font-bold text-emerald-900">{item.name}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full mr-auto">New</span>
                    </div>
                ))}

                {items.toUpdate.map((item, idx) => (
                    <div key={`upd-${idx}`} className="flex items-center gap-3 p-3 bg-amber-50/30 border border-amber-100/50 rounded-xl group transition-premium hover:bg-amber-50">
                        <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                            <Edit3 size={14} />
                        </div>
                        <span className="text-sm font-bold text-amber-900">{item.name}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-full mr-auto">Changed</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
