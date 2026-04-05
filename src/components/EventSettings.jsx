import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Loader2,
    Check,
    Settings,
    Share2,
    Upload,
    Image as ImageIcon,
    Copy,
    ClipboardCheck
} from 'lucide-react';
import { getEvent, updateEvent, uploadImage, getShareUrl } from '../lib/api';
import { getGoogleDriveDirectLink } from '../lib/utils';

export default function EventSettings() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);

    const [settings, setSettings] = useState({
        seo_title: '',
        seo_description: '',
        seo_image_url: ''
    });

    const shareUrl = getShareUrl(eventId);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        loadSettings();
    }, [eventId]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getEvent(eventId);
            setSettings({
                seo_title: data.seo_title || '',
                seo_description: data.seo_description || '',
                seo_image_url: data.seo_image_url || ''
            });
        } catch (error) {
            console.error('Error loading event settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const publicUrl = await uploadImage(file, 'visuals');
            setSettings(prev => ({ ...prev, seo_image_url: publicUrl }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSuccess(false);
            await updateEvent(eventId, settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white font-manrope">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a27c9]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200 font-manrope pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/event/${eventId}`)}
                                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-premium"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-xl font-black text-[#0d0e0e] tracking-tight">Event Settings</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">SEO & Sharing</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#1a27c9] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-100 disabled:opacity-50 transition-premium"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : (success ? <Check size={18} /> : <Save size={18} />)}
                                <span>{saving ? 'Saving...' : (success ? 'Saved!' : 'Save Changes')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8">
                    
                    {/* Professional Share Link */}
                    <section className="bg-[#1a27c9] rounded-[2.5rem] p-8 shadow-premium text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Share2 size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                    <Share2 size={24} />
                                </div>
                                <h2 className="text-xl font-black italic tracking-tight">RABBIT SHARE LINK 🚀</h2>
                            </div>
                            
                            <p className="text-white/80 font-medium mb-6 max-w-2xl">
                                استخدم هذا الرابط للمشاركة في الواتساب وفيسبوك. هذا الرابط تم تصميمه برمجياً (Smart Redirect) ليضمن ظهور الصورة والنصوص التي تخصصها في الأسفل، حتى وإن كان تطبيق المحادثة لا يدعم المواقع الحديثة.
                            </p>

                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 w-full font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                    {shareUrl}
                                </div>
                                <button 
                                    onClick={copyToClipboard}
                                    className="px-8 py-4 bg-white text-[#1a27c9] rounded-2xl font-black uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center gap-2 shrink-0 shadow-xl"
                                >
                                    {copied ? <ClipboardCheck size={20} /> : <Copy size={20} />}
                                    {copied ? 'Copied' : 'Copy Smart Link'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* SEO Module */}
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                                <Share2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#0d0e0e]">Social Sharing & SEO Settings</h2>
                                <p className="text-sm text-slate-500 font-medium">خصم نصوص المشاركة هنا، ثم استخدم الرابط في الأعلى للمشاركة.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Share Title (SEO Title)</label>
                                <input
                                    type="text"
                                    value={settings.seo_title}
                                    onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                                    placeholder="e.g. Athar Tech Event 2024"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-[#1a27c9] outline-none"
                                />
                                <p className="text-xs text-slate-400 mt-2 font-medium">العنوان الذي يظهر أعلى رابط المشاركة.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Share Description (SEO Description)</label>
                                <textarea
                                    value={settings.seo_description}
                                    onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                                    placeholder="Brief description to share on social media..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium focus:ring-[#1a27c9] outline-none min-h-[120px]"
                                />
                                <p className="text-xs text-slate-400 mt-2 font-medium">الوصف المختصر الذي يعطي الزوار فكرة عن الفعالية قبل الضغط على الرابط.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Share Image (Open Graph Image)</label>
                                <div className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 aspect-[2/1] bg-slate-50 flex items-center justify-center max-w-2xl">
                                    {settings.seo_image_url ? (
                                        <>
                                            <img
                                                src={getGoogleDriveDirectLink(settings.seo_image_url)}
                                                className="w-full h-full object-cover"
                                                alt="SEO Share preview"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-premium">
                                                    Change Image
                                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                                </label>
                                                <button
                                                    onClick={() => setSettings(prev => ({ ...prev, seo_image_url: '' }))}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-premium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-3 relative z-10 w-full h-full justify-center">
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-slate-400 group-hover:scale-110 transition-transform">
                                                <ImageIcon size={32} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-400 text-center px-4">
                                                Click to upload SEO Image<br/>
                                                <span className="text-xs font-medium">Recommended: 1200x630px</span>
                                            </span>
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                        </label>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                                            <Loader2 className="animate-spin text-green-600" size={40} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-2 font-medium">
                                    الصورة التي تظهر للزوار في الواتساب أو تويتر. يُنصح بمقاس 1200x630 (نسبة 1.91:1) لتحقيق أفضل مظهر. <br/>
                                    <strong>ملاحظة:</strong> إذا تركت هذه الصورة فارغة، سيتم محاولة استخدام الكوفر الرئيسي للفعالية بشكل افتراضي.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
