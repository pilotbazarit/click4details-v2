'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  Filter,
  Palette,
  Package,
  RotateCcw,
  ShoppingBag,
  Store,
  Tags,
  UserCircle,
  Users,
} from 'lucide-react';
import DashboardReportService from '@/services/DashboardReportService';
import ShopService from '@/services/ShopService';
import { useAppContext } from '@/context/AppContext';
import { hasPermission } from '@/lib/utils';

const Select = dynamic(() => import('react-select'), { ssr: false });

const tabs = [
  {
    id: 'product',
    label: 'Product',
    icon: Package,
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: UserCircle,
  },
  {
    id: 'shopMember',
    label: 'Shop Member',
    icon: Users,
  },
];

const accountInfo = [
  { label: 'Account Name', value: '--' },
  { label: 'Account Type', value: '--' },
  { label: 'Account Status', value: '--' },
  { label: 'Contact Number', value: '--' },
];

const productAmountConfigs = [
  {
    label: 'Sold Amount',
    reportKey: 'total_sold_amount',
    icon: ShoppingBag,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    chartColor: '#059669',
  },
  {
    label: 'Total Paid Amount',
    reportKey: 'total_paid_amount',
    icon: BadgeDollarSign,
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    chartColor: '#2563eb',
  },
  {
    label: 'Total Due Amount',
    reportKey: 'total_due_amount',
    icon: Store,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    chartColor: '#d97706',
  },
];

const productBreakdownConfigs = [
  {
    key: 'brand_wise_product_count',
    title: 'Brand Wise Product Count',
    subtitle: 'Top brands by product count',
    type: 'brand',
  },
  {
    key: 'colour_wise_product_count',
    title: 'Colour Wise Product Count',
    subtitle: 'Top colours by product count',
    type: 'colour',
  },
  {
    key: 'condition_wise_product_count',
    title: 'Condition Wise Product Count',
    subtitle: 'Products grouped by condition',
    type: 'condition',
  },
  {
    key: 'fuel_wise_product_count',
    title: 'Fuel Wise Product Count',
    subtitle: 'Products grouped by fuel type',
    type: 'fuel',
  },
  {
    key: 'location_wise_product_count',
    title: 'Location Wise Product Count',
    subtitle: 'Products grouped by location',
    type: 'location',
  },
  {
    key: 'model_wise_product_count',
    title: 'Model Wise Product Count',
    subtitle: 'Top models by product count',
    type: 'model',
  },
  {
    key: 'outlet_wise_product_count',
    title: 'Outlet Wise Product Count',
    subtitle: 'Products grouped by outlet',
    type: 'outlet',
  },
  {
    key: 'package_wise_product_count',
    title: 'Package Wise Product Count',
    subtitle: 'Products grouped by package',
    type: 'package',
  },
  {
    key: 'status_wise_product_count',
    title: 'Status Wise Product Count',
    subtitle: 'Products grouped by current status',
    type: 'status',
  },
];

const PRODUCT_TYPE = 'vehicle';
const DEFAULT_FROM_DATE = '2025-01-01';

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const createDefaultProductFilter = () => ({
  fromDate: DEFAULT_FROM_DATE,
  toDate: getTodayDate(),
  shopIds: [],
});

const buildProductBreakdownHref = (reportKey, filter = {}) => {
  const params = new URLSearchParams({ report: reportKey, product_type: PRODUCT_TYPE });
  const selectedShopIds = Array.isArray(filter.shopIds)
    ? filter.shopIds.filter(Boolean).join(',')
    : '';

  if (filter.fromDate) params.set('from_date', filter.fromDate);
  if (filter.toDate) params.set('to_date', filter.toDate);
  if (selectedShopIds) params.set('shop_id', selectedShopIds);

  return `/dashboard/product-breakdown-report?${params.toString()}`;
};

