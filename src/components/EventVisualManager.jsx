import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    Image as ImageIcon,
    Palette,
    Type,
    Save,
    Loader2,
    Check,
    Eye,
    Layout
} from 'lucide-react';
import { getEvent, updateEvent, uploadImage } from '../lib/api';
import { getGoogleDriveDirectLink } from '../lib/utils';

export default function EventVisualManager() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Visual Settings State
    const [settings, setSettings] = useState({
        header_image_url: '',
        background_image_url: '',
        footer_image_url: '',
        header_height: '16rem',
        header_settings: {
            visible: true,
            type: 'image', // 'image' or 'color'
            color: '#ffffff',
            showTitle: false,
            titleColor: '#000000',
            titleSize: '3rem',
            titleWeight: '700',
            titleDescription: '',
            fontFamily: 'font-manrope',
            contentSize: '1rem',
            contentWeight: '400',
            overlayColor: '#000000',
            overlayOpacity: '0'
        },
        experts_color: '#9333ea',
        startups_color: '#059669'
    });

    useEffect(() => {
        loadEventDetails();
    }, [eventId]);

    const loadEventDetails = async () => {
        try {
            setLoading(true);
            const data = await getEvent(eventId);
            setEvent(data);

            setSettings({
                header_image_url: data.header_image_url || '',
                background_image_url: data.background_image_url || '',
                footer_image_url: data.footer_image_url || '',
                header_height: data.header_height || '16rem',
                header_settings: data.header_settings || settings.header_settings,
                experts_color: data.experts_color || '#9333ea',
                startups_color: data.startups_color || '#059669'
            });
        } catch (error) {
            console.error('Error loading event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const publicUrl = await uploadImage(file, 'visuals');
            setSettings(prev => ({ ...prev, [type]: publicUrl }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Fails to upload image. Please try again.');
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
            console.error('Error saving visuals:', error);
            alert('Failed to save visual settings.');
        } finally {
            setSaving(false);
        }
    };

    const updateHeaderSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            header_settings: {
                ...prev.header_settings,
                [key]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white font-manrope">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a27c9]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-manrope pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/event/${eventId}`)}
                                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-premium"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-xl font-black text-[#0d0e0e] tracking-tight">Event Visuals</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Design & Branding</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={`#/agenda/${eventId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-premium"
                            >
                                <Eye size={18} />
                                <span>Preview</span>
                            </a>
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

                    {/* Header Image Section */}
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-indigo-50 p-3 rounded-2xl text-[#1a27c9]">
                                <ImageIcon size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#0d0e0e]">Cover Image</h2>
                                <p className="text-sm text-slate-500 font-medium">This image will appear at the top of your forms and agenda.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 aspect-[3/1] bg-slate-50 flex items-center justify-center">
                                {settings.header_image_url ? (
                                    <>
                                        <img
                                            src={getGoogleDriveDirectLink(settings.header_image_url)}
                                            className="w-full h-full object-cover"
                                            alt="Header preview"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-premium">
                                                Change Image
                                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'header_image_url')} accept="image/*" />
                                            </label>
                                            <button
                                                onClick={() => setSettings(prev => ({ ...prev, header_image_url: '' }))}
                                                className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-premium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-3">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-slate-400 group-hover:scale-110 transition-transform">
                                            <Upload size={32} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-400">Click to upload cover image</span>
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'header_image_url')} accept="image/*" />
                                    </label>
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                        <Loader2 className="animate-spin text-[#1a27c9]" size={40} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Header Height</label>
                                    <select
                                        value={settings.header_height}
                                        onChange={(e) => setSettings(prev => ({ ...prev, header_height: e.target.value }))}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-[#1a27c9] outline-none"
                                    >
                                        <option value="12rem">Small (12rem)</option>
                                        <option value="16rem">Medium (16rem)</option>
                                        <option value="20rem">Large (20rem)</option>
                                        <option value="24rem">Extra Large (24rem)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Visibility</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => updateHeaderSetting('visible', true)}
                                            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm border transition-premium ${settings.header_settings.visible ? 'bg-indigo-50 border-indigo-200 text-[#1a27c9]' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            Show Header
                                        </button>
                                        <button
                                            onClick={() => updateHeaderSetting('visible', false)}
                                            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm border transition-premium ${!settings.header_settings.visible ? 'bg-indigo-50 border-indigo-200 text-[#1a27c9]' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            Hide Header
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Header Type</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => updateHeaderSetting('type', 'image')}
                                            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm border transition-premium ${settings.header_settings.type === 'image' ? 'bg-indigo-50 border-indigo-200 text-[#1a27c9]' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            Image
                                        </button>
                                        <button
                                            onClick={() => updateHeaderSetting('type', 'color')}
                                            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm border transition-premium ${settings.header_settings.type === 'color' ? 'bg-indigo-50 border-indigo-200 text-[#1a27c9]' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            Solid Color
                                        </button>
                                    </div>
                                </div>
                                {settings.header_settings.type === 'color' && (
                                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                        <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Background Color</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={settings.header_settings.color || '#ffffff'}
                                                onChange={(e) => updateHeaderSetting('color', e.target.value)}
                                                className="h-14 w-14 rounded-2xl border-none cursor-pointer p-0 overflow-hidden"
                                            />
                                            <input
                                                type="text"
                                                value={settings.header_settings.color || '#ffffff'}
                                                onChange={(e) => updateHeaderSetting('color', e.target.value)}
                                                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Colors & Accents Section */}
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                                <Palette size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#0d0e0e]">Colors & Accents</h2>
                                <p className="text-sm text-slate-500 font-medium">Customize the color palette for your event modules.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-4">Experts Accent Color</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={settings.experts_color}
                                        onChange={(e) => setSettings(prev => ({ ...prev, experts_color: e.target.value }))}
                                        className="h-14 w-14 rounded-2xl border-none cursor-pointer p-0 overflow-hidden"
                                    />
                                    <input
                                        type="text"
                                        value={settings.experts_color}
                                        onChange={(e) => setSettings(prev => ({ ...prev, experts_color: e.target.value }))}
                                        className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-4">Startups Accent Color</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={settings.startups_color}
                                        onChange={(e) => setSettings(prev => ({ ...prev, startups_color: e.target.value }))}
                                        className="h-14 w-14 rounded-2xl border-none cursor-pointer p-0 overflow-hidden"
                                    />
                                    <input
                                        type="text"
                                        value={settings.startups_color}
                                        onChange={(e) => setSettings(prev => ({ ...prev, startups_color: e.target.value }))}
                                        className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Typography & Content */}
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                                <Type size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#0d0e0e]">Typography</h2>
                                <p className="text-sm text-slate-500 font-medium">Set the primary font family for the event portal.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { name: 'Manrope (Modern)', value: 'font-manrope' },
                                { name: 'Inter (Classic)', value: 'font-inter' },
                                { name: 'Outfit (Elegant)', value: 'font-outfit' },
                                { name: 'Roboto (Functional)', value: 'font-roboto' }
                            ].map((font) => (
                                <button
                                    key={font.value}
                                    onClick={() => updateHeaderSetting('fontFamily', font.value)}
                                    className={`flex items-center justify-between p-6 rounded-[1.5rem] border-2 transition-premium ${settings.header_settings.fontFamily === font.value ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                                >
                                    <span className={`text-lg font-bold ${font.value}`}>{font.name}</span>
                                    {settings.header_settings.fontFamily === font.value && (
                                        <div className="bg-amber-500 text-white p-1 rounded-full">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Header Text Settings */}
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
                                <Layout size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#0d0e0e]">Header Content</h2>
                                <p className="text-sm text-slate-500 font-medium">Control the text and title displayed in the header.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                                <div>
                                    <label className="text-lg font-black text-[#0d0e0e] tracking-tight">Show Title Overlay</label>
                                    <p className="text-xs text-slate-500 font-medium">Overlay the event name directly on the header image/color.</p>
                                </div>
                                <button
                                    onClick={() => updateHeaderSetting('showTitle', !settings.header_settings.showTitle)}
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${settings.header_settings.showTitle ? 'bg-[#1a27c9]' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${settings.header_settings.showTitle ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>

                            {settings.header_settings.showTitle && (
                                <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div>
                                        <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Overlay Description</label>
                                        <textarea
                                            value={settings.header_settings.titleDescription}
                                            onChange={(e) => updateHeaderSetting('titleDescription', e.target.value)}
                                            placeholder="Optional tagline or description..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium focus:ring-[#1a27c9] outline-none min-h-[100px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Title Text Color</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="color"
                                                    value={settings.header_settings.titleColor}
                                                    onChange={(e) => updateHeaderSetting('titleColor', e.target.value)}
                                                    className="h-12 w-12 rounded-xl border-none cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={settings.header_settings.titleColor}
                                                    onChange={(e) => updateHeaderSetting('titleColor', e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold uppercase text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-[#0d0e0e] uppercase tracking-widest mb-2">Overlay Opacity</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={settings.header_settings.overlayOpacity}
                                                onChange={(e) => updateHeaderSetting('overlayOpacity', e.target.value)}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a27c9] mt-4"
                                            />
                                            <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400">
                                                <span>TRANSPARENT</span>
                                                <span>{Math.round(settings.header_settings.overlayOpacity * 100)}%</span>
                                                <span>OPAQUE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
