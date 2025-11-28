export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export const fmtUSD = (n: number) => (isFinite(n) ? n : 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const fmtUSD2 = (n: number) => (isFinite(n) ? n : 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

export const toNum = (v: any, d = 0) => {
  const n = Number(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return isFinite(n) ? n : d;
};

// Fix: use replace with regex instead of replaceAll for compatibility
export const buildCSV = (rows: any[][]) => {
  return rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
};

export const downloadJSON = (obj: any, name = "comp_model.json") => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const encodeState = (state: any) => {
  try {
    return btoa(JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to encode state", e);
    return "";
  }
};

export const decodeState = (str: string) => {
  try {
    return JSON.parse(atob(str));
  } catch (e) {
    console.warn("Failed to decode state", e);
    return null;
  }
};