const parseUserValue = (value) => {
  if (!value) return null;

  try {
    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
    return typeof parsedValue === 'string' ? JSON.parse(parsedValue) : parsedValue;
  } catch (error) {
    console.log('Failed to parse user data:', error);
    return null;
  }
};

const mergeUniqueShopOptions = (...shopOptionGroups) => {
  const seenShopIds = new Set();

  return shopOptionGroups
    .flat()
    .filter((shopOption) => {
      const shopId = shopOption?.value;
      if (shopId === undefined || shopId === null) return false;

      const normalizedShopId = String(shopId);
      if (seenShopIds.has(normalizedShopId)) return false;

      seenShopIds.add(normalizedShopId);
      return true;
    });
};

const shopSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    minHeight: '40px',
    borderColor: state.isFocused ? '#0ea5e9' : '#e2e8f0',
    borderRadius: '6px',
    boxShadow: state.isFocused ? '0 0 0 2px #e0f2fe' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#0ea5e9' : '#e2e8f0',
    },
  }),
  valueContainer: (baseStyles) => ({
    ...baseStyles,
    padding: '2px 8px',
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
  }),
  menuPortal: (baseStyles) => ({
    ...baseStyles,
    zIndex: 50,
  }),
};

const toSafeNumber = (value) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatNumber = (value) => toSafeNumber(value).toLocaleString('en-US');

const formatCurrency = (value) =>
  `৳ ${toSafeNumber(value).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}`;

const financialReportOrder = [
  'total_sold_amount',
  'total_paid_amount',
  'total_due_amount',
  'total_purchase',
  'total_purchase_expenditure',
  'total_costing_price',
  'total_other_charges_expenditure',
  'total_asking_price',
  'total_fixed_price',
  'total_variable_price',
  'total_b2b_price',
  'revenue_generation',
];

const normalizeFinancialReportItems = (report) => {
  if (!report || typeof report !== 'object') return [];

  return Object.entries(report)
    .map(([key, value]) => ({
      key,
      label: humanizeLabel(key),
      amount: toSafeNumber(value),
      order: financialReportOrder.includes(key)
        ? financialReportOrder.indexOf(key)
        : financialReportOrder.length,
    }))
    .filter((item) => Number.isFinite(item.amount))
    .sort((firstItem, secondItem) => {
      if (firstItem.order !== secondItem.order) {
        return firstItem.order - secondItem.order;
      }

      return firstItem.label.localeCompare(secondItem.label);
    });
};

const humanizeLabel = (value) =>
  String(value || 'Unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeCountItems = (items) => {
  if (Array.isArray(items)) {
    return items
      .map((item, index) => ({
        id: item?.id ?? item?.name ?? index,
        name: item?.name || 'Unknown',
        total: toSafeNumber(item?.total),
      }))
      .filter((item) => item.total > 0)
      .sort((firstItem, secondItem) => secondItem.total - firstItem.total);
  }

  if (items && typeof items === 'object') {
    return Object.entries(items)
      .map(([name, total], index) => ({
        id: name || index,
        name: humanizeLabel(name),
        total: toSafeNumber(total),
      }))
      .filter((item) => item.total > 0)
      .sort((firstItem, secondItem) => secondItem.total - firstItem.total);
  }

  return [];
};

const normalizeShopWiseProductReport = (items) =>
  Array.isArray(items)
    ? items
        .map((item, index) => ({
          id: item?.shop_id ?? index,
          shopName: item?.shop_name || 'Unknown Shop',
          totalProduct: toSafeNumber(
            item?.total_product ?? item?.total_products ?? item?.product_count ?? item?.total,
          ),
        }))
        .filter((item) => item.totalProduct > 0)
        .sort((firstItem, secondItem) => secondItem.totalProduct - firstItem.totalProduct)
    : [];

const getPercentage = (value, total) => {
  const safeTotal = toSafeNumber(total);
  if (!safeTotal) return 0;

  return Math.round((toSafeNumber(value) / safeTotal) * 100);
};

