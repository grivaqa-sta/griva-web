import React, { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, ShoppingCart, Users, BarChart3,
  Download, Printer, Clock, AlertTriangle, Calendar,
  Percent, Award, Activity, FileText, ChevronRight,
  TrendingDown, ShieldAlert, Package, Layers
} from 'lucide-react';
import { useToast } from '@/app/context/ToastContext';
import { useSocket } from '@/app/context/SocketContext';
import {
  DeepAnalyticsData,
  getDeepAnalyticsApi,
  downloadOrdersExportApi,
  downloadCustomersExportApi
} from '../../utils/api';

interface AnalyticsTabProps {
  active: boolean;
}

export default function AnalyticsTab({ active }: AnalyticsTabProps) {
  const { toast } = useToast();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DeepAnalyticsData | null>(null);

  // Date Range Filters
  const [dateRangeOption, setDateRangeOption] = useState<string>('30days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Fetch deep analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let start: string | undefined;
      let end: string | undefined;

      const now = new Date();
      if (dateRangeOption === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        start = todayStr;
        end = todayStr;
      } else if (dateRangeOption === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const yestStr = yesterday.toISOString().split('T')[0];
        start = yestStr;
        end = yestStr;
      } else if (dateRangeOption === '7days') {
        const prev = new Date();
        prev.setDate(now.getDate() - 6);
        start = prev.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
      } else if (dateRangeOption === '30days') {
        const prev = new Date();
        prev.setDate(now.getDate() - 29);
        start = prev.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
      } else if (dateRangeOption === 'month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        start = firstDay.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
      } else if (dateRangeOption === 'quarter') {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        start = firstDay.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
      } else if (dateRangeOption === 'year') {
        const firstDay = new Date(now.getFullYear(), 0, 1);
        start = firstDay.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
      } else if (dateRangeOption === 'custom') {
        if (customStartDate) start = customStartDate;
        if (customEndDate) end = customEndDate;
      }

      const res = await getDeepAnalyticsApi(start, end);
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load deep analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (active) {
      fetchAnalytics();
    }
  }, [active, dateRangeOption, customStartDate, customEndDate]);

  useEffect(() => {
    if (!socket || !active) return;

    const handleUpdate = () => {
      console.log('🔌 [Socket.IO Event]: Refreshing AnalyticsTab...');
      fetchAnalytics();
    };

    socket.on('new-order', handleUpdate);
    socket.on('order-updated', handleUpdate);
    socket.on('dashboard-metrics-updated', handleUpdate);

    return () => {
      socket.off('new-order', handleUpdate);
      socket.off('order-updated', handleUpdate);
      socket.off('dashboard-metrics-updated', handleUpdate);
    };
  }, [socket, active]);

  // Export handlers
  const handleExportCSV = async (type: 'orders' | 'customers' | 'inventory') => {
    try {
      toast.success(`Preparing ${type} export...`);
      let start: string | undefined;
      let end: string | undefined;

      const now = new Date();
      if (dateRangeOption === 'today') {
        start = now.toISOString().split('T')[0];
        end = start;
      } else if (dateRangeOption === '7days') {
        const prev = new Date();
        prev.setDate(now.getDate() - 6);
        start = prev.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
      } else if (dateRangeOption === '30days') {
        const prev = new Date();
        prev.setDate(now.getDate() - 29);
        start = prev.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
      } else if (dateRangeOption === 'custom') {
        start = customStartDate;
        end = customEndDate;
      }

      if (type === 'orders') {
        await downloadOrdersExportApi({
          startDate: start,
          endDate: end,
          format: 'csv'
        });
      } else if (type === 'customers') {
        await downloadCustomersExportApi({
          startDate: start,
          endDate: end,
          format: 'csv'
        });
      } else if (type === 'inventory') {
        if (!data) return;
        // Generate client-side CSV for inventory health
        const headers = ['Rank', 'Product Title', 'Units Sold', 'Revenue (QAR)', 'Avg Selling Price (QAR)'];
        const csvRows = [headers.join(',')];

        data.bestSellers.forEach((item: any, index: number) => {
          const row = [
            index + 1,
            `"${item.title.replace(/"/g, '""')}"`,
            item.qty,
            item.revenue.toFixed(2),
            item.avgPrice.toFixed(2)
          ];
          csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_sales_report_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
      toast.success('Report downloaded successfully.');
    } catch (err: any) {
      toast.error('Failed to generate export file.');
    }
  };

  // print dashboard report
  const handlePrintPDF = () => {
    if (!data) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocker is enabled. Please allow popups.');
      return;
    }

    const dateRangeText = dateRangeOption === 'all'
      ? 'All-Time Platform Performance'
      : `${dateRangeOption.toUpperCase()} Report`;

    const htmlContent = `
      <html>
        <head>
          <title>GRIVA Business Analytics Report</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1f2937; margin: 0; padding: 40px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #f97316; letter-spacing: -0.05em; }
            .report-title { text-align: right; }
            .report-title h1 { margin: 0; font-size: 20px; font-weight: 800; color: #111827; }
            .report-title p { margin: 5px 0 0 0; font-size: 11px; color: #6b7280; font-weight: 600; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .kpi-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 15px; }
            .kpi-label { font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
            .kpi-val { font-size: 20px; font-weight: 900; color: #111827; margin: 5px 0; }
            .kpi-sub { font-size: 9px; font-weight: 600; color: #f97316; }
            .section { margin-bottom: 40px; page-break-inside: avoid; }
            .section-title { font-size: 14px; font-weight: 800; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background: #f9fafb; font-weight: 700; text-align: left; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
            td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
            .rank { font-weight: 800; color: #f97316; }
            .footer { text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">GRIVA</div>
            <div class="report-title">
              <h1>BUSINESS INTELLIGENCE REPORT</h1>
              <p>${dateRangeText} — Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>

          <div class="grid">
            <div class="kpi-card">
              <div class="kpi-label">Realized Revenue</div>
              <div class="kpi-val">QAR ${data.totalRevenue.toLocaleString()}</div>
              <div class="kpi-sub">Fulfillment realized</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Gross Bookings</div>
              <div class="kpi-val">QAR ${data.grossRevenue.toLocaleString()}</div>
              <div class="kpi-sub">All placed orders</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Orders</div>
              <div class="kpi-val">${data.totalOrders}</div>
              <div class="kpi-sub">${data.netOrders} completed / active</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Average Order Value</div>
              <div class="kpi-val">QAR ${data.averageOrderValue.toFixed(2)}</div>
              <div class="kpi-sub">Median: QAR ${data.medianOrderValue.toFixed(2)}</div>
            </div>
          </div>

          <div class="grid">
            <div class="kpi-card">
              <div class="kpi-label">Fulfillment Success</div>
              <div class="kpi-val">${data.fulfillmentRate}%</div>
              <div class="kpi-sub">Delivery completed</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Cancellation Rate</div>
              <div class="kpi-val">${data.cancellationRate}%</div>
              <div class="kpi-sub">User/Admin cancelled</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Delivery Success</div>
              <div class="kpi-val">${data.deliverySuccessRate}%</div>
              <div class="kpi-sub">Avg Time: ${data.avgDeliveryTimeHours} hrs</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Repeat Customers</div>
              <div class="kpi-val">${data.repeatCustomerRate}%</div>
              <div class="kpi-sub">Loyalty conversion</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Top 10 Best Selling Products</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">Rank</th>
                  <th>Product Title</th>
                  <th style="text-align: right;">Units Sold</th>
                  <th style="text-align: right;">Revenue</th>
                  <th style="text-align: right;">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                ${data.bestSellers.map((item: any, idx: number) => `
                  <tr>
                    <td class="rank">#${idx + 1}</td>
                    <td style="font-weight: 600;">${item.title}</td>
                    <td style="text-align: right;">${item.qty}</td>
                    <td style="text-align: right; font-weight: 700;">QAR ${item.revenue.toLocaleString()}</td>
                    <td style="text-align: right;">QAR ${item.avgPrice}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Top Customer VIP Accounts</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">Rank</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th style="text-align: right;">Orders</th>
                  <th style="text-align: right;">Total Spent</th>
                  <th style="text-align: right;">AOV</th>
                </tr>
              </thead>
              <tbody>
                ${data.bestCustomers.map((item: any, idx: number) => `
                  <tr>
                    <td class="rank">#${idx + 1}</td>
                    <td style="font-weight: 600;">${item.name}</td>
                    <td>${item.email}</td>
                    <td>${item.phone}</td>
                    <td style="text-align: right;">${item.orderCount}</td>
                    <td style="text-align: right; font-weight: 700;">QAR ${item.spent.toLocaleString()}</td>
                    <td style="text-align: right;">QAR ${item.aov}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Category Revenue Distribution</div>
            <table>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th style="text-align: right;">Units Sold</th>
                  <th style="text-align: right;">Revenue</th>
                  <th style="text-align: right;">Avg Unit Price</th>
                </tr>
              </thead>
              <tbody>
                ${data.salesByCategory.map((item: any) => `
                  <tr>
                    <td style="font-weight: 600;">${item.category}</td>
                    <td style="text-align: right;">${item.qty}</td>
                    <td style="text-align: right; font-weight: 700;">QAR ${item.sales.toLocaleString()}</td>
                    <td style="text-align: right;">QAR ${item.avgPrice}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Fulfillment Health & Inventory Value</div>
            <div class="grid">
              <div class="kpi-card">
                <div class="kpi-label">Active SKUs</div>
                <div class="kpi-val">${data.inventory.totalSKUs}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Out of Stock</div>
                <div class="kpi-val" style="color: #ef4444;">${data.inventory.outOfStockCount}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Low Stock (under 5)</div>
                <div class="kpi-val" style="color: #f59e0b;">${data.inventory.lowStockCount}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Inventory Assets Value</div>
                <div class="kpi-val">QAR ${data.inventory.totalInventoryValue.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            GRIVA E-Commerce Administration • State of Qatar • Confidential Internal Report
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!active) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* ── Date Filters and Action Bar ── */}
      <div className="bg-white border border-orange-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            Executive Business intelligence
          </h2>
          <p className="text-[11px] font-semibold text-orange-500/80 mt-0.5">
            Super admin deep-dive analytics panel & report generators
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {dateRangeOption === 'custom' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-5 duration-200">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-xs font-semibold text-gray-700 bg-white border border-orange-500/20 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors shadow-sm"
              />
              <span className="text-gray-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs font-semibold text-gray-700 bg-white border border-orange-500/20 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors shadow-sm"
              />
            </div>
          )}

          <select
            value={dateRangeOption}
            onChange={(e) => setDateRangeOption(e.target.value)}
            className="text-xs font-bold text-gray-700 bg-white border border-orange-500/30 rounded-xl px-4 py-2 outline-none focus:border-orange-500 transition-all shadow-sm hover:border-orange-500/60 cursor-pointer"
          >
            <option value="30days">Last 30 Days</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>

          <button
            onClick={handlePrintPDF}
            disabled={loading || !data}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/10 cursor-pointer transition-all disabled:opacity-50"
          >
            <Printer className="h-3.5 w-3.5" />
            PDF Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-400">Aggregating business metrics...</p>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-orange-500/20 rounded-2xl">
          <AlertTriangle className="h-10 w-10 text-orange-500 mb-3" />
          <p className="text-sm font-black text-gray-900">Failed to load analytics</p>
          <button onClick={fetchAnalytics} className="mt-4 text-xs font-bold text-orange-500 border border-orange-500/35 px-4 py-2 rounded-xl hover:bg-orange-500/5">
            Retry Loading
          </button>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Executive KPI Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Realized Revenue',
                value: `QAR ${data.totalRevenue.toLocaleString()}`,
                sub: 'Excludes cancelled/returned',
                icon: <DollarSign className="h-5 w-5 text-orange-500" />,
                color: 'from-orange-500/10 to-amber-500/5',
              },
              {
                label: 'Gross Bookings',
                value: `QAR ${data.grossRevenue.toLocaleString()}`,
                sub: 'All order sales value',
                icon: <Layers className="h-5 w-5 text-blue-500" />,
                color: 'from-blue-500/10 to-indigo-500/5',
              },
              {
                label: 'Total Orders',
                value: data.totalOrders.toString(),
                sub: `${data.netOrders} realized orders`,
                icon: <ShoppingCart className="h-5 w-5 text-violet-500" />,
                color: 'from-violet-500/10 to-purple-500/5',
              },
              {
                label: 'Average Order Value',
                value: `QAR ${data.averageOrderValue.toFixed(2)}`,
                sub: `Median AOV: QAR ${data.medianOrderValue.toFixed(0)}`,
                icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
                color: 'from-emerald-500/10 to-teal-500/5',
              },
              {
                label: 'Highest Single Sale',
                value: `QAR ${data.highestSingleOrder.toLocaleString()}`,
                sub: 'Peak transaction amount',
                icon: <Award className="h-5 w-5 text-pink-500" />,
                color: 'from-pink-500/10 to-rose-500/5',
              },
              {
                label: 'Fulfillment Rate',
                value: `${data.fulfillmentRate}%`,
                sub: `${data.orderStatusCounts.delivered || 0} delivered total`,
                icon: <Percent className="h-5 w-5 text-indigo-500" />,
                color: 'from-indigo-500/10 to-sky-500/5',
              },
              {
                label: 'cancellation rate',
                value: `${data.cancellationRate}%`,
                sub: `${data.orderStatusCounts.cancelled || 0} order cancellations`,
                icon: <ShieldAlert className="h-5 w-5 text-red-500" />,
                color: 'from-red-500/10 to-orange-500/5',
              },
              {
                label: 'Loyal Buyers Rate',
                value: `${data.repeatCustomerRate}%`,
                sub: 'Repeat customer ratio',
                icon: <Users className="h-5 w-5 text-teal-500" />,
                color: 'from-teal-500/10 to-emerald-500/5',
              },
            ].map((card, i) => (
              <div key={i} className={`bg-gradient-to-br ${card.color} border border-orange-500/20 rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-white border border-orange-500/20 flex items-center justify-center shadow-xs">
                    {card.icon}
                  </div>
                </div>
                <div className="text-xl font-black text-gray-900 tracking-tight">
                  {card.value}
                </div>
                <p className="text-[9px] text-gray-400 font-semibold mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── SVG Charts Section ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Daily Revenue Chart */}
            <div className="lg:col-span-8 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Revenue Timeline</h3>
                  <h4 className="text-sm font-black text-gray-900 mt-0.5">Realized Sales Over Selected Period</h4>
                </div>
                <Activity className="h-4 w-4 text-orange-500" />
              </div>
              <div className="h-52 w-full">
                {data.salesOverTime.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs font-bold text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No timeline records for this filter
                  </div>
                ) : (
                  <SalesLineChart data={data.salesOverTime} />
                )}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="lg:col-span-4 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Revenue Stream Options</h3>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">Sales by Payment Method</h4>
              </div>
              <div className="my-6 flex justify-center">
                <PaymentDonutChart data={data.paymentMethodRevenue} />
              </div>
            </div>
          </div>

          {/* ── Order Funnel Pipeline ── */}
          <div className="bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Fulfillment Funnel</h3>
              <h4 className="text-sm font-black text-gray-900 mt-0.5">Platform Order Lifecycle Breakdown</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { status: 'Pending', count: data.orderStatusCounts.pending || 0, color: 'border-amber-500/20 bg-amber-500/5 text-amber-600' },
                { status: 'Processing', count: data.orderStatusCounts.processing || 0, color: 'border-blue-500/20 bg-blue-500/5 text-blue-600' },
                { status: 'Assigned', count: data.orderStatusCounts.assigned || 0, color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-600' },
                { status: 'Out For Delivery', count: data.orderStatusCounts.out_for_delivery || 0, color: 'border-violet-500/20 bg-violet-500/5 text-violet-600' },
                { status: 'Delivered', count: (data.orderStatusCounts.delivered || 0) + (data.orderStatusCounts.completed || 0), color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600' },
              ].map((item, idx) => (
                <div key={item.status} className={`p-4 border rounded-xl flex flex-col justify-between ${item.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step {idx + 1}</span>
                    <span className="text-xs font-black">{item.count}</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-black text-gray-900">{item.status}</div>
                    <div className="text-[9px] text-gray-400 font-semibold mt-0.5">
                      {data.totalOrders > 0 ? ((item.count / data.totalOrders) * 100).toFixed(0) : 0}% of bookings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Best Sellers and Best Customers ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Best Sellers */}
            <div className="lg:col-span-6 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-orange-500/10 pb-3">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Top 10 Best Sellers</h4>
                <Award className="h-4 w-4 text-orange-500" />
              </div>
              {data.bestSellers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10 font-bold">No product sales recorded in this period</p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {data.bestSellers.map((item: any, idx: number) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-orange-500 w-5">#{idx + 1}</span>
                        {item.image && (
                          <img src={item.image} alt={item.title} className="h-8 w-8 rounded-lg object-cover border border-gray-200" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-gray-800 line-clamp-1">{item.title}</div>
                          <div className="text-[9px] text-gray-400 font-semibold">{item.qty} units sold • Avg QAR {item.avgPrice}</div>
                        </div>
                      </div>
                      <div className="text-xs font-black text-gray-900">
                        QAR {item.revenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Best Customers */}
            <div className="lg:col-span-6 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-orange-500/10 pb-3">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Top Customer Accounts</h4>
                <Users className="h-4 w-4 text-orange-500" />
              </div>
              {data.bestCustomers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10 font-bold">No customer transactions recorded</p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {data.bestCustomers.map((item: any, idx: number) => (
                    <div key={`${item.email}_${idx}`} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-orange-500">#{idx + 1}</span>
                          <span className="text-xs font-bold text-gray-800 truncate">{item.name}</span>
                        </div>
                        <div className="text-[9px] text-gray-400 font-semibold mt-0.5">
                          {item.email} • {item.phone}
                        </div>
                        <div className="text-[9px] text-orange-500/80 font-bold mt-0.5">
                          {item.orderCount} orders • AOV QAR {item.aov}
                        </div>
                      </div>
                      <div className="text-xs font-black text-gray-900 shrink-0">
                        QAR {item.spent.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Category Performance & Delivery Slots ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Category bar list */}
            <div className="lg:col-span-6 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Revenue by Category</h3>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">Sales distribution per product category</h4>
              </div>
              <div className="space-y-4">
                {data.salesByCategory.map((cat: any, idx: number) => {
                  const pct = data.totalRevenue > 0 ? (cat.sales / data.totalRevenue) * 100 : 0;
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span>{cat.category}</span>
                        <span>QAR {cat.sales.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-gray-400 font-semibold">
                        {cat.qty} units sold • Avg price: QAR {cat.avgPrice}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Slot distribution */}
            <div className="lg:col-span-6 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Delivery Logistics</h3>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">Orders per Delivery Time Slot</h4>
              </div>
              <div className="space-y-3">
                {Object.keys(data.deliverySlotCounts).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10 font-bold">No slot distribution recorded</p>
                ) : (
                  (Object.entries(data.deliverySlotCounts) as [string, any][]).map(([slot, count]) => (
                    <div key={slot} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="text-xs font-bold text-gray-700">{slot}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-900">{count} orders</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Heatmaps and Trends Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Hourly Order Heatmap */}
            <div className="lg:col-span-7 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Hourly Peak Times</h3>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">Order Heatmap by Hour of Day (0 - 23)</h4>
              </div>
              <div className="grid grid-cols-12 gap-1.5">
                {data.hourlyHeatmap.map((count: number, hour: number) => {
                  const maxCount = Math.max(...data.hourlyHeatmap) || 1;
                  const intensity = count / maxCount;
                  let bg = 'bg-orange-500/5';
                  if (intensity > 0.8) bg = 'bg-orange-600 text-white';
                  else if (intensity > 0.5) bg = 'bg-orange-500 text-white';
                  else if (intensity > 0.2) bg = 'bg-orange-400/60 text-gray-900';
                  else if (intensity > 0) bg = 'bg-orange-500/20 text-gray-800';

                  return (
                    <div
                      key={hour}
                      className={`h-11 rounded-lg border border-orange-500/10 flex flex-col items-center justify-center p-1 text-[8px] font-bold ${bg}`}
                      title={`${count} orders at ${hour}:00`}
                    >
                      <span>{hour}h</span>
                      <span className="text-[10px] font-black">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Days volume */}
            <div className="lg:col-span-5 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Weekly Day Breakdown</h3>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">Order Volume by Day of Week</h4>
              </div>
              <div className="flex items-end justify-between h-28 pt-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                  const count = data.dayOfWeekVolume[idx] || 0;
                  const maxCount = Math.max(...data.dayOfWeekVolume) || 1;
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={day} className="flex flex-col items-center flex-1 space-y-2">
                      <div className="text-[10px] font-black text-gray-800">{count}</div>
                      <div className="w-4 bg-orange-500 rounded-t-md hover:opacity-85 transition-opacity" style={{ height: `${Math.max(pct, 5)}%` }} />
                      <div className="text-[9px] font-bold text-gray-400 uppercase">{day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Inventory Health & Customer Acquisition Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Inventory Health */}
            <div className="lg:col-span-6 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Inventory Intelligence</h3>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">Fulfillment & Stock Health Metrics</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Out of Stock Products', value: data.inventory.outOfStockCount, color: 'text-red-500 bg-red-50 border-red-100', icon: <ShieldAlert className="h-4 w-4" /> },
                  { label: 'Low Stock Products (< 5)', value: data.inventory.lowStockCount, color: 'text-amber-500 bg-amber-50 border-amber-100', icon: <AlertTriangle className="h-4 w-4" /> },
                  { label: 'Total Catalog SKUs', value: data.inventory.totalSKUs, color: 'text-indigo-500 bg-indigo-50 border-indigo-100', icon: <Package className="h-4 w-4" /> },
                  { label: 'Total Asset Valuation', value: `QAR ${data.inventory.totalInventoryValue.toLocaleString()}`, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', icon: <DollarSign className="h-4 w-4" /> },
                ].map((item, i) => (
                  <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-between ${item.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                      {item.icon}
                    </div>
                    <div className="text-lg font-black mt-4">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer acquisition Trend */}
            <div className="lg:col-span-6 bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Customer Growth</h3>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">New Customers Registrations (Last 6 Months)</h4>
              </div>
              <div className="flex items-end justify-between h-28 pt-4">
                {data.customerAcquisition.map((month: any) => {
                  const count = month.count;
                  const maxCount = Math.max(...data.customerAcquisition.map((m: any) => m.count)) || 1;
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={month.month} className="flex flex-col items-center flex-1 space-y-2">
                      <div className="text-[10px] font-black text-gray-800">{count}</div>
                      <div className="w-5 bg-orange-500/70 rounded-t-md hover:bg-orange-500 transition-colors" style={{ height: `${Math.max(pct, 5)}%` }} />
                      <div className="text-[9px] font-bold text-gray-400 text-center truncate w-full">{month.month.split(' ')[0]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Export & Reports Command Center ── */}
          <div className="bg-white border border-orange-500/20 rounded-2xl p-6 shadow-xs">
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Report Action Hub</h3>
              <h4 className="text-sm font-black text-gray-900 mt-0.5">Export Structured Business Data reports</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Orders Details Report', desc: 'All fields including status, address, phone', type: 'orders' as const },
                { title: 'Customer Database', desc: 'Addresses, spent, segment and registry data', type: 'customers' as const },
                { title: 'Product Inventory Sales', desc: 'Fulfillment sales, assets value metrics', type: 'inventory' as const },
              ].map((btn) => (
                <div key={btn.title} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-800">{btn.title}</div>
                    <p className="text-[10px] text-gray-400 mt-1">{btn.desc}</p>
                  </div>
                  <button
                    onClick={() => handleExportCSV(btn.type)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 border border-orange-500/35 hover:bg-orange-500/5 text-orange-500 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download CSV
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Hand-crafted SVG charts to avoid external JS bundles
function SalesLineChart({ data }: { data: { date: string; sales: number }[] }) {
  let chartData = [...data];
  if (chartData.length === 1) {
    chartData = [
      { date: `${chartData[0].date} (S)`, sales: 0 },
      chartData[0]
    ];
  }

  const maxVal = Math.max(...chartData.map(d => d.sales));
  const minVal = Math.min(...chartData.map(d => d.sales));
  const range = maxVal - minVal || 1;
  const width = 500;
  const height = 180;
  const padding = { top: 15, right: 15, bottom: 25, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = chartData.map((d, i) => ({
    x: padding.left + (i / (chartData.length - 1)) * chartW,
    y: padding.top + chartH - ((d.sales - minVal) / range) * chartH,
    sales: d.sales,
    date: d.date,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="deepLineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid horizontal lines */}
      {[0, 0.5, 1].map((ratio, i) => {
        const val = minVal + ratio * range;
        const y = padding.top + chartH - ratio * chartH;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fontWeight="bold" fill="#9ca3af">
              QAR {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={areaD} fill="url(#deepLineGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points + X labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#f97316" stroke="white" strokeWidth="2" />
          {(i === 0 || i === points.length - 1 || i % Math.max(Math.floor(points.length / 5), 1) === 0) && (
            <text x={p.x} y={height - 5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#9ca3af">{p.date}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

function PaymentDonutChart({ data }: { data: { COD: number; Card: number; Online: number; Other: number } }) {
  const total = (data.COD || 0) + (data.Card || 0) + (data.Online || 0) + (data.Other || 0);
  if (total === 0) {
    return <div className="text-xs font-bold text-gray-400">No payment data</div>;
  }

  const slices = [
    { label: 'Cash on Delivery (COD)', sales: data.COD || 0, color: '#f97316' },
    { label: 'Card Payment', sales: data.Card || 0, color: '#3b82f6' },
    { label: 'Online Payment', sales: data.Online || 0, color: '#10b981' },
    { label: 'Other', sales: data.Other || 0, color: '#8b5cf6' },
  ].filter(s => s.sales > 0);

  let cumAngle = -Math.PI / 2;
  const cx = 65, cy = 65, r = 50, innerR = 30;

  const paths = slices.map((s, i) => {
    const angle = (s.sales / total) * Math.PI * 2;
    const start = cumAngle;
    cumAngle += angle;
    const end = cumAngle;

    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);

    const ix1 = cx + innerR * Math.cos(start);
    const iy1 = cy + innerR * Math.sin(start);
    const ix2 = cx + innerR * Math.cos(end);
    const iy2 = cy + innerR * Math.sin(end);

    const largeArc = angle > Math.PI ? 1 : 0;
    return {
      d: `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`,
      color: s.color,
      label: s.label,
      pct: ((s.sales / total) * 100).toFixed(0),
      sales: s.sales,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
      <svg viewBox="0 0 130 130" className="h-32 w-32 shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} className="hover:opacity-85 transition-opacity cursor-pointer" />
        ))}
        <text x="65" y="62" textAnchor="middle" fontSize="10" fontWeight="900" fill="#111827">Stream</text>
        <text x="65" y="74" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6b7280">QAR {(total / 1000).toFixed(1)}k</text>
      </svg>
      <div className="space-y-2 flex-1 min-w-0 w-full">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-gray-600 font-bold truncate">{p.label}</span>
            </div>
            <div className="font-black text-gray-900 shrink-0">
              QAR {p.sales.toLocaleString()} ({p.pct}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
