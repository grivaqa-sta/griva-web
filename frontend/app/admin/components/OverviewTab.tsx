import React, { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, ShoppingCart, Users, BarChart2,
  ToggleLeft, ToggleRight, CheckCircle, EyeOff,
  ChevronRight, Package, Sliders
} from 'lucide-react';
import {
  AnalyticsData,
  DeliverySlot,
  getDeliverySlotsApi,
  createDeliverySlotApi,
  updateDeliverySlotApi,
  deleteDeliverySlotApi
} from '../../utils/api';

interface OverviewTabProps {
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  announcementBarEnabled: boolean;
  setAnnouncementBarEnabled: (val: boolean) => void;
  fridaySaleEnabled: boolean;
  setFridaySaleEnabled: (val: boolean) => void;
  midnightSaleEnabled: boolean;
  setMidnightSaleEnabled: (val: boolean) => void;
  highlightedSchemaSection: string | null;
  setHighlightedSchemaSection: (val: string | null) => void;
  setActiveTab: (val: any) => void;
  slidesList: any[];
  categoriesList: any[];
  offersList: any[];
  shippingFee: number;
  freeShippingThreshold: number;
  onSaveShippingConfig: (fee: number, threshold: number) => Promise<void>;
}

const CATEGORY_COLORS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b'
];

