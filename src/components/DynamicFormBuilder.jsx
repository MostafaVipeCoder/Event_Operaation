import { useState, useEffect, useCallback } from 'react';
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

    // Pre-fill any fields whose field_name matches a URL search param
    useEffect(() => {
        if (!fields.length) return;
        const params = new URLSearchParams(window.location.search);
        if (!params.toString()) return;

        const prefilled = {};
        fields.forEach(field => {
            const paramValue = params.get(field.field_name);
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
            field_type,
            field_options = [],
            is_required,
            placeholder,
            help_text,
            validation_rules: raw_validation_rules = {}
        } = field;

        const validation_rules = raw_validation_rules || {};

        const value = values[field_name] || '';
        const error = errors[field_name];
        const isUploading = uploadingFields[field_name];

        // Base field wrapper classes
        const wrapperClasses = "mb-6";
        const labelClasses = `block text-sm font-bold text-slate-700 mb-2 ${is_required ? 'required' : ''}`;
        const inputBaseClasses = "w-full px-4 py-3 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100";
        const inputClasses = error
            ? `${inputBaseClasses} border-red-300 focus:border-red-500`
            : `${inputBaseClasses} border-slate-200 focus:border-blue-500`;

        switch (field_type) {
            case 'hidden':
                // Hidden fields are invisible to the user but their value is submitted
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
                        <label htmlFor={field_name} className={labelClasses}>
                            {field_label}
                            {is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            id={field_name}
                            type={field_type}
                            value={value}
                            onChange={(e) => handleFieldChange(field_name, e.target.value)}
                            placeholder={placeholder}
                            className={inputClasses}
                            required={is_required}
                            {...(validation_rules.minLength && { minLength: validation_rules.minLength })}
                            {...(validation_rules.maxLength && { maxLength: validation_rules.maxLength })}
                            {...(validation_rules.pattern && { pattern: validation_rules.pattern })}
                        />
                        {help_text && (
                            <p className="text-xs text-slate-500 mt-1">{help_text}</p>
                        )}
                        {error && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertCircle size={12} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field_name} className={wrapperClasses}>
                        <label htmlFor={field_name} className={labelClasses}>
                            {field_label}
                            {is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <textarea
                            id={field_name}
                            value={value}
                            onChange={(e) => handleFieldChange(field_name, e.target.value)}
                            placeholder={placeholder}
                            className={`${inputClasses} min-h-[120px] resize-y`}
                            required={is_required}
                            {...(validation_rules.minLength && { minLength: validation_rules.minLength })}
                            {...(validation_rules.maxLength && { maxLength: validation_rules.maxLength })}
                        />
                        {help_text && (
                            <p className="text-xs text-slate-500 mt-1">{help_text}</p>
                        )}
                        {error && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertCircle size={12} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={field_name} className={wrapperClasses}>
                        <label htmlFor={field_name} className={labelClasses}>
                            {field_label}
                            {is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <select
                            id={field_name}
                            value={value}
                            onChange={(e) => handleFieldChange(field_name, e.target.value)}
                            className={inputClasses}
                            required={is_required}
                        >
                            <option value="">{placeholder || 'Select an option...'}</option>
                            {field_options.map((option) => (
                                <option key={option.value || option} value={option.value || option}>
                                    {option.label || option}
                                </option>
                            ))}
                        </select>
                        {help_text && (
                            <p className="text-xs text-slate-500 mt-1">{help_text}</p>
                        )}
                        {error && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertCircle size={12} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );

            case 'multiselect':
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <div key={field_name} className={wrapperClasses}>
                        <label className={labelClasses}>
                            {field_label}
                            {is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="space-y-2">
                            {field_options.map((option) => {
                                const optionValue = option.value || option;
                                const optionLabel = option.label || option;
                                const isChecked = selectedValues.includes(optionValue);

                                return (
                                    <label key={optionValue} className="flex items-center gap-3 cursor-pointer group">
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
                                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                            {optionLabel}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {help_text && (
                            <p className="text-xs text-slate-500 mt-1">{help_text}</p>
                        )}
                        {error && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertCircle size={12} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );

            case 'file':
                return (
                    <div key={field_name} className={wrapperClasses}>
                        <label htmlFor={field_name} className={labelClasses}>
                            {field_label}
                            {is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
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
                                    }`}
                            >
                                <Upload size={20} className="text-slate-400" />
                                <span className="text-slate-600">
                                    {isUploading ? 'Uploading...' : value ? 'Change file' : 'Choose file'}
                                </span>
                            </label>
                            {value && !isUploading && (
                                <div className="mt-2">
                                    <img src={value} alt="Preview" className="h-20 w-20 object-cover rounded-lg border-2 border-slate-200" />
                                </div>
                            )}
                        </div>
                        {help_text && (
                            <p className="text-xs text-slate-500 mt-1">{help_text}</p>
                        )}
                        {error && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertCircle size={12} />
                                <span>{error}</span>
                            </div>
                        )}
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
        <div className="space-y-4">
            {sortedFields.map(renderField)}
        </div>
    );
};

export default DynamicFormBuilder;
