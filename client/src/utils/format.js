export function usd(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
}

export function toDDMMYYYY(isoDate) {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return isoDate;
}

export function toYYYYMMDD(dmyDate) {
  if (!dmyDate) return "";
  const m1 = dmyDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;

  const m2 = dmyDate.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (m2) {
    const day = m2[1].padStart(2, "0");
    const monMap = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    const month = monMap[m2[2].toLowerCase()] || "01";
    let yr = m2[3];
    if (yr.length === 2) yr = (parseInt(yr, 10) > 50 ? "19" : "20") + yr;
    return `${yr}-${month}-${day}`;
  }

  return "";
}

export function getTodayDDMMYYYY() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
}

export function getTodayISO() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${y}-${m}-${d}`;
}
