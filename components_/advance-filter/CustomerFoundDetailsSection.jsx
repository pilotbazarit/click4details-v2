"use client";

import dayjs from "dayjs";
import { FacebookIcon, MessengerIcon } from "@/components/dashboard/sales-team-activity/ActivityIcons";

const EMPTY = "—";

const fmt = (v) => {
  if (v === null || v === undefined || v === "") return EMPTY;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

const mdTitle = (rel) => {
  if (!rel) return EMPTY;
  if (typeof rel === "object" && rel.md_title != null && rel.md_title !== "") return String(rel.md_title);
  return fmt(rel);
};

/** Prefer API-resolved master-data title; avoid showing raw md_id on customer detail / filter views. */
const masterDataFieldLabel = (customer, displayKey, snakeKey, camelKey) => {
  const display = customer?.[displayKey];
  if (display != null && String(display).trim() !== "") {
    return String(display).trim();
  }
  return mdTitle(customer?.[snakeKey] ?? customer?.[camelKey]);
};

const formatDt = (v) => {
  if (!v) return EMPTY;
  const d = dayjs(v);
  return d.isValid() ? d.format("YYYY-MM-DD HH:mm") : String(v);
};

const formatDateOnly = (v) => {
  if (!v) return EMPTY;
  const d = dayjs(v);
  return d.isValid() ? d.format("YYYY-MM-DD") : String(v);
};

const LINK_DISPLAY_MAX = 35;

function formatExternalLink(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "") return EMPTY;
  const rawStr = String(raw).trim();
  const href = /^https?:\/\//i.test(rawStr) ? rawStr : `https://${rawStr}`;
  const display = rawStr.length > LINK_DISPLAY_MAX ? `${rawStr.slice(0, LINK_DISPLAY_MAX)}…` : rawStr;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline break-all"
      title={rawStr}
    >
      {display}
    </a>
  );
}

function formatTel(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "") return EMPTY;
  const num = String(raw).trim();
  return (
    <a href={`tel:${num}`} className="text-blue-600 hover:underline">
      {num}
    </a>
  );
}

function formatEmail(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "") return EMPTY;
  const email = String(raw).trim();
  return (
    <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
      {email}
    </a>
  );
}

/** Resolve API shapes: nested user object on created_by / relation aliases — never pass raw objects to fmt(). */
const formatActorName = (customer, { userKeys, rawKey }) => {
  for (const key of userKeys) {
    const rel = customer[key];
    const n = rel?.name;
    if (n != null && n !== "") return String(n);
  }
  const raw = customer[rawKey];
  if (raw == null || raw === "") return EMPTY;
  if (typeof raw === "object") {
    if (raw.name != null && raw.name !== "") return String(raw.name);
    if (raw.id != null) return `#${raw.id}`;
    return EMPTY;
  }
  return fmt(raw);
};

function parseReadyBudget(customer) {
  const raw = customer?.ready_budget;
  if (raw === null || raw === undefined || raw === "") return EMPTY;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length >= 2) {
      const a = Number(parsed[0]);
      const b = Number(parsed[1]);
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        return `${a.toLocaleString()} – ${b.toLocaleString()}`;
      }
    }
  } catch {
    /* ignore */
  }
  return fmt(raw);
}

function splitIntoThreeColumns(rows) {
  const n = rows.length;
  if (n === 0) return [[], [], []];
  const base = Math.floor(n / 3);
  const rem = n % 3;
  const lenA = base + (rem >= 1 ? 1 : 0);
  const lenB = base + (rem >= 2 ? 1 : 0);
  const lenC = base;
  const a = rows.slice(0, lenA);
  const b = rows.slice(lenA, lenA + lenB);
  const c = rows.slice(lenA + lenB);
  return [a, b, c];
}

function FieldRows({ rows, dense = false, threeColumn = true }) {
  const rowPad = dense ? "py-0.5 sm:py-0.5" : "py-1 sm:py-1";
  const textSize = dense ? "text-[13px] leading-snug" : "text-sm leading-snug";

  const renderColumn = (colRows, colKey) => (
    <div className={`overflow-hidden ${textSize}`}>
      {colRows.map(({ label, value }) => (
        <div
          key={`${colKey}-${label}`}
          className={`grid grid-cols-[minmax(4.5rem,38%)_minmax(0,1fr)] gap-x-2 sm:gap-x-2.5 items-baseline px-1 sm:px-2 ${rowPad}`}
        >
          <span className="text-gray-500 font-medium shrink-0 text-right pr-1.5 sm:pr-2">{label}</span>
          <span className="text-gray-900 min-w-0 break-words text-left">{value}</span>
        </div>
      ))}
    </div>
  );

  const useThree = threeColumn && rows.length > 1;
  if (!useThree) {
    return renderColumn(rows, "c");
  }

  const [colA, colB, colC] = splitIntoThreeColumns(rows);
  const columns = [colA, colB, colC].filter((c) => c.length > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 sm:gap-x-6 lg:gap-x-8 items-start">
      {columns.map((colRows, i) => renderColumn(colRows, `c${i}`))}
    </div>
  );
}