function SalesLineChart({ data }: { data: { date: string; sales: number }[] }) {
  if (!data || data.length < 2) return null;
  const maxSales = Math.max(...data.map(d => d.sales));
  const minSales = Math.min(...data.map(d => d.sales));
  const range = maxSales - minSales || 1;
  const width = 500;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 25, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.sales - minSales) / range) * chartH,
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
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y-axis labels */}
      {[0, 0.5, 1].map((ratio, i) => {
        const val = minSales + ratio * range;
        const y = padding.top + chartH - ratio * chartH;
        return (
          <g key={i}>
            <line x1={padding.left - 4} y1={y} x2={padding.left + chartW} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              QAR {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={areaD} fill="url(#lineGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points + X labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#f97316" stroke="white" strokeWidth="1.5" />
          {i % 2 === 0 && (
            <text x={p.x} y={height - 4} textAnchor="middle" fontSize="8" fill="#9ca3af">{p.date}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

function CategoryPieChart({ data }: { data: { category: string; sales: number }[] }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.sales, 0);
  let cumAngle = -Math.PI / 2;
  const cx = 70, cy = 70, r = 55, innerR = 30;

  const slices = data.map((d, i) => {
    const angle = (d.sales / total) * Math.PI * 2;
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
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      category: d.category,
      pct: ((d.sales / total) * 100).toFixed(0),
      sales: d.sales,
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
        ))}
        <text x="70" y="67" textAnchor="middle" fontSize="10" fontWeight="800" fill="#111827">Total</text>
        <text x="70" y="78" textAnchor="middle" fontSize="8" fill="#6b7280">QAR {(total / 1000).toFixed(1)}k</text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-600 font-semibold truncate">{s.category}</span>
            </div>
            <span className="font-black text-gray-800 shrink-0">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewTab(props: OverviewTabProps) {
  const {
    analytics, analyticsLoading,
    announcementBarEnabled, setAnnouncementBarEnabled,
    fridaySaleEnabled, setFridaySaleEnabled,
    midnightSaleEnabled, setMidnightSaleEnabled,
    highlightedSchemaSection, setHighlightedSchemaSection,
    setActiveTab, slidesList, categoriesList, offersList,
    shippingFee, freeShippingThreshold, onSaveShippingConfig
  } = props;

  const statusCounts = analytics?.orderStatusCounts || { pending: 0, shipped: 0, delivered: 0, completed: 0, cancelled: 0 };

  const [thresholdInput, setThresholdInput] = useState(freeShippingThreshold);
  const [feeInput, setFeeInput] = useState(shippingFee);
  const [isSavingRules, setIsSavingRules] = useState(false);

  // Sync inputs with props changes
  useEffect(() => {
    setThresholdInput(freeShippingThreshold);
  }, [freeShippingThreshold]);

  useEffect(() => {
    setFeeInput(shippingFee);
  }, [shippingFee]);

  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [newSlotName, setNewSlotName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDeliverySlotsApi();
        setSlots(data);
      } catch {}
      setLoadingSlots(false);
    }
    load();
  }, []);

  const handleToggleSlot = async (slot: DeliverySlot) => {
    const updated = await updateDeliverySlotApi(slot.id, { is_active: !slot.is_active });
    if (updated) {
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, is_active: updated.is_active } : s));
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotName.trim()) return;
    setIsSaving(true);
    const newSlot = await createDeliverySlotApi({
      name: newSlotName.trim(),
      is_active: true,
      sort_order: slots.length + 1,
    });
    if (newSlot) {
      setSlots(prev => [...prev, newSlot].sort((a, b) => a.sort_order - b.sort_order));
      setNewSlotName("");
    }
    setIsSaving(false);
  };

  const handleMoveSlot = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slots.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const currentSlot = slots[index];
    const targetSlot = slots[swapIndex];

    const currentOrder = currentSlot.sort_order;
    const targetOrder = targetSlot.sort_order;

    currentSlot.sort_order = targetOrder;
    targetSlot.sort_order = currentOrder;

    const newSlots = [...slots];
    newSlots[index] = targetSlot;
    newSlots[swapIndex] = currentSlot;

    setSlots(newSlots.sort((a, b) => a.sort_order - b.sort_order));

    await Promise.all([
      updateDeliverySlotApi(currentSlot.id, { sort_order: targetOrder }),
      updateDeliverySlotApi(targetSlot.id, { sort_order: currentOrder })
    ]);
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm("Are you sure you want to delete this delivery slot?")) return;
    const deleted = await deleteDeliverySlotApi(id);
    if (deleted) {
      setSlots(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: analytics ? `QAR ${analytics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
            sub: 'All-time sales',
            icon: <DollarSign className="h-5 w-5 text-orange-500" />,
            color: 'from-orange-500/10 to-amber-500/5',
          },
          {
            label: 'Total Orders',
            value: analytics ? analytics.totalOrders.toString() : '—',
            sub: `${statusCounts.pending} pending`,
            icon: <ShoppingCart className="h-5 w-5 text-blue-500" />,
            color: 'from-blue-500/10 to-sky-500/5',
          },
          {
            label: 'Avg Order Value',
            value: analytics ? `QAR ${analytics.averageOrderValue.toFixed(2)}` : '—',
            sub: 'Per transaction',
            icon: <TrendingUp className="h-5 w-5 text-violet-500" />,
            color: 'from-violet-500/10 to-purple-500/5',
          },
          {
            label: 'Customers',
            value: analytics ? analytics.totalCustomers.toString() : '—',
            sub: 'Registered buyers',
            icon: <Users className="h-5 w-5 text-emerald-500" />,
            color: 'from-emerald-500/10 to-teal-500/5',
          },
        ].map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} border border-orange-500/20 rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
              <div className="h-8 w-8 rounded-lg bg-white border border-orange-500/20 flex items-center justify-center shadow-sm">
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {analyticsLoading ? <span className="h-6 w-24 bg-gray-200 rounded animate-pulse inline-block" /> : card.value}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sales Over Time Chart */}
        <div className="lg:col-span-8 bg-white border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Revenue Over Time</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Daily sales performance — last 10 days</p>
            </div>
            <BarChart2 className="h-4 w-4 text-orange-400" />
          </div>
          <div className="h-32">
            {analyticsLoading ? (
              <div className="h-full bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <SalesLineChart data={analytics?.salesOverTime || []} />
            )}
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="lg:col-span-4 bg-white border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Sales by Category</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Revenue distribution</p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <CategoryPieChart data={analytics?.salesByCategory || []} />
          )}
        </div>
      </div>

      {/* ── Order Status Summary ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'pending',   label: 'Pending',   color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
          { key: 'shipped',   label: 'Shipped',   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
          { key: 'delivered', label: 'Delivered', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
          { key: 'cancelled', label: 'Cancelled', color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200'   },
        ].map((s) => {
          const count = (statusCounts[s.key as keyof typeof statusCounts] || 0) +
            (s.key === 'delivered' ? (statusCounts['completed' as keyof typeof statusCounts] || 0) : 0);
          return (
            <div
              key={s.key}
              className={`${s.bg} border ${s.border} rounded-xl p-4 cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => setActiveTab('orders')}
            >
              <div className={`text-2xl font-black ${s.color}`}>
                {count}
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${s.color}`}>{s.label} Orders</div>
              <ChevronRight className={`h-3 w-3 mt-1 ${s.color}`} />
            </div>
          );
        })}
      </div>

      {/* ── Campaign Control Switches ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[

          {
            label: 'Midnight Flash',
            title: 'Midnight Flash Sale',
            desc: 'Forces storefront into Midnight theme mode with 75% off and a countdown timer.',
            enabled: midnightSaleEnabled,
            toggle: () => setMidnightSaleEnabled(!midnightSaleEnabled),
            onText: 'Active (75% Off Applied)',
            offText: 'Inactive',
            iconEnabled: <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />,
            iconDisabled: <span className="h-2 w-2 rounded-full bg-gray-400" />,
            toggleColor: 'text-red-500',
          },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-orange-500/30 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{c.label}</span>
                {c.enabled ? c.iconEnabled : c.iconDisabled}
              </div>
              <h4 className="text-sm font-bold text-gray-900 mt-3">{c.title}</h4>
              <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">{c.desc}</p>
            </div>
            <button
              onClick={c.toggle}
              className="flex items-center gap-2 mt-6 py-2.5 px-4 rounded-xl text-xs font-bold w-full justify-center border transition-all duration-300 cursor-pointer bg-white border-orange-500/30 hover:bg-orange-500/5"
            >
              {c.enabled ? (
                <><ToggleRight className={`h-5 w-5 ${c.toggleColor}`} />{c.onText}</>
              ) : (
                <><ToggleLeft className="h-5 w-5 text-gray-400" />{c.offText}</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* ── Shipping & Delivery Configurations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
        {/* Shipping Rules */}
        <div className="lg:col-span-5 bg-white border border-orange-500/30 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Global Shipping Rules</h4>
            <p className="text-[10px] text-gray-400 mb-5">Configure free shipping thresholds and baseline delivery fees.</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingRules(true);
              try {
                await onSaveShippingConfig(feeInput, thresholdInput);
                alert("Shipping rules saved successfully.");
              } catch {
                alert("Failed to save shipping rules.");
              }
              setIsSavingRules(false);
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Free Shipping Threshold (QAR)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(Number(e.target.value))}
                  className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/20 rounded-xl px-3 py-2.5 outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Shipping Charge (QAR)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={feeInput}
                  onChange={(e) => setFeeInput(Number(e.target.value))}
                  className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/20 rounded-xl px-3 py-2.5 outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingRules}
                className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 shadow-md shadow-orange-500/10 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSavingRules ? "Saving Configurations..." : "Save Shipping Rules"}
              </button>
            </form>
          </div>
        </div>

        {/* Delivery Time Slots */}
        <div className="lg:col-span-7 bg-white border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-orange-500/10 pb-4 mb-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Delivery Time Slots</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Manage customer preferred checkout slots.</p>
            </div>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full uppercase">
              {slots.length} Active Slots
            </span>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-10">
              <span className="h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {slots.map((slot, index) => (
                <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-orange-500/3 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 w-4">#{index + 1}</span>
                    <span className="text-xs font-bold text-gray-700">{slot.name}</span>
                    {!slot.is_active && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black uppercase">Disabled</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Up button */}
                    <button
                      onClick={() => handleMoveSlot(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded bg-white border border-gray-100 hover:border-orange-500/35 text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      ▲
                    </button>
                    {/* Down button */}
                    <button
                      onClick={() => handleMoveSlot(index, 'down')}
                      disabled={index === slots.length - 1}
                      className="p-1 rounded bg-white border border-gray-100 hover:border-orange-500/35 text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      ▼
                    </button>
                    {/* Toggle button */}
                    <button
                      onClick={() => handleToggleSlot(slot)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        slot.is_active
                          ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      {slot.is_active ? "Disable" : "Enable"}
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1 rounded bg-white border border-red-200 hover:bg-red-50 text-red-400 transition-colors cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Slot form */}
          <form onSubmit={handleAddSlot} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="e.g. 09:00 AM - 12:00 PM"
              value={newSlotName}
              onChange={(e) => setNewSlotName(e.target.value)}
              className="flex-1 text-xs font-semibold text-gray-700 bg-white border border-orange-500/20 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isSaving || !newSlotName.trim()}
              className="px-4 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              Add Slot
            </button>
          </form>
        </div>
      </div>

      {/* ── Storefront Schema Mapper ── */}
      <div className="bg-white border border-orange-500/30 rounded-2xl p-6">
        <div className="pb-4 mb-6 border-b border-orange-500/20">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Visual Storefront Mapping Schema</h4>
          <p className="text-[10px] text-gray-400 mt-1">
            Hover over any component to see which admin module controls it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-2.5 bg-gray-50 p-5 rounded-2xl border border-orange-500/10">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block text-center mb-3">GRIVA Storefront Homepage Layout</span>

            {[
              { key: 'announcement', label: `Top Announcement Bar ${announcementBarEnabled ? '(ACTIVE)' : '(DISABLED)'}`, tab: 'overview', bold: false },
              { key: 'nav', label: 'Website Navigation Header (Search, Wishlist, Cart)', tab: null, bold: false },
              { key: 'hero', label: `Hero Promo Carousel Slides (${slidesList.length} Slides)`, tab: 'banners', bold: true },
              { key: 'categories', label: `Category Quick Nav Banners (${categoriesList.length} Categories)`, tab: 'banners', bold: false },
              { key: 'products', label: 'Catalog Product Grids (Filterable Category Shop views)', tab: 'products', bold: true },
            ].map(({ key, label, tab, bold }) => (
              <div
                key={key}
                onMouseEnter={() => setHighlightedSchemaSection(key)}
                onMouseLeave={() => setHighlightedSchemaSection(null)}
                onClick={() => tab && setActiveTab(tab)}
                className={`h-14 flex items-center justify-center px-3 rounded-lg text-[9px] font-${bold ? 'black' : 'bold'} text-center border cursor-pointer transition-all duration-200 select-none
                  ${highlightedSchemaSection === key
                    ? 'bg-orange-500/15 border-orange-500 text-orange-500 scale-[1.01] shadow-sm'
                    : key === 'announcement' && announcementBarEnabled
                      ? 'bg-orange-500/8 border-orange-500/30 text-orange-400'
                      : 'bg-white border-orange-500/20 text-gray-700'
                  }`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-gray-50 border border-orange-500/20 rounded-xl min-h-[120px]">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Component Controller</span>
              {!highlightedSchemaSection && (
                <p className="text-xs text-gray-400 mt-2">Hover over elements on the left schema to inspect admin mappings.</p>
              )}
              {highlightedSchemaSection === 'announcement' && (
                <div className="mt-2 space-y-1">
                  <h5 className="text-xs font-bold text-gray-900">Announcement Marquee</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Controlled in <strong>Overview</strong> via the "Storefront Top Bar" toggle. Displays free shipping promos to Doha shoppers.</p>
                </div>
              )}
              {highlightedSchemaSection === 'hero' && (
                <div className="mt-2 space-y-1">
                  <h5 className="text-xs font-bold text-gray-900">Hero Slideshow Carousel</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Managed under <strong>Banners & Layouts</strong>. Edit slide titles, image URLs, pricing labels, and background colors.</p>
                </div>
              )}
              {highlightedSchemaSection === 'categories' && (
                <div className="mt-2 space-y-1">
                  <h5 className="text-xs font-bold text-gray-900">Category Grid</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Managed under <strong>Banners & Layouts</strong>. Modify category cover images to match promotional inventory styles.</p>
                </div>
              )}
              {highlightedSchemaSection === 'products' && (
                <div className="mt-2 space-y-1">
                  <h5 className="text-xs font-bold text-gray-900">Catalog Product Grid</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Managed under <strong>Manage Products</strong>. Add new items, adjust stock levels, manage pricing and gallery images.</p>
                </div>
              )}
              {highlightedSchemaSection === 'nav' && (
                <div className="mt-2 space-y-1">
                  <h5 className="text-xs font-bold text-gray-900">Navigation Header</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">This component is hardcoded. Update <code className="text-[9px] bg-gray-100 px-1 py-0.5 rounded">Navbar.tsx</code> directly in the codebase to modify navigation links.</p>
                </div>
              )}
            </div>

            {/* Quick Jump Shortcuts */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Package className="h-3.5 w-3.5" />, label: 'Manage Products', tab: 'products' },
                { icon: <Sliders className="h-3.5 w-3.5" />, label: 'Banners & Layouts', tab: 'banners' },
              ].map((btn) => (
                <button
                  key={btn.tab}
                  onClick={() => setActiveTab(btn.tab)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold text-gray-600 border border-orange-500/20 hover:bg-orange-500/5 hover:text-orange-500 transition-all duration-200 cursor-pointer"
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
