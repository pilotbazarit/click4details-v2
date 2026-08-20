// amount-field magnitude suggestions (same idea as the vehicle pricing form's
// Purchase Price / Tax / Other Charges inputs): typing "5" suggests
// 5 / 50 / 500 / 5,000 / 50,000 so staff can quickly pick the right scale.
// Shared between VehiclePurchaseCalculationPanel.jsx and PurchasePaymentModal.jsx.

const formatIndianNumber = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("en-IN").format(Number(digits));
};

const numberWordsUnderTwenty = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const numberWordsTens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const numberToWordsBelowThousand = (num) => {
  if (num < 20) return numberWordsUnderTwenty[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return unit ? `${numberWordsTens[ten]} ${numberWordsUnderTwenty[unit]}` : numberWordsTens[ten];
  }
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return remainder
    ? `${numberWordsUnderTwenty[hundred]} Hundred ${numberToWordsBelowThousand(remainder)}`
    : `${numberWordsUnderTwenty[hundred]} Hundred`;
};

const numberToIndianWords = (value) => {
  const numeric = Number(String(value).replace(/\D+/g, ""));
  if (!numeric) return "";
  if (numeric < 1000) return numberToWordsBelowThousand(numeric);
  const parts = [];
  const units = [
    { value: 10000000, label: "Crore" },
    { value: 100000, label: "Lakh" },
    { value: 1000, label: "Thousand" },
  ];
  let remaining = numeric;
  units.forEach((unit) => {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value);
      parts.push(`${numberToIndianWords(count)} ${unit.label}`);
      remaining %= unit.value;
    }
  });
  if (remaining > 0) parts.push(numberToWordsBelowThousand(remaining));
  return parts.join(" ").replace(/\s+/g, " ").trim();
};

export const buildAmountOptions = (baseValue) => {
  if (baseValue === null || baseValue === undefined) return [];
  const normalized = String(baseValue).split(".")[0].replace(/\D+/g, "").trim();
  if (normalized.length === 0 || normalized.startsWith("0") || !/^\d+$/.test(normalized)) return [];
  return Array.from({ length: 5 }, (_, i) => {
    const value = `${normalized}${"0".repeat(i)}`;
    return { value, label: formatIndianNumber(value), words: numberToIndianWords(value) };
  });
};