function Section({ title, children, className = "" }) {
  return (
    <div className={`p-3 sm:p-4 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">{title}</h4>
      {children}
    </div>
  );
}

export default function CustomerFoundDetailsSection({ customer, activities = [], activitiesLoading = false }) {
  if (!customer) return null;

  const c = customer;

  const basicRows = [
    { label: "Name", value: fmt(c.name) },
    { label: "Mobile", value: formatTel(c.mobile) },
    { label: "Email", value: formatEmail(c.email) },
    { label: "Address", value: fmt(c.address) },
    { label: "Date of birth", value: formatDateOnly(c.date_of_birth) },
    { label: "Anniversary", value: formatDateOnly(c.anniversary_date) },
  ];

  const socialRows = [
    {
      label: "Links", value: (c.facebook_id_link || c.facebook_messenger_link) ? (
        <div className="inline-flex items-center gap-2">
          {c.facebook_id_link && (
            <a href={c.facebook_id_link} target="_blank" rel="noreferrer" className="hover:opacity-80" title="Open Facebook">
              <FacebookIcon />
            </a>
          )}
          {c.facebook_messenger_link && (
            <a href={c.facebook_messenger_link} target="_blank" rel="noreferrer" className="hover:opacity-80" title="Open Messenger">
              <MessengerIcon />
            </a>
          )}
        </div>
      ) : EMPTY
    },
  ];

  const purchaseRows = [
    { label: "Purchase reason", value: mdTitle(c.purchase_reason ?? c.purchaseReason) },
    { label: "Ready budget (range)", value: parseReadyBudget(c) },
    { label: "Interested for loan", value: fmt(c.interested_for_loan) },
    { label: "Bank loan amount", value: mdTitle(c.bank_loan_amount ?? c.bankLoanAmount) },
    { label: "Car available", value: mdTitle(c.car_available ?? c.carAvailable) },
  ];

  const profileRows = [
    { label: "Client level", value: masterDataFieldLabel(c, "client_level_display", "client_level", "clientLevel") },
    { label: "Client seriousness", value: masterDataFieldLabel(c, "client_seriousness_display", "client_seriousness", "clientSeriousness") },
    { label: "Client profession", value: mdTitle(c.client_profession ?? c.clientProfession) },
    { label: "Income / month", value: mdTitle(c.client_income_per_month ?? c.clientIncomePerMonth) },
    { label: "Company transaction", value: mdTitle(c.client_company_transaction ?? c.clientCompanyTransaction) },
    { label: "Car exchange / year", value: mdTitle(c.car_exchange_category_per_year ?? c.carExchangeCategoryPerYear) },
    { label: "Client attitude", value: fmt(c.client_attitude) },
    { label: "Last purchase date", value: formatDateOnly(c.client_last_purchase_date) },
    { label: "Description", value: fmt(c.description) },
  ];

  const metaRows = [
    { label: "Visiting card image", value: c.visiting_card_image ? fmt(c.visiting_card_image) : EMPTY },
  ];

  const allCustomerRows = [
    ...basicRows,
    ...socialRows,
    ...purchaseRows,
    ...profileRows,
    ...metaRows,
  ];

  return (
    <div className="space-y-3">
      <Section title="Customer information">
        <FieldRows rows={allCustomerRows} />
      </Section>

      <Section title="Sales team activity">
        {activitiesLoading ? (
          <p className="text-sm text-gray-600">Loading activities…</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-600">No sales team activity rows linked to this customer.</p>
        ) : (
          <div className="space-y-2">
            {activities.map((row, idx) => {
              const activityRows = [
                { label: "Data collect by", value: fmt(row.data_collect_by_name ?? row.data_collect_by) },
                { label: "First visit date", value: formatDateOnly(row.first_visit_date) },
                { label: "First visit by", value: fmt(row.first_visit_by_name ?? row.first_visit_by) },
                { label: "Second visit date", value: formatDateOnly(row.second_visit_date) },
                { label: "Second visit by", value: fmt(row.second_visit_by_name ?? row.second_visit_by) },
                { label: "Third visit date", value: formatDateOnly(row.third_visit_date) },
                { label: "Third visit by", value: fmt(row.third_visit_by_name ?? row.third_visit_by) },
                { label: "Sold date", value: formatDateOnly(row.sold_date) },
                { label: "Sold by", value: fmt(row.sold_by_name ?? row.sold_by) },
                { label: "Bot message", value: fmt(row.bot_message) },
                { label: "Not interested", value: fmt(row.not_interested) },
                { label: "Sale done", value: fmt(row.sale_done) },
                { label: "Note", value: fmt(row.note) },
                { label: "Note modified", value: formatDt(row.note_modified_time) },
                { label: "Note modified by", value: fmt(row.note_modified_by_name ?? row.note_modified_by) },
                { label: "Follow-ups count", value: fmt(row.followups_count) },
              ];
              return (
                <div key={row.id ?? idx} className="overflow-hidden">
                  <FieldRows rows={activityRows} dense />
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
