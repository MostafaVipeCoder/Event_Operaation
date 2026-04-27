import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Plus, Save, Trash2, GripVertical,
    Type, FileText, List, Upload, AlertCircle, CheckCircle, Loader, ExternalLink,
    Link2, Copy, CheckCheck, EyeOff, Settings, Users, Building2, ClipboardList,
    ToggleLeft, ToggleRight, ChevronRight, X
} from 'lucide-react';
import {
    getEventForms, createEventForm, deleteEventForm, updateEventForm,
    getFormConfigById, saveFormConfigById, getEvent, updateEvent, uploadImage
} from '../lib/api';
import { getGoogleDriveDirectLink } from '../lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const MODULE_META = {
    company: {
        label: 'Company List',
        icon: Building2,
        color: 'blue',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
    },
    expert: {
        label: 'Expert List',
        icon: Users,
        color: 'purple',
        badge: 'bg-purple-100 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
    },
    selection_process: {
        label: 'Selection Process',
        icon: ClipboardList,
        color: 'amber',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
    },
};

const isCoreField = (fieldName) =>
    ['startup_name', 'logo_url', 'expert_name', 'photo_url'].includes(fieldName);

const getIconForType = (type) => {
    switch (type) {
        case 'text': return <Type size={14} />;
        case 'textarea': return <FileText size={14} />;
        case 'select': return <List size={14} />;
        case 'multiselect': return <List size={14} />;
        case 'file': return <Upload size={14} />;
        case 'hidden': return <EyeOff size={14} />;
        default: return <Type size={14} />;
    }
};

// ─── Create Form Modal ────────────────────────────────────────────────────────

