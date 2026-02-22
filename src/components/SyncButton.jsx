import { useState } from 'react';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { syncEventFromCloud } from '../lib/api';

export default function SyncButton({ eventId, onSyncComplete, className = "" }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null); // 'success' | 'error' | null

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            setSyncStatus(null);

            const result = await syncEventFromCloud(eventId);

            setSyncStatus('success');
            if (onSyncComplete) onSyncComplete(result.stats);

            setTimeout(() => setSyncStatus(null), 3000);
        } catch (error) {
            console.error('Sync failed:', error);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus(null), 5000);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-premium active:scale-95 disabled:opacity-50 ${syncStatus === 'success'
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

            <span>
                {isSyncing ? 'Syncing...' : syncStatus === 'success' ? 'Synced!' : syncStatus === 'error' ? 'Sync Failed' : 'Sync With Sheet'}
            </span>
        </button>
    );
}
