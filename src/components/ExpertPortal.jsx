import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Send, Loader, AlertTriangle } from 'lucide-react';
import DynamicFormBuilder from './DynamicFormBuilder';
import ExpertCardPreview from './ExpertCardPreview';
import { getEvent, getFormConfig, submitExpertRegistration, uploadImage } from '../lib/api';

/**
 * ExpertPortal Component
 * 
 * Public-facing registration portal for experts/speakers to submit their information.
 */
const ExpertPortal = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPortalData();
    }, [eventId]);

    const loadPortalData = async () => {
        try {
            setLoading(true);
            setError(null);

            const eventData = await getEvent(eventId);
            setEvent(eventData);

            if (!eventData.expert_portal_enabled) {
                setError('Expert registrations are currently closed for this event.');
                return;
            }

            if (eventData.submission_deadline) {
                const deadline = new Date(eventData.submission_deadline);
                if (new Date() > deadline) {
                    setError('The registration deadline has passed.');
                    return;
                }
            }

            const config = await getFormConfig(eventId, 'expert');
            setFormFields(config);

            const initialValues = {};
            config.forEach(field => {
                initialValues[field.field_name] = field.field_type === 'multiselect' ? [] : '';
            });
            setFormValues(initialValues);

        } catch (err) {
            console.error('Error loading portal:', err);
            setError('Failed to load registration form. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file) => {
        try {
            const url = await uploadImage(file, 'expert-photos');
            return url;
        } catch (error) {
            console.error('File upload error:', error);
            throw new Error('Failed to upload file');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        formFields.forEach(field => {
            const value = formValues[field.field_name];

            if (field.is_required && !value) {
                newErrors[field.field_name] = `${field.field_label} is required`;
                return;
            }

            if (!value) return;

            if (field.field_type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors[field.field_name] = 'Invalid email address';
            }

            if (field.field_type === 'url' && !/ ^https?:\/\/.+/.test(value)) {
                newErrors[field.field_name] = 'Invalid URL format';
            }

            if (field.validation_rules) {
                const { minLength, maxLength, pattern } = field.validation_rules;
                if (minLength && value.length < minLength) {
                    newErrors[field.field_name] = `Minimum length is ${minLength} characters`;
                }
                if (maxLength && value.length > maxLength) {
                    newErrors[field.field_name] = `Maximum length is ${maxLength} characters`;
                }
                if (pattern && !new RegExp(pattern).test(value)) {
                    newErrors[field.field_name] = 'Invalid format';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            await submitExpertRegistration(eventId, formValues);
            setSubmitted(true);
        } catch (err) {
            console.error('Submission error:', err);
            setError('Failed to submit registration. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-semibold">Loading registration form...</p>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md bg-white rounded-3xl p-8 shadow-xl border-2 border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Registration Unavailable</h2>
                    <p className="text-slate-600 text-center mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-slate-800 text-white rounded-2xl font-semibold hover:bg-slate-700 transition-all"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-lg bg-white rounded-3xl p-12 shadow-2xl border-2 border-green-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 text-center mb-3">Registration Submitted! 🎉</h2>
                    <p className="text-slate-600 text-center mb-2">
                        Thank you for registering for <span className="font-semibold">{event?.event_name}</span>.
                    </p>
                    <p className="text-sm text-slate-500 text-center mb-8">
                        Your submission is being reviewed and you'll be notified once approved.
                    </p>
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-800 text-center">
                            💡 You'll receive a confirmation email shortly
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                            Expert Registration
                        </h1>
                        <p className="text-lg text-slate-600 mb-1">{event?.event_name}</p>
                        {event?.expert_portal_message && (
                            <p className="text-sm text-slate-500 max-w-2xl mx-auto mt-3">
                                {event.expert_portal_message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full px-4 py-12">
                <div className="flex flex-col gap-12">
                    {/* Form Section (Top) - Constrained */}
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-8 md:p-12">
                            <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Expert Information</h2>

                            <form onSubmit={handleSubmit}>
                                <DynamicFormBuilder
                                    fields={formFields}
                                    values={formValues}
                                    onChange={setFormValues}
                                    errors={errors}
                                    onFileUpload={handleFileUpload}
                                />

                                {error && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Preview Section (Bottom) - Unconstrained / Full Width */}
                    <div className="w-full">
                        <div className="space-y-6 max-w-[1920px] mx-auto">
                            <div className="max-w-4xl mx-auto bg-purple-50/50 rounded-3xl p-6 border border-purple-100">
                                <h3 className="text-lg font-black text-purple-900 mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                    Live Preview
                                </h3>
                                <p className="text-sm text-purple-700/80 leading-relaxed">
                                    Fill in the form to see your speaker card update in real-time. This is exactly how it will appear in the event agenda.
                                </p>
                            </div>

                            <ExpertCardPreview
                                formData={formValues}
                                customColor="#1a27c9"
                            />
                        </div>
                    </div>

                    {/* Submit Button Section - Constrained */}
                    <div className="max-w-4xl mx-auto w-full">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl font-black text-xl uppercase tracking-widest hover:from-purple-700 hover:to-indigo-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <>
                                    <Loader className="w-6 h-6 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-6 h-6" />
                                    Submit Registration
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpertPortal;