const CreateFormModal = ({ onClose, onCreate, loading }) => {
    const [formName, setFormName] = useState('');
    const [targetModule, setTargetModule] = useState('');

    const handleSubmit = () => {
        if (!formName.trim() || !targetModule) return;
        onCreate(formName.trim(), targetModule);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Create New Form</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Configure where submissions will be sent</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Form Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Form Name</label>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. Startup Applications, Speaker Registration"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    {/* Target Module */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Send submissions to</label>
                        <div className="space-y-2">
                            {Object.entries(MODULE_META).map(([key, meta]) => {
                                const Icon = meta.icon;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setTargetModule(key)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${targetModule === key
                                                ? `border-${meta.color}-500 bg-${meta.color}-50`
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${targetModule === key ? `bg-${meta.color}-100` : 'bg-slate-100'
                                            }`}>
                                            <Icon size={20} className={targetModule === key ? `text-${meta.color}-600` : 'text-slate-400'} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm">{meta.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {key === 'company' && 'Starts with Company Name, Logo, Industry, Location'}
                                                {key === 'expert' && 'Starts with Name, Photo, Title, Company, Bio'}
                                                {key === 'selection_process' && 'Empty form — you add all questions manually'}
                                            </p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${targetModule === key ? `border-${meta.color}-500` : 'border-slate-300'
                                            }`}>
                                            {targetModule === key && <div className={`w-2.5 h-2.5 rounded-full bg-${meta.color}-500`} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formName.trim() || !targetModule || loading}
                        className="flex-1 py-3 bg-[#0d0e0e] text-white rounded-xl font-bold hover:bg-[#1a27c9] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                        {loading ? 'Creating...' : 'Create Form'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Form Card (Dashboard) ────────────────────────────────────────────────────

const FormCard = ({ form, fieldCount, onEdit, onDelete, onToggle, eventId }) => {
    const meta = MODULE_META[form.target_module] || MODULE_META.company;
    const Icon = meta.icon;
    const registrationUrl = `${window.location.origin}${window.location.pathname}#/events/${eventId}/register/form/${form.form_id}`;

    const [copied, setCopied] = useState(false);
    const copyLink = () => {
        navigator.clipboard.writeText(registrationUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            {/* Card Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${meta.color}-100`}>
                            <Icon size={22} className={`text-${meta.color}-600`} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-lg leading-tight">{form.form_name}</h3>
                            <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                {meta.label}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => onToggle(form)}
                        className="text-slate-400 hover:text-slate-700 transition-colors mt-1"
                        title={form.is_active ? 'Deactivate form' : 'Activate form'}
                    >
                        {form.is_active
                            ? <ToggleRight size={28} className="text-green-500" />
                            : <ToggleLeft size={28} />
                        }
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-3 bg-slate-50 border-t border-b border-slate-100 flex items-center gap-6">
                <div className="text-center">
                    <p className="text-2xl font-black text-slate-800">{fieldCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${form.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className="text-xs font-bold text-slate-500">{form.is_active ? 'Active — accepting submissions' : 'Inactive'}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 flex items-center gap-2">
                {/* Copy Link */}
                <button
                    onClick={copyLink}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    title="Copy public form link"
                >
                    {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>

                {/* Preview */}
                <a
                    href={`#/events/${eventId}/register/form/${form.form_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                    <ExternalLink size={14} />
                    Preview
                </a>

                <div className="flex-1" />

                {/* Delete */}
                <button
                    onClick={() => onDelete(form)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete form"
                >
                    <Trash2 size={16} />
                </button>

                {/* Edit */}
                <button
                    onClick={() => onEdit(form)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0d0e0e] text-white rounded-xl text-xs font-bold hover:bg-[#1a27c9] transition-all"
                >
                    <Settings size={14} />
                    Edit Questions
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

// ─── Field Editor Screen ──────────────────────────────────────────────────────

const FieldEditorScreen = ({ form, eventId, onBack }) => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [trackingValues, setTrackingValues] = useState({});

    useEffect(() => { loadFields(); }, [form.form_id]);

    const loadFields = async () => {
        try {
            setLoading(true);
            const data = await getFormConfigById(form.form_id);
            setFields(data);
        } catch (err) {
            setError('Failed to load form fields.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddField = () => {
        setFields([...fields, {
            field_name: `custom_${Date.now()}`,
            field_label: 'New Question',
            field_type: 'text',
            is_required: false,
            show_in_card: false,
            display_order: fields.length,
            placeholder: '',
            help_text: '',
            is_custom: true
        }]);
    };

    const handleRemoveField = (index) => {
        if (isCoreField(fields[index].field_name)) { alert("Cannot remove core fields."); return; }
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index, key, value) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };
        setFields(updated);
    };

    const handleOptionChange = (index, value) => {
        const options = value.split(',').map(o => o.trim()).filter(Boolean);
        const updated = [...fields];
        updated[index] = { ...updated[index], field_options: options };
        setFields(updated);
    };

    const handleSave = async () => {
        try {
            setSaving(true); setError(null); setSuccess(false);
            const ordered = fields.map((f, i) => ({ ...f, display_order: i }));
            await saveFormConfigById(form.form_id, eventId, form.target_module, ordered);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const getBaseFormUrl = () =>
        `${window.location.origin}${window.location.pathname}#/events/${eventId}/register/form/${form.form_id}`;

    const buildTrackingUrl = (field, channelValue) => {
        const base = getBaseFormUrl();
        return channelValue ? `${base}?${field.field_name}=${encodeURIComponent(channelValue)}` : base;
    };

    const handleCopyLink = (index, field) => {
        navigator.clipboard.writeText(buildTrackingUrl(field, trackingValues[index] || '')).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const meta = MODULE_META[form.target_module] || MODULE_META.company;
    const Icon = meta.icon;

    return (
        <div className="min-h-screen bg-gray-200 pb-20 font-manrope">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 sm:h-20">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all group tap-target shrink-0">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${meta.color}-100 shrink-0`}>
                                    <Icon size={18} className={`text-${meta.color}-600`} />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-base sm:text-xl font-black text-slate-900 truncate">{form.form_name}</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {meta.label} · {fields.length} Questions
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <a href={`#/events/${eventId}/register/form/${form.form_id}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-slate-600 text-xs font-bold tap-target">
                                <ExternalLink size={15} />
                                <span className="hidden xs:inline">Preview Form</span>
                            </a>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0d0e0e] text-white rounded-xl font-bold hover:bg-[#1a27c9] transition-all shadow-lg disabled:opacity-50 tap-target">
                                {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {success && (
                    <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-2xl flex items-center gap-3 border border-green-200">
                        <CheckCircle size={18} /><span className="font-bold">Saved successfully!</span>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
                        <AlertCircle size={18} /><span className="font-bold">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20">
                        <Loader className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Loading questions...</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {fields.map((field, index) => (
                            <div key={index} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                {/* Field header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-300 cursor-move hover:text-slate-500 hover:bg-slate-100 transition-colors">
                                            <GripVertical size={18} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isCoreField(field.field_name) ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {getIconForType(field.field_type)} {field.field_type}
                                            </span>
                                            {isCoreField(field.field_name) && (
                                                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-md">Core</span>
                                            )}
                                        </div>
                                    </div>
                                    {!isCoreField(field.field_name) && (
                                        <button onClick={() => handleRemoveField(index)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Question Label */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Question Label</label>
                                        <input type="text" value={field.field_label}
                                            onChange={(e) => handleFieldChange(index, 'field_label', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="e.g. What is your T-Shirt size?" />
                                    </div>

                                    {/* Input Type */}
                                    {!isCoreField(field.field_name) && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Input Type</label>
                                            <select value={field.field_type}
                                                onChange={(e) => handleFieldChange(index, 'field_type', e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                                <option value="text">Short Text</option>
                                                <option value="textarea">Long Text / Paragraph</option>
                                                <option value="select">Dropdown Selection</option>
                                                <option value="multiselect">Multiple Selection</option>
                                                <option value="file">File Upload</option>
                                                <option value="number">Number</option>
                                                <option value="date">Date</option>
                                                <option value="email">Email</option>
                                                <option value="url">URL / Link</option>
                                                <option value="hidden">🔒 Hidden Field (Tracking)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Field Key */}
                                    {!isCoreField(field.field_name) && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Field Key (URL Param)</label>
                                            <input type="text" value={field.field_name}
                                                onChange={(e) => {
                                                    const sanitized = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                                                    handleFieldChange(index, 'field_name', sanitized);
                                                }}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                placeholder="e.g. source, channel" />
                                            <p className="text-[10px] text-slate-400 mt-1">e.g. <code className="bg-slate-100 px-1 rounded">?{field.field_name}=facebook</code></p>
                                        </div>
                                    )}

                                    {/* Placeholder */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Placeholder</label>
                                        <input type="text" value={field.placeholder || ''}
                                            onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="e.g. Enter your answer..." />
                                    </div>

                                    {/* Options for select/multiselect */}
                                    {(field.field_type === 'select' || field.field_type === 'multiselect') && (
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Options (comma separated)</label>
                                            <textarea
                                                value={Array.isArray(field.field_options) ? field.field_options.join(', ') : field.field_options || ''}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[70px]"
                                                placeholder="e.g. Small, Medium, Large, X-Large" />
                                        </div>
                                    )}

                                    {/* Required Toggle */}
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                            <div className="relative">
                                                <input type="checkbox" checked={field.is_required}
                                                    onChange={(e) => handleFieldChange(index, 'is_required', e.target.checked)}
                                                    className="peer sr-only" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800 select-none">Required Field</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Tracking Link Generator for hidden fields */}
                                {field.field_type === 'hidden' && (
                                    <div className="mt-5 pt-5 border-t border-dashed border-slate-200">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Link2 size={12} /> Tracking Link Generator
                                        </p>
                                        <div className="flex gap-2">
                                            <input type="text"
                                                value={trackingValues[index] || ''}
                                                onChange={(e) => setTrackingValues(prev => ({ ...prev, [index]: e.target.value }))}
                                                placeholder="e.g. Facebook, WhatsApp, Instagram"
                                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
                                            <button type="button" onClick={() => handleCopyLink(index, field)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${copiedIndex === index ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                                                {copiedIndex === index ? <CheckCheck size={14} /> : <Copy size={14} />}
                                                {copiedIndex === index ? 'Copied!' : 'Copy Link'}
                                            </button>
                                        </div>
                                        {trackingValues[index] && (
                                            <p className="text-[10px] text-slate-400 mt-2 font-mono break-all">
                                                {buildTrackingUrl(field, trackingValues[index])}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add Question Button */}
                        <button onClick={handleAddField}
                            className="w-full py-6 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-lg">Add New Question</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Forms Dashboard Screen ───────────────────────────────────────────────────

export default function FormEditor() {
    const { eventId } = useParams();
    const [forms, setForms] = useState([]);
    const [fieldCounts, setFieldCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editingForm, setEditingForm] = useState(null);

    // Form Cover state
    const [formCoverUrl, setFormCoverUrl] = useState('');
    const [isUploadingFormCover, setIsUploadingFormCover] = useState(false);
    const [formCoverSaved, setFormCoverSaved] = useState(false);

    useEffect(() => { loadForms(); }, [eventId]);

    useEffect(() => {
        getEvent(eventId).then(data => {
            if (data?.form_cover_image_url) setFormCoverUrl(data.form_cover_image_url);
        }).catch(console.error);
    }, [eventId]);

    const handleFormCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setIsUploadingFormCover(true);
            const publicUrl = await uploadImage(file, 'visuals');
            setFormCoverUrl(publicUrl);
            await updateEvent(eventId, { form_cover_image_url: publicUrl });
            setFormCoverSaved(true);
            setTimeout(() => setFormCoverSaved(false), 3000);
        } catch (err) {
            console.error('Form cover upload failed:', err);
            alert('فشل رفع الصورة. حاول مرة تانية.');
        } finally {
            setIsUploadingFormCover(false);
        }
    };

    const handleRemoveFormCover = async () => {
        try {
            setFormCoverUrl('');
            await updateEvent(eventId, { form_cover_image_url: '' });
        } catch (err) {
            console.error('Remove form cover failed:', err);
        }
    };

    const loadForms = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getEventForms(eventId);
            setForms(data);
            // Load field counts for each form in parallel
            const counts = await Promise.all(
                data.map(f => getFormConfigById(f.form_id).then(fields => ({ id: f.form_id, count: fields.length })))
            );
            const countsMap = {};
            counts.forEach(({ id, count }) => { countsMap[id] = count; });
            setFieldCounts(countsMap);
        } catch (err) {
            setError('Failed to load forms.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formName, targetModule) => {
        try {
            setCreating(true);
            await createEventForm(eventId, formName, targetModule);
            setShowCreateModal(false);
            await loadForms();
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (form) => {
        if (!window.confirm(`Delete "${form.form_name}"? This will remove all its questions.`)) return;
        try {
            await deleteEventForm(form.form_id);
            await loadForms();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggle = async (form) => {
        try {
            await updateEventForm(form.form_id, { is_active: !form.is_active });
            await loadForms();
        } catch (err) {
            console.error(err);
        }
    };

    // Switch to field editor for a specific form
    if (editingForm) {
        return (
            <FieldEditorScreen
                form={editingForm}
                eventId={eventId}
                onBack={() => { setEditingForm(null); loadForms(); }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-200 pb-20 font-manrope">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 sm:h-20">
                        <div className="flex items-center gap-4">
                            <Link to={`/event/${eventId}`} className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all group tap-target shrink-0">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Form Builder</h1>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {forms.length} Form{forms.length !== 1 ? 's' : ''} · Manage Registration Forms
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-[#0d0e0e] text-white rounded-xl font-bold hover:bg-[#1a27c9] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 tap-target self-start sm:self-auto"
                        >
                            <Plus size={18} />
                            <span>Create New Form</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
                        <AlertCircle size={18} /><span className="font-bold">{error}</span>
                    </div>
                )}


                {/* ── Form Cover ── */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-50 p-2.5 rounded-xl text-rose-500">
                                <Upload size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-slate-900">Form Cover</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">صورة الكوفر في صفحات التسجيل</p>
                            </div>
                        </div>
                        {formCoverSaved && (
                            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-black animate-in fade-in duration-300">
                                <CheckCircle size={14} /> Saved!
                            </span>
                        )}
                    </div>
                    <div className="relative group aspect-[4/1] sm:aspect-[5/1] bg-slate-50 flex items-center justify-center overflow-hidden">
                        {formCoverUrl ? (
                            <>
                                <img
                                    src={getGoogleDriveDirectLink(formCoverUrl)}
                                    className="w-full h-full object-cover"
                                    alt="Form cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                                        Change
                                        <input type="file" className="hidden" onChange={handleFormCoverUpload} accept="image/*" />
                                    </label>
                                    <button
                                        onClick={handleRemoveFormCover}
                                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-2 group/lbl">
                                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-slate-300 group-hover/lbl:text-rose-500 group-hover/lbl:border-rose-200 transition-colors">
                                    <Upload size={28} />
                                </div>
                                <span className="text-xs font-bold text-slate-400 group-hover/lbl:text-rose-500 transition-colors">Click to upload form cover</span>
                                <input type="file" className="hidden" onChange={handleFormCoverUpload} accept="image/*" />
                            </label>
                        )}
                        {isUploadingFormCover && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                <Loader className="animate-spin text-rose-500" size={36} />
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-24">
                        <Loader className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Loading forms...</p>
                    </div>
                ) : forms.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-24">
                        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ClipboardList className="w-12 h-12 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">No forms yet</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            Create your first registration form and link it to a module. Each form gets its own public link.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0d0e0e] text-white rounded-2xl font-bold hover:bg-[#1a27c9] transition-all shadow-lg text-lg"
                        >
                            <Plus size={20} />
                            Create Your First Form
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {forms.map(form => (
                            <FormCard
                                key={form.form_id}
                                form={form}
                                fieldCount={fieldCounts[form.form_id] ?? 0}
                                eventId={eventId}
                                onEdit={setEditingForm}
                                onDelete={handleDelete}
                                onToggle={handleToggle}
                            />
                        ))}

                        {/* Add form tile */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
                        >
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Plus className="w-7 h-7" />
                            </div>
                            <span className="font-bold text-base">Add Another Form</span>
                        </button>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateFormModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                    loading={creating}
                />
            )}
        </div>
    );
}