const getColourSwatch = (name) => {
  const colourName = String(name || '').toLowerCase();

  if (colourName.includes('black')) return '#111827';
  if (colourName.includes('white')) return '#ffffff';
  if (colourName.includes('pearl')) return '#f8fafc';
  if (colourName.includes('silver')) return '#cbd5e1';
  if (colourName.includes('gray') || colourName.includes('grey')) return '#64748b';
  if (colourName.includes('blue')) return '#2563eb';
  if (colourName.includes('red')) return '#dc2626';
  if (colourName.includes('green')) return '#16a34a';
  if (colourName.includes('yellow')) return '#eab308';
  if (colourName.includes('gold')) return '#f59e0b';
  if (colourName.includes('orange')) return '#ea580c';
  if (colourName.includes('brown')) return '#92400e';
  if (colourName.includes('purple')) return '#7c3aed';

  return '#94a3b8';
};

const getBreakdownColor = (type, name, index) => {
  if (type === 'colour') return getColourSwatch(name);

  const statusName = String(name || '').toLowerCase();
  if (type === 'status') {
    if (statusName.includes('available')) return '#16a34a';
    if (statusName.includes('sold')) return '#2563eb';
    if (statusName.includes('booked')) return '#d97706';
    if (statusName.includes('hold')) return '#dc2626';
    if (statusName.includes('dealer')) return '#7c3aed';
  }

  const colours = ['#0f172a', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2'];
  return colours[index % colours.length];
};

const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {items.map((item) => (
      <div
        key={item.label}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p className="text-sm font-medium text-slate-500">{item.label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
      </div>
    ))}
  </div>
);

const ProductSummaryChart = ({ items, dateRange }) => {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const hasChartData = totalAmount > 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let segmentOffset = 0;

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Product Amount Chart</h3>
            <p className="text-sm text-slate-500">{dateRange}</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-700">Total: {formatCurrency(totalAmount)}</p>
      </div>

      <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[260px_1fr]">
        <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="14"
            />
            {hasChartData &&
              items.map((item) => {
                const percentage = item.amount / totalAmount;
                const dashLength = percentage * circumference;
                const currentOffset = segmentOffset;
                segmentOffset += dashLength;

                return (
                  <circle
                    key={item.label}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={item.chartColor}
                    strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                    strokeDashoffset={-currentOffset}
                    strokeLinecap="round"
                    strokeWidth="14"
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-500">
              {hasChartData ? 'Total Amount' : 'No data'}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const percentage = hasChartData
              ? Math.round((item.amount / totalAmount) * 100)
              : 0;

            return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.chartColor }}
                    />
                    {item.label}
                  </div>
                  <span className="font-semibold text-slate-900">{percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.chartColor,
                    }}
                  />
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CountBreakdownCard = ({ title, subtitle, items, total, type, viewAllHref }) => {
  const visibleItems = items.slice(0, 8);
  const isColour = type === 'colour';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
          Top {visibleItems.length}
        </span>
      </div>

      {visibleItems.length > 0 ? (
        <div className="space-y-3">
          {visibleItems.map((item, index) => {
            const percentage = getPercentage(item.total, total);
            const breakdownColour = getBreakdownColor(type, item.name, index);

            return (
              <div key={`${item.id}-${item.name}`}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
                    {isColour ? (
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-200"
                        style={{ backgroundColor: breakdownColour }}
                      />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                        {index + 1}
                      </span>
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold text-slate-900">{formatNumber(item.total)}</span>
                    <span className="w-10 text-right text-slate-500">{percentage}%</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: breakdownColour,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
          No data found
        </div>
      )}

      {viewAllHref && (
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
          <Link
            href={viewAllHref}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

const FinancialReportGrid = ({ report }) => {
  const [activeFinancialMetric, setActiveFinancialMetric] = useState(null);
  const financialItems = normalizeFinancialReportItems(report);
  const chartItems = financialItems
    .filter((item) => item.amount !== 0)
    // .sort((firstItem, secondItem) => Math.abs(secondItem.amount) - Math.abs(firstItem.amount))
    .slice(0, 8);
  const chartTotal = chartItems.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const chartRadius = 40;
  const chartCircumference = 2 * Math.PI * chartRadius;
  const chartColours = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#475569', '#dc2626'];
  let chartOffset = 0;

  console.log("===============financialItems=============", financialItems);
  console.log("chartItems0000000000000----------------", chartItems);

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Financial Report</h3>
          {/* <p className="text-sm text-slate-500">Dynamic values from data.financial_report</p> */}
        </div>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
          {financialItems.length} metrics
        </span>
      </div>

      {financialItems.length > 0 ? (
        <>
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">Financial Metrics Pie Chart</h4>
                <p className="text-sm text-slate-500">Top values by amount share</p>
              </div>
            </div>

            {chartItems.length > 0 ? (
              <div className="grid grid-cols-1 items-center gap-6 xl:grid-cols-[420px_1fr]">
                <div className="relative mx-auto flex h-80 w-80 items-center justify-center sm:h-96 sm:w-96">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                    <circle
                      cx="60"
                      cy="60"
                      r={chartRadius}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="18"
                    />
                    {chartItems.map((item, index) => {
                      const sliceValue = Math.abs(item.amount);
                      const dashLength = chartTotal
                        ? (sliceValue / chartTotal) * chartCircumference
                        : 0;
                      const percentage = chartTotal
                        ? Math.round((sliceValue / chartTotal) * 100)
                        : 0;
                      const sliceColor = chartColours[index % chartColours.length];
                      const currentOffset = chartOffset;
                      chartOffset += dashLength;

                      return (
                        <circle
                          key={`pie-${item.key}`}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                          cx="60"
                          cy="60"
                          r={chartRadius}
                          fill="none"
                          stroke={sliceColor}
                          strokeDasharray={`${dashLength} ${chartCircumference - dashLength}`}
                          strokeDashoffset={-currentOffset}
                          strokeLinecap="round"
                          strokeWidth="18"
                          onMouseEnter={() =>
                            setActiveFinancialMetric({
                              ...item,
                              percentage,
                              color: sliceColor,
                            })
                          }
                          onMouseLeave={() => setActiveFinancialMetric(null)}
                        />
                      );
                    })}
                  </svg>
                  {activeFinancialMetric && (
                    <div className="pointer-events-none absolute left-1/2 top-2 z-10 w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: activeFinancialMetric.color }}
                        />
                        <p className="text-sm font-semibold text-slate-900">
                          {activeFinancialMetric.label}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          activeFinancialMetric.amount < 0 ? 'text-red-700' : 'text-slate-950'
                        }`}
                      >
                        {formatCurrency(activeFinancialMetric.amount)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {activeFinancialMetric.percentage}% of chart
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="max-w-40 px-2 text-sm font-semibold leading-tight text-slate-500">
                      {activeFinancialMetric?.label || 'Top Metrics'}
                    </p>
                    <p
                      className={`mt-2 max-w-44 text-2xl font-bold leading-tight ${
                        activeFinancialMetric?.amount < 0 ? 'text-red-700' : 'text-slate-950'
                      }`}
                    >
                      {activeFinancialMetric
                        ? formatCurrency(activeFinancialMetric.amount)
                        : formatCurrency(chartTotal)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {activeFinancialMetric
                        ? `${activeFinancialMetric.percentage}% share`
                        : 'Total share'}
                    </p>
                  </div>
                </div>

                {
                  console.log("chartItems", chartItems)
                }

                <div className="space-y-3">
                  {chartItems.map((item, index) => {
                    const isNegative = item.amount < 0;
                    const percentage = chartTotal
                      ? Math.round((Math.abs(item.amount) / chartTotal) * 100)
                      : 0;

                    return (
                      <div
                        key={`legend-${item.key}`}
                        className="rounded-md p-1 transition hover:bg-white"
                        onMouseEnter={() =>
                          setActiveFinancialMetric({
                            ...item,
                            percentage,
                            color: chartColours[index % chartColours.length],
                          })
                        }
                        onMouseLeave={() => setActiveFinancialMetric(null)}
                      >
                        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: chartColours[index % chartColours.length] }}
                            />
                            <span className="truncate font-medium text-slate-700">{item.label}</span>
                          </div>
                          <span
                            className={`shrink-0 font-semibold ${
                              isNegative ? 'text-red-700' : 'text-slate-900'
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                        <p className={`pl-5 text-sm font-semibold ${isNegative ? 'text-red-700' : 'text-slate-900'}`}>
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm font-medium text-slate-500">
                No chart data found
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {financialItems.map((item) => {
              const isNegative = item.amount < 0;

              return (
                <div
                  key={item.key}
                  className={`rounded-lg border p-3 ${
                    isNegative
                      ? 'border-red-100 bg-red-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className="truncate text-sm font-medium text-slate-500">{item.label}</p>
                  <p
                    className={`mt-2 text-xl font-bold ${
                      isNegative ? 'text-red-700' : 'text-slate-950'
                    }`}
                  >
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
          No financial report data found
        </div>
      )}
    </div>
  );
};

const ProductReportOverview = ({ report, dateRange, filter, showOutletBreakdown }) => {
  const totalProduct = toSafeNumber(report?.total_product);
  const brandItems = normalizeCountItems(report?.brand_wise_product_count);
  const colourItems = normalizeCountItems(report?.colour_wise_product_count);
  const breakdownSections = productBreakdownConfigs
    .filter((config) => showOutletBreakdown || config.key !== 'outlet_wise_product_count')
    .map((config) => ({
      ...config,
      items: normalizeCountItems(report?.[config.key]),
    }));
  const topBrand = brandItems[0];
  const topColour = colourItems[0];

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Product Report</h3>
            <p className="text-sm text-slate-500">{dateRange}</p>
          </div>
        </div>
        <span className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
          {PRODUCT_TYPE}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">Total Product</p>
            <Package className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-3xl font-bold text-slate-950">{formatNumber(totalProduct)}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">Top Brand</p>
            <Tags className="h-5 w-5 text-slate-500" />
          </div>
          <p className="truncate text-2xl font-bold text-slate-950">{topBrand?.name || '--'}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {topBrand ? `${formatNumber(topBrand.total)} products` : 'No data'}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">Top Colour</p>
            <Palette className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex items-center gap-2">
            {topColour && (
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-slate-200"
                style={{ backgroundColor: getColourSwatch(topColour.name) }}
              />
            )}
            <p className="truncate text-2xl font-bold text-slate-950">{topColour?.name || '--'}</p>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {topColour ? `${formatNumber(topColour.total)} products` : 'No data'}
          </p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Detailed Product Breakdown</h3>
          <p className="text-sm text-slate-500">Inventory count by major product attributes</p>
        </div>
        <span className="rounded-md bg-white px-2.5 py-1 text-sm font-semibold text-slate-700 shadow-sm">
          {breakdownSections.length} reports
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {breakdownSections.map((section) => (
          <CountBreakdownCard
            key={section.key}
            title={section.title}
            subtitle={section.subtitle}
            items={section.items}
            total={totalProduct}
            type={section.type}
            viewAllHref={buildProductBreakdownHref(section.key, filter)}
          />
        ))}
      </div>
    </div>
  );
};

const ShopMemberReport = ({ report, dateRange }) => {
  const shopItems = normalizeShopWiseProductReport(report?.shop_wise_product_report);
  const totalShop = toSafeNumber(report?.total_shop);
  const totalCompany = toSafeNumber(report?.total_company);
  const totalProducts = shopItems.reduce((sum, item) => sum + item.totalProduct, 0);
  const topShop = shopItems[0];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Shop Wise Product Report</h3>
            <p className="text-sm text-slate-500">{dateRange}</p>
          </div>
        </div>
        <span className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
          {shopItems.length} shops listed
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total Shop</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{formatNumber(totalShop)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total Company</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{formatNumber(totalCompany)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Reported Products</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{formatNumber(totalProducts)}</p>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
          <p className="text-sm font-semibold text-indigo-700">Top Shop</p>
          <p className="mt-2 truncate text-xl font-bold text-slate-950">
            {topShop?.shopName || '--'}
          </p>
          <p className="mt-1 text-sm font-medium text-indigo-700">
            {topShop ? `${formatNumber(topShop.totalProduct)} products` : 'No data'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[48px_minmax(0,1fr)_150px] gap-3 border-b border-slate-200 px-3 py-3 pr-8 text-sm font-semibold text-slate-500 sm:grid-cols-[64px_minmax(0,1fr)_220px] sm:px-4 sm:pr-10 lg:grid-cols-[64px_minmax(0,1fr)_260px]">
          <span>Rank</span>
          <span>Shop</span>
          <span className="text-right">Products</span>
        </div>

        {shopItems.length > 0 ? (
          <div className="max-h-[520px] divide-y divide-slate-100 overflow-x-hidden overflow-y-auto pr-5 [scrollbar-gutter:stable]">
            {shopItems.map((item, index) => {
              const percentage = getPercentage(item.totalProduct, topShop?.totalProduct);

              return (
                <div
                  key={`${item.id}-${item.shopName}`}
                  className="grid grid-cols-[48px_minmax(0,1fr)_150px] gap-3 px-3 py-3 sm:grid-cols-[64px_minmax(0,1fr)_220px] sm:px-4 lg:grid-cols-[64px_minmax(0,1fr)_260px]"
                >
                  <div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-700">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.shopName}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                      Shop ID: {item.id}
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="pr-2 text-right sm:pr-3">
                    <p className="whitespace-nowrap text-sm font-bold text-slate-950">
                      {formatNumber(item.totalProduct)}
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-xs font-medium text-slate-500">
                      {percentage}% of top
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-sm font-medium text-slate-500">
            No shop wise product report found
          </div>
        )}
      </div>
    </div>
  );
};

const WelcomeHero = () => {
  const { user: contextUser, permissionList } = useAppContext();
  const parsedContextUser = useMemo(() => parseUserValue(contextUser), [contextUser]);
  const [activeTab, setActiveTab] = useState('product');
  const [productFilter, setProductFilter] = useState(createDefaultProductFilter);
  const [appliedProductFilter, setAppliedProductFilter] = useState(createDefaultProductFilter);
  const [financialReport, setFinancialReport] = useState({});
  const [productReport, setProductReport] = useState({});
  const [shopReport, setShopReport] = useState({});
  const [shopData, setShopData] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const isSupremeUser = parsedContextUser?.user_mode === 'supreme';


  // console.log("parsedContextUser=============", parsedContextUser);


  const visibleTabs = tabs;

  const getShopData = useCallback(async (currentUser) => {
    try {
      const params = {
        order: 'desc',
        orderBy: 'md_id',
        _page: 1,
        _perPage: 1000,
        ...(currentUser?.user_mode !== 'admin' && currentUser?.id
          ? { _user_id: currentUser.id }
          : {}),
      };

      const response = await ShopService.Queries.getShops(params);

      return (response?.data?.data || []).map((shop) => ({
        value: shop?.s_id,
        label: shop?.s_title,
        s_user_id: shop?.s_user_id,
        s_id: shop?.s_id,
        shop_name: 'my-shop',
      }));
    } catch (error) {
      console.log('Error fetching shops:', error);
      return [];
    }
  }, []);

  const getCompanyShopData = useCallback(
    async (currentUser) => {
      if (!currentUser?.id) return [];

      try {
        const response = await ShopService.Queries.getCompanyShops(currentUser.id);

        if (response?.status !== 'success') return [];

        return (response?.data || []).reduce((shopOptions, item) => {
          if (!item?.shop) return shopOptions;

          const companyShopId = item.shop.s_id;
          const hasCreatePermission = hasPermission(
            permissionList,
            companyShopId,
            'Vehicle',
            'Create',
          );

          if (hasCreatePermission) {
            shopOptions.push({
              value: item.shop.s_id,
              label: item.shop.s_title,
              s_user_id: item.shop.s_user_id,
              s_id: item.shop.s_id,
              shop_name: 'company-shop',
            });
          }

          return shopOptions;
        }, []);
      } catch (error) {
        console.log('Error fetching company shops:', error);
        return [];
      }
    },
    [permissionList],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchShopOptions = async () => {
      const storedUser = parseUserValue(localStorage.getItem('user'));
      const currentUser = storedUser || parsedContextUser;

      if (!currentUser?.id && !currentUser?.user_mode) return;

      setShopLoading(true);

      try {
        const [userShopOptions, companyShopOptions] = await Promise.all([
          getShopData(currentUser),
          getCompanyShopData(currentUser),
        ]);

        if (isMounted) {
          setShopData(mergeUniqueShopOptions(userShopOptions, companyShopOptions));
        }
      } finally {
        if (isMounted) {
          setShopLoading(false);
        }
      }
    };

    fetchShopOptions();

    return () => {
      isMounted = false;
    };
  }, [getCompanyShopData, getShopData, parsedContextUser]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardReport = async () => {
      setReportLoading(true);
      setReportError('');

      try {
        const selectedShopIds = Array.isArray(appliedProductFilter.shopIds)
          ? appliedProductFilter.shopIds.filter(Boolean).join(',')
          : '';

        const response = await DashboardReportService.Queries.getDashboardReports({
          from_date: appliedProductFilter.fromDate || undefined,
          to_date: appliedProductFilter.toDate || undefined,
          product_type: PRODUCT_TYPE,
          shop_id: selectedShopIds || undefined,
        });

        if (isMounted) {
          setFinancialReport(response?.data?.financial_report || {});
          setProductReport(response?.data?.product_report || {});
          setShopReport(response?.data?.shop_report || {});
        }
      } catch (error) {
        if (isMounted && !error?.silent) {
          setFinancialReport({});
          setProductReport({});
          setShopReport({});
          setReportError(error?.message || 'Failed to load dashboard report');
        }
      } finally {
        if (isMounted) {
          setReportLoading(false);
        }
      }
    };

    fetchDashboardReport();

    return () => {
      isMounted = false;
    };
  }, [appliedProductFilter]);

  // const productAmountCards = useMemo(
  //   () =>
  //     productAmountConfigs.map((item) => {
  //       const amount = toSafeNumber(financialReport?.[item.reportKey]);

  //       return {
  //         ...item,
  //         amount,
  //         value: formatCurrency(amount),
  //       };
  //     }),
  //   [financialReport],
  // );

  const handleProductDateChange = (event) => {
    const { name, value } = event.target;

    setProductFilter((currentFilter) => ({
      ...currentFilter,
      [name]: value,
    }));
  };

  const handleProductShopChange = (selectedOptions) => {
    setProductFilter((currentFilter) => ({
      ...currentFilter,
      shopIds: Array.isArray(selectedOptions)
        ? selectedOptions.map((option) => option.value)
        : [],
    }));
  };

  const handleProductFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedProductFilter(productFilter);
  };

  const handleProductFilterReset = () => {
    const emptyFilter = createDefaultProductFilter();

    setProductFilter(emptyFilter);
    setAppliedProductFilter(emptyFilter);
  };

  const productDateFilterText =
    appliedProductFilter.fromDate || appliedProductFilter.toDate
      ? `${appliedProductFilter.fromDate || 'Start'} to ${appliedProductFilter.toDate || 'Today'}`
      : 'All dates';

  const selectedProductShopOptions = useMemo(() => {
    const selectedShopIds = new Set((productFilter.shopIds || []).map((shopId) => String(shopId)));

    return shopData.filter((shopOption) => selectedShopIds.has(String(shopOption.value)));
  }, [productFilter.shopIds, shopData]);

  const renderTabContent = () => {
    if (activeTab === 'product') {
      return (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Product Information</h2>
              <p className="text-sm text-slate-500">Product sales and payment summary</p>
            </div>
          </div>

          <form
            onSubmit={handleProductFilterSubmit}
            className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
                <label className="block">
                  <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CalendarDays className="h-4 w-4" />
                    From Date
                  </span>
                  <input
                    type="date"
                    name="fromDate"
                    value={productFilter.fromDate}
                    max={productFilter.toDate || undefined}
                    onChange={handleProductDateChange}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CalendarDays className="h-4 w-4" />
                    To Date
                  </span>
                  <input
                    type="date"
                    name="toDate"
                    value={productFilter.toDate}
                    min={productFilter.fromDate || undefined}
                    onChange={handleProductDateChange}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>

                <label className="block sm:col-span-2 lg:col-span-1">
                  <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Store className="h-4 w-4" />
                    Shop
                  </span>
                  <Select
                    isMulti
                    isClearable
                    options={shopData}
                    value={selectedProductShopOptions}
                    onChange={handleProductShopChange}
                    placeholder={shopLoading ? 'Loading shops...' : 'Select Shop'}
                    isLoading={shopLoading}
                    isDisabled={shopLoading && shopData.length === 0}
                    className="text-sm"
                    classNamePrefix="select"
                    styles={shopSelectStyles}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <p className="text-sm font-medium text-slate-500 sm:mr-2">
                  {productDateFilterText}
                </p>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <Filter className="h-4 w-4" />
                  {reportLoading ? 'Loading' : 'Filter'}
                </button>
                <button
                  type="button"
                  onClick={handleProductFilterReset}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </form>

          {reportError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {reportError}
            </p>
          )}

          {/* <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {productAmountCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`rounded-lg border p-4 shadow-sm ${item.className}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <Icon className="h-5 w-5 shrink-0" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
                </div>
              );
            })}
          </div> */}

          {/* <ProductSummaryChart items={productAmountCards} dateRange={productDateFilterText} /> */}
          <ProductReportOverview
            report={productReport}
            dateRange={productDateFilterText}
            filter={appliedProductFilter}
            showOutletBreakdown={isSupremeUser}
          />
        </div>
      );
    }

    if (activeTab === 'shopMember') {
      return (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Shop Member Information</h2>
              <p className="text-sm text-slate-500">Shop member overview and role details</p>
            </div>
          </div>

          {reportError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {reportError}
            </p>
          )}

          <ShopMemberReport report={shopReport} dateRange={productDateFilterText} />
        </div>
      );
    }

    return (
      <div>
        {/* <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
            <UserCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Accounts Information</h2>
            <p className="text-sm text-slate-500">Account related basic information</p>
          </div>
        </div> */}

        {/* <InfoGrid items={accountInfo} /> */}

        {reportError && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {reportError}
          </p>
        )}

        <div className="mt-4">
          <FinancialReportGrid report={financialReport} />
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-transparent px-3 py-4 sm:px-4 lg:px-5">
      <div className="w-full">
        <div className="mb-4">
          <p className="text-sm font-semibold text-sky-700">Pilot Bazar</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            Account Dashboard
          </h1>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div
            className="flex flex-col gap-2 border-b border-slate-200 bg-slate-100 p-1.5 sm:flex-row"
            role="tablist"
            aria-label="Dashboard information tabs"
          >
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:bg-white/70 hover:text-slate-950'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div
            id={`${activeTab}-panel`}
            role="tabpanel"
            className="p-4 sm:p-5"
          >
            {renderTabContent()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeHero;
