import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, AlertCircle } from 'lucide-react';

/**
 * DynamicFormBuilder Component
 * 
 * A flexible form builder that renders form fields dynamically based on configuration.
 * Supports validation, file uploads, and custom field types.
 * 
 * @param {Array} fields - Array of field configuration objects
 * @param {Object} values - Current form values
 * @param {Function} onChange - Callback when form values change
 * @param {Object} errors - Validation errors object
 * @param {Function} onFileUpload - Callback for file uploads
 */
const DynamicFormBuilder = ({ fields = [], values = {}, onChange, errors = {}, onFileUpload }) => {
    const [uploadingFields, setUploadingFields] = useState({});
    const [searchParams] = useSearchParams();
    const isArabic = searchParams.get('lang') === 'ar';

    // Pre-fill any fields whose field_name matches a URL search param
    useEffect(() => {
        if (!fields.length) return;
        if (!searchParams.toString()) return;

        const prefilled = {};
        fields.forEach(field => {
            const paramValue = searchParams.get(field.field_name);
            if (paramValue !== null) {
                prefilled[field.field_name] = paramValue;
            }
        });

        if (Object.keys(prefilled).length > 0) {
            onChange({ ...values, ...prefilled });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields]);

    const handleFieldChange = (fieldName, value) => {
        onChange({ ...values, [fieldName]: value });
    };

    const handleFileChange = async (fieldName, file) => {
        if (!file || !onFileUpload) return;

        setUploadingFields(prev => ({ ...prev, [fieldName]: true }));
        try {
            const url = await onFileUpload(file);
            handleFieldChange(fieldName, url);
        } catch (error) {
            console.error('File upload error:', error);
        } finally {
            setUploadingFields(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const renderField = (field) => {
        const {
            field_name,
            field_label,
            field_label_ar,
            field_type,
            field_options = [],
            is_required,
            placeholder,
            placeholder_ar,
            help_text,
            help_text_ar,
            validation_rules: raw_validation_rules = {}
        } = field;

        const validation_rules = raw_validation_rules || {};

        const value = values[field_name] || '';
        const error = errors[field_name];
        const isUploading = uploadingFields[field_name];

        const displayLabel = (isArabic && field_label_ar) ? field_label_ar : field_label;
        const displayPlaceholder = (isArabic && placeholder_ar) ? placeholder_ar : placeholder;
        const displayHelpText = (isArabic && help_text_ar) ? help_text_ar : help_text;

        // Base field wrapper classes
        const wrapperClasses = `mb-6 ${isArabic ? 'text-right' : 'text-left'}`;
        const labelClasses = `block text-sm font-bold text-slate-700 mb-2 ${isArabic ? 'font-arabic' : 'font-manrope'}`;
        const inputBaseClasses = `w-full px-4 py-3 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${isArabic ? 'font-arabic' : 'font-manrope'}`;
        const inputClasses = error
            ? `${inputBaseClasses} border-red-300 focus:border-red-500`
            : `${inputBaseClasses} border-slate-200 focus:border-blue-500`;

        const renderLabel = () => (
            <label htmlFor={field_name} className={labelClasses}>
                {displayLabel}
                {is_required && <span className="text-red-500 mx-1">*</span>}
            </label>
        );

        const renderError = () => error && (
            <div className={`flex items-center gap-1 text-xs text-red-600 mt-1 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                <AlertCircle size={12} />
                <span>{error}</span>
            </div>
        );

        const renderHelp = () => displayHelpText && (
            <p className="text-xs text-slate-500 mt-1">{displayHelpText}</p>
        );

        switch (field_type) {
            case 'hidden':
                return (
                    <input
                        key={field_name}
                        type="hidden"
                        name={field_name}
                        value={value}
                        readOnly
                    />
                );

            case 'text':
            case 'email':
            case 'url':
            case 'tel':
            case 'number':
                return (
                    <div key={field_name} className={wrapperClasses}>
                        {renderLabel()}
                        <input
                            id={field_name}
                            type={field_type}
                            value={value}
                            dir={isArabic ? 'rtl' : 'ltr'}
                            onChange={(e) => handleFieldChange(field_name, e.target.value)}
                            placeholder={displayPlaceholder}
                            className={inputClasses}
                            required={is_required}
                            {...(validation_rules.minLength && { minLength: validation_rules.minLength })}
                            {...(validation_rules.maxLength && { maxLength: validation_rules.maxLength })}
                            {...(validation_rules.pattern && { pattern: validation_rules.pattern })}
                        />
                        {renderHelp()}
                        {renderError()}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field_name} className={wrapperClasses}>
                        {renderLabel()}
                        <textarea
                            id={field_name}
                            value={value}
                            dir={isArabic ? 'rtl' : 'ltr'}
                            onChange={(e) => handleFieldChange(field_name, e.target.value)}
                            placeholder={displayPlaceholder}
                            className={`${inputClasses} min-h-[120px] resize-y`}
                            required={is_required}
                            {...(validation_rules.minLength && { minLength: validation_rules.minLength })}
                            {...(validation_rules.maxLength && { maxLength: validation_rules.maxLength })}
                        />
                        {renderHelp()}
                        {renderError()}
                    </div>
                );

            case 'select':
                return (
                    <div key={field_name} className={wrapperClasses}>
                        {renderLabel()}
                        <select
                            id={field_name}
                            value={value}
                            dir={isArabic ? 'rtl' : 'ltr'}
                            onChange={(e) => handleFieldChange(field_name, e.target.value)}
                            className={inputClasses}
                            required={is_required}
                        >
                            <option value="">{displayPlaceholder || (isArabic ? 'اختر خياراً...' : 'Select an option...')}</option>
                            {field_options.map((option) => (
                                <option key={option.value || option} value={option.value || option}>
                                    {(isArabic && option.label_ar) ? option.label_ar : (option.label || option)}
                                </option>
                            ))}
                        </select>
                        {renderHelp()}
                        {renderError()}
                    </div>
                );

            case 'multiselect':
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <div key={field_name} className={wrapperClasses}>
                        {renderLabel()}
                        <div className="space-y-2">
                            {field_options.map((option) => {
                                const optionValue = option.value || option;
                                const optionLabel = (isArabic && option.label_ar) ? option.label_ar : (option.label || option);
                                const isChecked = selectedValues.includes(optionValue);

                                return (
                                    <label key={optionValue} className={`flex items-center gap-3 cursor-pointer group ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const newValues = e.target.checked
                                                    ? [...selectedValues, optionValue]
                                                    : selectedValues.filter(v => v !== optionValue);
                                                handleFieldChange(field_name, newValues);
                                            }}
                                            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
                                        />
                                        <span className={`text-sm text-slate-700 group-hover:text-slate-900 transition-colors ${isArabic ? 'font-arabic' : 'font-manrope'}`}>
                                            {optionLabel}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {renderHelp()}
                        {renderError()}
                    </div>
                );

            case 'file':
                return (
                    <div key={field_name} className={wrapperClasses}>
                        {renderLabel()}
                        <div className="relative">
                            <input
                                id={field_name}
                                type="file"
                                onChange={(e) => handleFileChange(field_name, e.target.files[0])}
                                className="hidden"
                                accept="image/*"
                                disabled={isUploading}
                            />
                            <label
                                htmlFor={field_name}
                                className={`${inputClasses} flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                    } ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <Upload size={20} className="text-slate-400" />
                                <span className="text-slate-600">
                                    {isUploading ? (isArabic ? 'جاري الرفع...' : 'Uploading...') : value ? (isArabic ? 'تغيير الملف' : 'Change file') : (isArabic ? 'اختر ملفاً' : 'Choose file')}
                                </span>
                            </label>
                            {value && !isUploading && (
                                <div className={`mt-2 flex ${isArabic ? 'justify-end' : 'justify-start'}`}>
                                    <img src={value} alt="Preview" className="h-20 w-20 object-cover rounded-lg border-2 border-slate-200" />
                                </div>
                            )}
                        </div>
                        {renderHelp()}
                        {renderError()}
                    </div>
                );

            default:
                return null;
        }
    };

    // Sort fields by display_order
    const sortedFields = [...fields].sort((a, b) =>
        (a.display_order || 0) - (b.display_order || 0)
    );

    return (
        <div className="space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
            {sortedFields.map(renderField)}
        </div>
    );
};

export default DynamicFormBuilder;
