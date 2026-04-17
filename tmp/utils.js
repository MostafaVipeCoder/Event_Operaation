// src/lib/utils.js
var formatDate = (dateString, options = {}) => {
  if (!dateString)
    return "";
  const date = new Date(dateString);
  const locale = options.locale || "en-US";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options
  });
};
var formatTime = (input, lang = "en") => {
  if (!input)
    return "";
  const isAr = lang === "ar";
  const amLabel = isAr ? "ص" : "AM";
  const pmLabel = isAr ? "م" : "PM";
  if (typeof input === "number") {
    const totalMinutes = Math.round(input * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const h12 = hours % 12 || 12;
    const ampm = hours >= 12 ? pmLabel : amLabel;
    return `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }
  if (typeof input === "string" && input.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
    const [hours, minutes] = input.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? pmLabel : amLabel;
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }
  const date = new Date(input);
  if (!isNaN(date.getTime())) {
    return date.toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }
  return input;
};
var extractGoogleDriveId = (url) => {
  if (!url)
    return null;
  if (url.match(/^[-\w]{25,50}$/))
    return url;
  const patterns = [
    /\/file\/d\/([-\w]{25,})/,
    /\/d\/([-\w]{25,})/,
    /[?&]id=([-\w]{25,})/,
    /uc\?id=([-\w]{25,})/,
    /open\?id=([-\w]{25,})/,
    /drive\.google\.com\/uc\?export=view&id=([-\w]{25,})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1])
      return match[1];
  }
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    const parts = url.split(/[\/\?&=]/);
    const likelyId = parts.find((part) => part.match(/^[-\w]{25,50}$/));
    if (likelyId)
      return likelyId;
  }
  return null;
};
var getGoogleDriveFallbackUrls = (url) => {
  if (!url)
    return [];
  if (!url.includes("drive.google.com") && !url.includes("docs.google.com") && !url.match(/^[-\w]{25,50}$/)) {
    return [url];
  }
  const id = extractGoogleDriveId(url);
  if (!id)
    return [url];
  return [
    `https://drive.google.com/thumbnail?id=${id}&sz=w100`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w150`,
    `https://lh3.googleusercontent.com/d/${id}=w200`,
    `https://lh3.googleusercontent.com/d/${id}`,
    `https://drive.google.com/uc?export=view&id=${id}`
  ];
};
var getGoogleDriveFullSizeUrls = (url) => {
  if (!url)
    return [];
  if (!url.includes("drive.google.com") && !url.includes("docs.google.com") && !url.match(/^[-\w]{25,50}$/)) {
    return [url];
  }
  const id = extractGoogleDriveId(url);
  if (!id)
    return [url];
  return [
    `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
    `https://lh3.googleusercontent.com/d/${id}=w1600`,
    `https://lh3.googleusercontent.com/d/${id}`,
    `https://drive.google.com/uc?export=view&id=${id}`
  ];
};
var getGoogleDriveDirectLink = (url) => {
  const fallbacks = getGoogleDriveFullSizeUrls(url);
  return fallbacks.length > 0 ? fallbacks[0] : url;
};
var exportToCSV = (data, filename = "export.csv") => {
  if (!data || !data.length)
    return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => {
      const cell = row[header] === null || row[header] === undefined ? "" : row[header];
      const escaped = ("" + cell).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(","))
  ].join(`
`);
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
export {
  getGoogleDriveFullSizeUrls,
  getGoogleDriveFallbackUrls,
  getGoogleDriveDirectLink,
  formatTime,
  formatDate,
  extractGoogleDriveId,
  exportToCSV
};
