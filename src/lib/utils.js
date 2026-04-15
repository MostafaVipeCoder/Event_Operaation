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

/**
 * Extracts Google Drive file ID from any Google Drive URL format.
 * Returns null if the URL is not a Google Drive link or ID can't be extracted.
 */
export const extractGoogleDriveId = (url) => {
    if (!url) return null;
    if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return null;

    // Patterns:
    // 1. /file/d/ID/view
    // 2. /d/ID/
    // 3. ?id=ID or &id=ID
    // 4. /open?id=ID
    const patterns = [
        /\/file\/d\/([-\w]{10,})/,
        /\/d\/([-\w]{10,})/,
        /[?&]id=([-\w]{10,})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    return null;
};

/**
 * Converts a Google Drive sharing URL to a direct image URL.
 * Uses lh3.googleusercontent.com/d/ID as primary (most reliable - no consent page).
 * Falls back to thumbnail endpoint if image is not accessible via lh3.
 */
export const getGoogleDriveDirectLink = (url) => {
    if (!url) return '';

    const id = extractGoogleDriveId(url);

    if (id) {
        // lh3.googleusercontent.com/d/ID is the most reliable:
        // - No virus scan / consent page for any file size
        // - No cookies required
        // - Works for publicly shared files
        return `https://lh3.googleusercontent.com/d/${id}`;
    }

    // Not a Drive link — return as-is (Supabase Storage, Cloudinary, etc.)
    return url;
};

/**
 * Returns an ordered list of URLs to try for a Google Drive image.
 * LazyImage uses this for automatic fallback.
 */
export const getGoogleDriveFallbackUrls = (url) => {
    if (!url) return [];

    const id = extractGoogleDriveId(url);
    if (!id) return [url]; // Non-Drive URL: no fallback needed

    return [
        `https://lh3.googleusercontent.com/d/${id}`,           // Primary: most reliable
        `https://drive.google.com/thumbnail?id=${id}&sz=w1500`, // Secondary: thumbnail API
        `https://drive.google.com/uc?export=view&id=${id}`,    // Tertiary: direct download (may show consent)
    ];
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
