// ============================================================
// FILE: src/utils/exportCSV.js
// PURPOSE: Generates and downloads a CSV file from an array
//          of transaction objects — runs entirely in browser
// PHASE: CSV Export
// USAGE: import { exportTransactionsToCSV } from
//          '../utils/exportCSV'
// ============================================================

// FUNCTION: exportTransactionsToCSV()
// PURPOSE: Converts transactions array to CSV string and
//          triggers a file download in the browser
// PARAMS:
//   transactions (array) — list of transaction objects
//   currency (string)    — e.g. 'PHP', 'USD'
//   filename (string)    — optional, default 'transactions'
// RETURNS: nothing — triggers browser file download
// ERRORS: if transactions is empty, show alert and return early

export const exportTransactionsToCSV = (
  transactions,
  currency,
  filename = 'transactions'
) => {

  // Guard: do nothing if no transactions to export
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export.');
    return;
  }

  // CSV column headers — must match data fields below
  // WHY: First row of CSV is always the header row
  const headers = [
    'Date',
    'Description',
    'Category',
    'Type',
    `Amount (${currency})`,
  ];

  // FUNCTION: formatDate()
  // PURPOSE: Formats ISO date string to readable format
  // PARAMS: dateString (string) — ISO date from MongoDB
  // RETURNS: formatted string e.g. "May 2, 2026"
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'long',
      day:   'numeric'
    });
  };

  // FUNCTION: escapeCSVField()
  // PURPOSE: Wraps field in quotes and escapes internal quotes
  //          WHY: Fields with commas or quotes break CSV format
  // PARAMS: field (any) — value to escape
  // RETURNS: safely escaped string
  const escapeCSVField = (field) => {
    const str = String(field ?? '');
    // If field contains comma, newline, or quote — wrap in quotes
    if (str.includes(',') || str.includes('\n') ||
        str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV rows — one array per transaction
  const rows = transactions.map(t => [
    escapeCSVField(formatDate(t.date)),
    escapeCSVField(t.description),
    escapeCSVField(t.category || ''),
    escapeCSVField(
      t.type.charAt(0).toUpperCase() + t.type.slice(1)
    ),
    escapeCSVField(t.amount.toFixed(2))
  ]);

  // Combine headers and rows into one CSV string
  // Each row joined by comma, each line by newline
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create a downloadable blob from the CSV string
  // BOM (\uFEFF) added for Excel UTF-8 compatibility
  // WHY: Without BOM, Excel may misread special characters
  const blob = new Blob(
    ['\uFEFF' + csvContent],
    { type: 'text/csv;charset=utf-8;' }
  );

  // Generate filename with date stamp
  // Example: transactions_2026-05-02.csv
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filename}_${dateStamp}.csv`;

  // Trigger browser download without opening a new tab
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  document.body.appendChild(link);
  link.click();

  // Clean up — remove link and revoke object URL
  // WHY: Prevents memory leaks from unused object URLs
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};