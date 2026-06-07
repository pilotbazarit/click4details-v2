'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import DashboardReportService from '@/services/DashboardReportService';

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

const toSafeNumber = (value) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatNumber = (value) => toSafeNumber(value).toLocaleString('en-US');

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
    if (statusName.includes('dealer')) return '#ea580c';
    if (statusName.includes('hold')) return '#dc2626';
  }

  const colours = ['#0f172a', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2'];
  return colours[index % colours.length];
};

const ProductBreakdownReportContent = () => {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const reportKey = searchParams.get('report') || productBreakdownConfigs[0].key;
  const activeConfig =
    productBreakdownConfigs.find((config) => config.key === reportKey) ||
    productBreakdownConfigs[0];
  const [productReport, setProductReport] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      const params = new URLSearchParams(queryString);

      setLoading(true);
      setError('');

      try {
        const response = await DashboardReportService.Queries.getDashboardReports({
          from_date: params.get('from_date') || undefined,
          to_date: params.get('to_date') || undefined,
          product_type: params.get('product_type') || PRODUCT_TYPE,
          shop_id: params.get('shop_id') || undefined,
        });

        if (isMounted) {
          setProductReport(response?.data?.product_report || {});
        }
      } catch (fetchError) {
        if (isMounted) {
          setProductReport({});
          setError(fetchError?.message || 'Failed to load report');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [queryString]);

  const items = useMemo(
    () => normalizeCountItems(productReport?.[activeConfig.key]),
    [activeConfig.key, productReport],
  );
  const totalProduct = toSafeNumber(productReport?.total_product);
  const percentageTotal =
    totalProduct || items.reduce((sum, item) => sum + toSafeNumber(item.total), 0);
  const fromDate = searchParams.get('from_date');
  const toDate = searchParams.get('to_date');
  const dateRange = fromDate || toDate ? `${fromDate || 'Start'} to ${toDate || 'Today'}` : 'All dates';

  return (
    <section className="w-full bg-transparent px-3 py-4 sm:px-4 lg:px-5">
      <div className="w-full">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              {activeConfig.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{activeConfig.subtitle}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">{PRODUCT_TYPE}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{dateRange}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">All Items</h2>
                <p className="text-sm text-slate-500">{formatNumber(items.length)} rows found</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Total Product: {formatNumber(percentageTotal)}
            </p>
          </div>

          {loading && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
              Loading report...
            </div>
          )}

          {!loading && error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
              No data found
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-[48px_minmax(0,1fr)_92px_64px] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500 sm:grid-cols-[64px_minmax(0,1fr)_150px_90px] sm:px-4">
                <span>Rank</span>
                <span>Name</span>
                <span className="text-right">Products</span>
                <span className="text-right">Share</span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const percentage = getPercentage(item.total, percentageTotal);
                  const breakdownColor = getBreakdownColor(activeConfig.type, item.name, index);

                  return (
                    <div
                      key={`${item.id}-${item.name}`}
                      className="grid grid-cols-[48px_minmax(0,1fr)_92px_64px] gap-3 px-3 py-3 sm:grid-cols-[64px_minmax(0,1fr)_150px_90px] sm:px-4"
                    >
                      <div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-700">
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 flex min-w-0 items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-200"
                            style={{ backgroundColor: breakdownColor }}
                          />
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {item.name}
                          </p>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: breakdownColor,
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-right text-sm font-bold text-slate-950">
                        {formatNumber(item.total)}
                      </p>
                      <p className="text-right text-sm font-medium text-slate-500">
                        {percentage}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const ProductBreakdownReportFallback = () => (
  <section className="w-full bg-transparent px-3 py-4 sm:px-4 lg:px-5">
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
      Loading report...
    </div>
  </section>
);

const ProductBreakdownReportPage = () => (
  <Suspense fallback={<ProductBreakdownReportFallback />}>
    <ProductBreakdownReportContent />
  </Suspense>
);

export default ProductBreakdownReportPage;
