export const formatDate = (dateString, options = {}) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = options.locale || 'en-US';
    
    return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options
    });
};

export const formatTime = (input, lang = 'en') => {
    if (!input) return '';

    const isAr = lang === 'ar';
    const amLabel = isAr ? 'ص' : 'AM';
    const pmLabel = isAr ? 'م' : 'PM';

    // Handle potential numeric input (Excel time as fraction of day)
    if (typeof input === 'number') {
        const totalMinutes = Math.round(input * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const h12 = hours % 12 || 12;
        const ampm = hours >= 12 ? pmLabel : amLabel;
        return `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    // Case 1: Simple "HH:mm" or "HH:mm:ss" string (e.g. from manual input or simple API)
    if (typeof input === 'string' && input.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        const [hours, minutes] = input.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? pmLabel : amLabel;
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    }

    // Case 2: Full Date string (ISO) or Date object
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Fallback: return as is if parsing fails
    return input;
};

export const getGoogleDriveDirectLink = (url) => {
    if (!url) return '';

    // Check if it's already a direct link or not Google Drive
    if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
        return url;
    }

    // Extraction patterns:
    // 1. /file/d/ID/view
    // 2. id=ID
    // 3. /d/ID/ (folders or simple file paths)
    const idMatch = url.match(/\/d\/([-\w]{25,})/) ||
        url.match(/[?&]id=([-\w]{25,})/) ||
        url.match(/\/file\/d\/([-\w]{25,})/);

    if (idMatch && idMatch[1]) {
        // The thumbnail endpoint is much more reliable than uc?export=view 
        // because it avoids the "virus scan" warning on larger images
        // and doesn't require specific cookie settings.
        // sz=w1500 ensures high resolution.
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1500`;
    }

    return url;
};

export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || !data.length) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const cell = row[header] === null || row[header] === undefined ? '' : row[header];
            // Escape quotes and wrap in quotes if contains comma or newline
            const escaped = ('' + cell).replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(','))
    ].join('\n');

    // Add BOM for Excel UTF-8 support
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
