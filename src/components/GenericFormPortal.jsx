import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { getEvent, getEventFormById, getFormConfigById, submitToForm } from '../lib/api';
import { uploadImage } from '../lib/api';
import { getGoogleDriveDirectLink } from '../lib/utils';
import DynamicFormBuilder from './DynamicFormBuilder';

export default function GenericFormPortal() {
    const { eventId, formId } = useParams();
    const [formMeta, setFormMeta] = useState(null);
    const [event, setEvent] = useState(null);
    const [fields, setFields] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [meta, fieldData] = await Promise.all([
                    getEventFormById(formId),
                    getFormConfigById(formId)
                ]);
                setFormMeta(meta);

                // Fetch event details for the cover image
                try {
                    const eventData = await getEvent(eventId);
                    setEvent(eventData);
                } catch (e) {
                    console.error('Failed to load event metadata');
                }

                setFields(fieldData.filter(f => f.field_type !== 'hidden' || true)); // include hidden
                // Seed initial values
                const initial = {};
                fieldData.forEach(f => { initial[f.field_name] = ''; });
                setFormValues(initial);
            } catch (err) {
                setError('Form not found or no longer available.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [formId]);

    const validate = () => {
        const errs = {};
        fields.forEach(field => {
            if (field.is_required && !formValues[field.field_name]) {
                errs[field.field_name] = `${field.field_label} is required.`;
            }
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setSubmitting(true);
            setError(null);
            await submitToForm(formId, eventId, formMeta.target_module, formValues);
            setSubmitted(true);
        } catch (err) {
            setError('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileUpload = async (file) => {
        return await uploadImage(file, 'portal-uploads');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading form...</p>
                </div>
            </div>
        );
    }

    if (error && !formMeta) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-500" size={28} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">Form Unavailable</h2>
                    <p className="text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!formMeta?.is_active) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-amber-500" size={28} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">Form Closed</h2>
                    <p className="text-slate-500">This registration form is currently not accepting submissions.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-500" size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">Submitted Successfully!</h2>
                    <p className="text-slate-500 text-lg">Thank you for submitting. We'll be in touch soon.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-manrope">
            <div className="max-w-2xl mx-auto">
                {/* Header Section */}
                {event?.form_cover_image_url && (
                    <div className="mb-8 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm aspect-[3/1]">
                        <img
                            src={getGoogleDriveDirectLink(event.form_cover_image_url)}
                            alt="Form Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900">{formMeta?.form_name}</h1>
                    <p className="text-slate-500 mt-1">Please fill out all required fields below.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
                        <AlertCircle size={18} /><span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                    <form onSubmit={handleSubmit}>
                        <DynamicFormBuilder
                            fields={fields}
                            values={formValues}
                            onChange={setFormValues}
                            errors={errors}
                            onFileUpload={handleFileUpload}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-8 w-full py-4 bg-[#0d0e0e] text-white rounded-2xl font-black text-lg hover:bg-[#1a27c9] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <><Loader size={20} className="animate-spin" /> Submitting...</>
                            ) : (
                                'Submit Registration'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
