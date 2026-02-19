import * as XLSX from 'xlsx';

/**
 * Generates an Excel template for the agenda.
 * Includes two sheets: "Days" and "Agenda Slots".
 */
export const generateAgendaTemplate = () => {
    // 1. Days Sheet Data
    const daysData = [
        ['Day Name', 'Date (YYYY-MM-DD)'],
        ['Day 1', '2026-01-01']
    ];

    // 2. Agenda Slots Sheet Data
    const slotsData = [
        ['Day Name', 'Slot Title', 'Start Time (HH:mm)', 'End Time (HH:mm)', 'Presenter Name', 'Show Presenter (TRUE/FALSE)'],
        ['Day 1', 'Sample Slot', '09:00', '10:00', 'Presenter Name', 'TRUE']
    ];

    // 3. Experts Sheet Data
    const expertsData = [
        ['Name', 'Title', 'Bio', 'LinkedIn URL'],
        ['Example Expert', 'CEO @ Example', 'A short bio about the expert', 'https://linkedin.com/in/example']
    ];

    // 4. Companies Sheet Data
    const companiesData = [
        ['Company Name', 'Founder', 'Governorate', 'Industry'],
        ['Example Company', 'Founder Name', 'City', 'Tech']
    ];

    const wb = XLSX.utils.book_new();

    // Create Sheets
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(daysData), 'Days');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(slotsData), 'Agenda Slots');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expertsData), 'Experts');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(companiesData), 'Companies');

    // Write file
    XLSX.writeFile(wb, 'Event_Data_Template.xlsx');
};

/**
 * Core parsing logic that converts a Workbook object into structured event data.
 */
export const parseWorkbook = (workbook) => {
    const sheetNames = workbook.SheetNames;
    const findSheet = (name) => {
        const exact = workbook.Sheets[name];
        if (exact) return exact;
        const lowerName = name.toLowerCase().replace(/\s/g, '');
        const found = sheetNames.find(sn => sn.toLowerCase().replace(/\s/g, '') === lowerName);
        return found ? workbook.Sheets[found] : null;
    };

    // Helper to validate columns
    const validateColumns = (sheet, sheetName, required) => {
        const firstRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || [];
        const missing = required.filter(req => {
            const hasExistent = firstRow.some(col => col.toLowerCase().replace(/\s/g, '') === req.toLowerCase().replace(/\s/g, ''));
            return !hasExistent;
        });
        if (missing.length > 0) {
            const err = new Error(`Sheet "${sheetName}" is missing columns: ${missing.join(', ')}`);
            err.type = 'MISSING_COLUMNS';
            err.sheetName = sheetName;
            err.missing = missing;
            err.found = firstRow;
            throw err;
        }
    };

    // Parse Days
    const daysSheet = findSheet('Days');
    if (!daysSheet) throw new Error(`Sheet "Days" is missing. Available sheets: ${sheetNames.join(', ')}`);
    validateColumns(daysSheet, 'Days', ['Day Name', 'Date']);
    const daysRaw = XLSX.utils.sheet_to_json(daysSheet);

    const days = daysRaw.map(row => ({
        day_name: row['Day Name'] || row['Name'] || row['day'],
        day_date: row['Date (YYYY-MM-DD)'] || row['Date'] || row['date']
    })).filter(d => d.day_name && d.day_date);

    // Parse Slots
    const slotsSheet = findSheet('Agenda Slots') || findSheet('Slots') || findSheet('Agenda');
    if (!slotsSheet) throw new Error(`Sheet "Agenda Slots" is missing. Available sheets: ${sheetNames.join(', ')}`);
    validateColumns(slotsSheet, 'Agenda Slots', ['Day Name', 'Slot Title', 'Start Time', 'End Time']);
    const slotsRaw = XLSX.utils.sheet_to_json(slotsSheet);

    const slots = slotsRaw.map(row => ({
        day_name: row['Day Name'],
        slot_title: row['Slot Title'] || row['Title'],
        start_time: row['Start Time (HH:mm)'] || row['Start Time'] || row['Start'],
        end_time: row['End Time (HH:mm)'] || row['End Time'] || row['End'],
        presenter_name: row['Presenter Name'] || row['Presenter'] || '',
        show_presenter: String(row['Show Presenter (TRUE/FALSE)'] || row['Show Presenter'] || 'TRUE').toUpperCase() === 'TRUE'
    })).filter(s => s.day_name && s.slot_title);

    // Parse Experts
    const expertsSheet = findSheet('Experts');
    let experts = [];
    if (expertsSheet) {
        validateColumns(expertsSheet, 'Experts', ['Name']);
        experts = XLSX.utils.sheet_to_json(expertsSheet).map(row => ({
            name: row['Name'] || row['Full Name'],
            title: row['Title'] || '',
            bio: row['Bio'] || '',
            linkedin_url: row['LinkedIn URL'] || row['LinkedIn'] || ''
        })).filter(e => e.name);
    }

    // Parse Companies
    const companiesSheet = findSheet('Companies') || findSheet('Startups');
    let companies = [];
    if (companiesSheet) {
        validateColumns(companiesSheet, 'Companies', ['Company Name']);
        companies = XLSX.utils.sheet_to_json(companiesSheet).map(row => ({
            name: row['Company Name'] || row['Name'] || row['Startup Name'],
            founder: row['Founder'] || row['CEO'] || '',
            location: row['Governorate'] || row['Location'] || row['City'] || '',
            industry: row['Industry'] || row['Sector'] || ''
        })).filter(c => c.name);
    }

    return { days, slots, experts, companies };
};

/**
 * Parses an uploaded Excel file.
 */
export const parseAgendaExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                resolve(parseWorkbook(workbook));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Fetches and parses a public Google Sheet as an XLSX file.
 */
export const fetchAndParseGoogleSheet = async (url) => {
    try {
        // Extract Spreadsheet ID
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) throw new Error('Invalid Google Sheets URL. Please ensure it is a valid /spreadsheets/d/ link.');
        const spreadsheetId = match[1];

        // Fetch XLSX export
        const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
        const response = await fetch(exportUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch Google Sheet. Ensure it is shared as "Anyone with the link can view".');
        }

        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        return parseWorkbook(workbook);
    } catch (error) {
        throw error;
    }
};
