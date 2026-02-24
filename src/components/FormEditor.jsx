import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Plus, Save, Trash2, GripVertical,
    Type, FileText, List, Upload, AlertCircle, CheckCircle, Loader, ExternalLink
} from 'lucide-react';
import { getFormConfig, saveFormConfig } from '../lib/api';

export default function FormEditor() {
    const { eventId } = useParams();
    const [activeTab, setActiveTab] = useState('company'); // 'company' or 'expert'
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Initial load
    useEffect(() => {
        loadFields();
    }, [eventId, activeTab]);

    const loadFields = async () => {
        try {
            setLoading(true);
            const data = await getFormConfig(eventId, activeTab);
            setFields(data);
        } catch (err) {
            console.error('Error loading fields:', err);
            setError('Failed to load form fields.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddField = () => {
        const newField = {
            field_name: `custom_${Date.now()}`,
            field_label: 'New Question',
            field_type: 'text',
            is_required: false,
            show_in_card: false,
            display_order: fields.length,
            placeholder: '',
            help_text: '',
            is_custom: true // Flag to identify custom fields
        };
        setFields([...fields, newField]);
    };

    const handleRemoveField = (index) => {
        const field = fields[index];
        // Prevent removing core fields
        if (isCoreField(field.field_name)) {
            alert("You cannot remove core system fields.");
            return;
        }
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const handleFieldChange = (index, key, value) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    const handleOptionChange = (index, value) => {
        // Parse options from string to array for 'select' type
        const options = value.split(',').map(opt => opt.trim()).filter(Boolean);
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], field_options: options };
        setFields(newFields);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            // Re-index display_order before saving
            const orderedFields = fields.map((field, index) => ({
                ...field,
                display_order: index
            }));

            await saveFormConfig(eventId, activeTab, orderedFields);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving fields:', err);
            setError('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };


    // Helper to check if a field is core/locked
    const isCoreField = (fieldName) => {
        const coreFields = [
            'startup_name', 'logo_url', 'expert_name', 'photo_url'
        ];
        return coreFields.includes(fieldName);
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'text': return <Type size={16} />;
            case 'textarea': return <FileText size={16} />;
            case 'select': return <List size={16} />;
            case 'multiselect': return <List size={16} />;
            case 'file': return <Upload size={16} />;
            default: return <Type size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 pb-20 font-manrope">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-6">
                            <Link to={`/event/${eventId}`} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all group">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Form Editor</h1>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Customize Registration Questions</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Preview Links */}
                            <div className="hidden md:flex items-center gap-2 border-r border-slate-200 pr-6 mr-2">
                                <a
                                    href={`#/events/${eventId}/register/company`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group text-blue-600"
                                    title="Preview Company Registration Form"
                                >
                                    <ExternalLink size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Company Form</span>
                                </a>
                                <a
                                    href={`#/events/${eventId}/register/expert`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all group text-purple-600"
                                    title="Preview Expert Registration Form"
                                >
                                    <ExternalLink size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Expert Form</span>
                                </a>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-[#0d0e0e] text-white rounded-xl font-bold hover:bg-[#1a27c9] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                            >
                                {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Entity Tabs */}
                <div className="flex p-1 bg-slate-200 rounded-2xl mb-8 w-fit mx-auto">
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'company'
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Company Form
                    </button>
                    <button
                        onClick={() => setActiveTab('expert')}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'expert'
                            ? 'bg-white text-purple-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Expert Form
                    </button>
                </div>

                {/* Notifications */}
                {success && (
                    <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-2xl flex items-center gap-3 border border-green-200 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle size={20} />
                        <span className="font-bold">Form configuration saved successfully!</span>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
                        <AlertCircle size={20} />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-20">
                        <Loader className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Loading form fields...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {fields.map((field, index) => (
                            <div key={index} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">

                                {/* Header / Drag Handle */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-300 cursor-move hover:text-slate-500 hover:bg-slate-100 transition-colors">
                                            <GripVertical size={20} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isCoreField(field.field_name) ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {getIconForType(field.field_type)}
                                                {field.field_type}
                                            </span>
                                            {isCoreField(field.field_name) && (
                                                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-md">Core Field</span>
                                            )}
                                        </div>
                                    </div>

                                    {!isCoreField(field.field_name) && (
                                        <button
                                            onClick={() => handleRemoveField(index)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Field"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>

                                {/* Edit Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Question Label</label>
                                        <input
                                            type="text"
                                            value={field.field_label}
                                            onChange={(e) => handleFieldChange(index, 'field_label', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="e.g. What is your T-Shirt size?"
                                        />
                                    </div>

                                    {!isCoreField(field.field_name) && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Input Type</label>
                                            <select
                                                value={field.field_type}
                                                onChange={(e) => handleFieldChange(index, 'field_type', e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            >
                                                <option value="text">Short Text</option>
                                                <option value="textarea">Long Text / Paragraph</option>
                                                <option value="select">Dropdown Selection</option>
                                                <option value="multiselect">Multiple Selection</option>
                                                <option value="file">File Upload</option>
                                                <option value="number">Number</option>
                                                <option value="date">Date</option>
                                                <option value="email">Email</option>
                                                <option value="url">URL / Link</option>
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Placeholder</label>
                                        <input
                                            type="text"
                                            value={field.placeholder || ''}
                                            onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="e.g. Select size..."
                                        />
                                    </div>

                                    {(field.field_type === 'select' || field.field_type === 'multiselect') && (
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Options (Comma separated)</label>
                                            <textarea
                                                value={Array.isArray(field.field_options) ? field.field_options.join(', ') : field.field_options || ''}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]"
                                                placeholder="e.g. Small, Medium, Large, X-Large"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">Separate options with commas.</p>
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={field.is_required}
                                                    onChange={(e) => handleFieldChange(index, 'is_required', e.target.checked)}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800 select-none">Required Field</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Field Button */}
                        <button
                            onClick={handleAddField}
                            className="w-full py-6 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center gap-2 group"
                        >
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
}
