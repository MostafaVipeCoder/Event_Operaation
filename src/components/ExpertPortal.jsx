import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Send, Loader, AlertTriangle } from 'lucide-react';
import DynamicFormBuilder from './DynamicFormBuilder';


import { getEvent, getFormConfig, submitExpertRegistration, uploadImage } from '../lib/api';
import { getGoogleDriveDirectLink } from '../lib/utils';
import { translations } from '../lib/translations';

/**
 * ExpertPortal Component
 * 
 * Public-facing registration portal for experts/speakers to submit their information.
 */
const ExpertPortal = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isArabic = searchParams.get('lang') === 'ar';

    const [event, setEvent] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    

    const t = isArabic ? translations.ar : translations.en;

    useEffect(() => {
        loadPortalData();
    }, [eventId]);

    const loadPortalData = async () => {
        try {
            setLoading(true);
            setError(null);

            const eventData = await getEvent(eventId);
            setEvent(eventData);

            // Update Page Title
            const eventName = (isArabic && eventData?.event_name_ar) ? eventData.event_name_ar : eventData.event_name;
            if (eventName) {
                document.title = `Athar Programs | Registration for ${eventName}`;
            }

            if (!eventData.expert_portal_enabled) {
                setError(t.closedError);
                return;
            }

            if (eventData.submission_deadline) {
                const deadline = new Date(eventData.submission_deadline);
                if (new Date() > deadline) {
                    setError(t.deadlineError);
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
            setError(t.loadError);
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
            const fieldLabel = (isArabic && field.field_label_ar) ? field.field_label_ar : field.field_label;

            if (field.is_required && !value) {
                newErrors[field.field_name] = isArabic ? `${fieldLabel} مطلوب` : `${fieldLabel} is required`;
                return;
            }

            if (!value) return;

            if (field.field_type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors[field.field_name] = isArabic ? 'بريد إلكتروني غير صالح' : 'Invalid email address';
            }

            if (field.field_type === 'url' && !/^https?:\/\/.+/.test(value)) {
                newErrors[field.field_name] = isArabic ? 'رابط غير صالح' : 'Invalid URL format';
            }

            if (field.validation_rules) {
                const { minLength, maxLength, pattern } = field.validation_rules;
                if (minLength && value.length < minLength) {
                    newErrors[field.field_name] = isArabic ? `الحد الأدنى هو ${minLength} أحرف` : `Minimum length is ${minLength} characters`;
                }
                if (maxLength && value.length > maxLength) {
                    newErrors[field.field_name] = isArabic ? `الحد الأقصى هو ${maxLength} أحرف` : `Maximum length is ${maxLength} characters`;
                }
                if (pattern && !new RegExp(pattern).test(value)) {
                    newErrors[field.field_name] = isArabic ? 'تنسيق غير صالح' : 'Invalid format';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            await submitExpertRegistration(eventId, formValues);
            setSubmitted(true);
        } catch (err) {
            console.error('Submission error:', err);
            setError(t.submitError);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className={`text-slate-600 font-semibold ${isArabic ? 'font-arabic' : 'font-manrope'}`}>{t.loading}</p>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md bg-white rounded-3xl p-8 shadow-xl border-2 border-red-100" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className={`text-2xl font-bold text-slate-800 text-center mb-2 ${isArabic ? 'font-arabic' : 'font-manrope'}`}>{t.unavailableTitle}</h2>
                    <p className={`text-slate-600 text-center mb-6 ${isArabic ? 'font-arabic' : 'font-manrope'}`}>{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className={`w-full py-3 bg-slate-800 text-white rounded-2xl font-semibold hover:bg-slate-700 transition-all ${isArabic ? 'font-arabic' : 'font-manrope'}`}
                    >
                        {t.goHome}
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-lg bg-white rounded-3xl p-12 shadow-2xl border-2 border-green-100" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className={`text-3xl font-black text-slate-800 text-center mb-3 ${isArabic ? 'font-arabic' : 'font-manrope'}`}>{t.submittedTitle}</h2>
                    <p className={`text-slate-600 text-center mb-2 ${isArabic ? 'font-arabic' : 'font-manrope'}`}>
                        {t.submittedDesc} <span className="font-semibold">{(isArabic && event?.event_name_ar) ? event.event_name_ar : event?.event_name}</span>.
                    </p>
                    <p className={`text-sm text-slate-500 text-center mb-8 ${isArabic ? 'font-arabic' : 'font-manrope'}`}>
                        {t.reviewDesc}
                    </p>
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <p className={`text-xs font-semibold text-blue-800 text-center ${isArabic ? 'font-arabic' : 'font-manrope'}`}>
                            💡 {t.emailTip}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Main form view
    const isHeaderVisible = event?.header_settings?.visible ?? !!event?.header_image_url;
    const headerHeight = event?.header_height || '16rem';
    const headerSettings = event?.header_settings || { fontFamily: 'font-manrope' };
    const displayImage = event?.form_cover_image_url || event?.header_image_url;
    const displayEventName = (isArabic && event?.event_name_ar) ? event.event_name_ar : event?.event_name;

    return (
        <div
            className={`min-h-screen selection:bg-indigo-100 antialiased ${isArabic ? 'font-arabic' : headerSettings.fontFamily}`}
            dir={isArabic ? 'rtl' : 'ltr'}
            style={{
                backgroundImage: event?.background_image_url
                    ? `url(${getGoogleDriveDirectLink(event.background_image_url)})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundColor: '#f1f5f9'
            }}
        >
            {/* Premium Header */}
            {isHeaderVisible && (
                <div
                    className="relative w-full z-10 shadow-sm flex items-center justify-center transition-all duration-700 overflow-hidden"
                    style={{
                        height: headerHeight,
                        backgroundColor: headerSettings.type === 'color' ? (headerSettings.color || '#ffffff') : '#f8fafc'
                    }}
                >
                    {/* Show image if type is image OR if type is not set but image exists */}
                    {(headerSettings.type === 'image' || (!headerSettings.type && displayImage)) && displayImage && (
                        <div className="absolute inset-0">
                            <img
                                src={getGoogleDriveDirectLink(displayImage)}
                                alt="Event Cover"
                                className="w-full h-full object-cover scale-105"
                                referrerPolicy="no-referrer"
                            />
                            <div
                                className="absolute inset-0 transition-opacity duration-700"
                                style={{
                                    backgroundColor: headerSettings.overlayColor || '#000000',
                                    opacity: headerSettings.overlayOpacity || 0
                                }}
                            />
                        </div>
                    )}

                    {headerSettings.showTitle ? (
                        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                            <h1
                                className="font-black leading-[1.1] tracking-tight mb-4 drop-shadow-sm"
                                style={{
                                    color: headerSettings.titleColor || '#0d0e0e',
                                    fontSize: headerSettings.titleSize || '3.5rem',
                                    fontWeight: headerSettings.titleWeight || '900',
                                }}
                            >
                                {displayEventName}
                            </h1>
                            {((isArabic && headerSettings.titleDescription_ar) || headerSettings.titleDescription) && (
                                <p
                                    className="text-lg md:text-2xl opacity-90 font-bold leading-relaxed tracking-wide"
                                    style={{ color: headerSettings.titleColor || '#0d0e0e' }}
                                >
                                    {(isArabic && headerSettings.titleDescription_ar) ? headerSettings.titleDescription_ar : headerSettings.titleDescription}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="relative z-10 text-center">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                                {t.headerTitle}
                            </h1>
                            <p className="text-lg text-slate-600 font-bold">{displayEventName}</p>
                        </div>
                    )}
                </div>
            )}

            {!isHeaderVisible && (
                <div className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                                {t.headerTitle}
                            </h1>
                            <p className="text-lg text-slate-600 mb-1">{displayEventName}</p>
                            {((isArabic && event?.expert_portal_message_ar) || event?.expert_portal_message) && (
                                <p className="text-sm text-slate-500 max-w-2xl mx-auto mt-3">
                                    {(isArabic && event?.expert_portal_message_ar) ? event.expert_portal_message_ar : event.expert_portal_message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full px-4 py-12">
                <div className="flex flex-col gap-12">
                    {/* Form Section (Top) - Constrained */}
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-8 md:p-12">
                            <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">{t.infoTitle}</h2>

                            <form onSubmit={handleSubmit}>
                                <DynamicFormBuilder
                                    fields={formFields}
                                    values={formValues}
                                    onChange={setFormValues}
                                    errors={errors}
                                    onFileUpload={handleFileUpload}
                                />

                                {error && (
                                    <div className={`mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl ${isArabic ? 'text-right' : 'text-left'}`}>
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
                                <h3 className={`text-lg font-black text-purple-900 mb-2 flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                    {t.livePreview}
                                </h3>
                                <p className={`text-sm text-purple-700/80 leading-relaxed ${isArabic ? 'text-right' : 'text-left'}`}>
                                    {t.previewDesc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button Section - Constrained */}
                    <div className="max-w-4xl mx-auto w-full">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={`w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl font-black text-xl uppercase tracking-widest hover:from-purple-700 hover:to-indigo-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 ${isArabic ? 'font-arabic' : 'font-manrope'}`}
                        >
                            {submitting ? (
                                <>
                                    <Loader className="w-6 h-6 animate-spin" />
                                    {t.submitting}
                                </>
                            ) : (
                                <>
                                    <Send className={`w-6 h-6 ${isArabic ? 'rotate-180' : ''}`} />
                                    {t.submitBtn}
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
