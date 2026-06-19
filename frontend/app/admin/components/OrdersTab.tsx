import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, CheckCircle, Truck, XCircle, Clock, UserCheck,
  ChevronDown, Package, MapPin, Mail, Hash
} from 'lucide-react';
import { AdminOrder, updateOrderStatusApi } from '../../utils/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface OrdersTabProps {
  ordersList: AdminOrder[];
  setOrdersList: React.Dispatch<React.SetStateAction<AdminOrder[]>>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:          { label: 'Pending',          color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',    icon: <Clock className="h-3 w-3" /> },
  processing:       { label: 'Processing',       color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200',  icon: <Package className="h-3 w-3" /> },
  assigned:         { label: 'Assigned',         color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',      icon: <UserCheck className="h-3 w-3" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200',  icon: <Truck className="h-3 w-3" /> },
  shipped:          { label: 'Shipped',          color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',      icon: <Truck className="h-3 w-3" /> },
  delivered:        { label: 'Delivered',        color: 'text-green-600',  bg: 'bg-green-50 border-green-200',    icon: <CheckCircle className="h-3 w-3" /> },
  completed:        { label: 'Completed',        color: 'text-green-600',  bg: 'bg-green-50 border-green-200',    icon: <CheckCircle className="h-3 w-3" /> },
  cancelled:        { label: 'Cancelled',        color: 'text-red-500',    bg: 'bg-red-50 border-red-200',        icon: <XCircle className="h-3 w-3" /> },
};

const STATUS_FLOW: Record<string, string[]> = {
  pending:          ['processing', 'cancelled'],
  processing:       ['shipped', 'cancelled'],
  assigned:         ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  shipped:          ['completed', 'cancelled'],
  delivered:        [],
  completed:        [],
  cancelled:        [],
};

interface DeliveryBoy {
  id: number;
  name: string;
  email: string;
  activeOrderCount: number;
}

export default function OrdersTab({ ordersList, setOrdersList }: OrdersTabProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // FEATURE: Delivery Boy System — assign driver state
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<Record<number, number>>({});
  const [assigningId, setAssigningId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDeliveryBoys = async () => {
      try {
        const token = localStorage.getItem('griva_admin_token') || '';
        const res = await fetch(`${API_BASE}/orders/admin/delivery-boys`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDeliveryBoys(data.deliveryBoys || []);
        }
      } catch {}
    };
    fetchDeliveryBoys();
  }, []);

  const handleAssignDriver = async (orderId: number) => {
    const driverId = selectedDriverId[orderId];
    if (!driverId) return;
    setAssigningId(orderId);
    try {
      const token = localStorage.getItem('griva_admin_token') || '';
      const res = await fetch(`${API_BASE}/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deliveryBoyId: driverId }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrdersList(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: 'assigned', delivery_boy_id: driverId } : o)
        );
      }
    } catch {}
    setAssigningId(null);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    setOrdersList(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );
    await updateOrderStatusApi(orderId, newStatus);
    setUpdatingId(null);
  };

  const filteredOrders = filterStatus === 'all'
    ? ordersList
    : ordersList.filter(o => o.status === filterStatus);

  const counts: Record<string, number> = {
    all: ordersList.length,
    pending: ordersList.filter(o => o.status === 'pending').length,
    processing: ordersList.filter(o => o.status === 'processing').length,
    assigned: ordersList.filter(o => o.status === 'assigned').length,
    out_for_delivery: ordersList.filter(o => o.status === 'out_for_delivery').length,
    shipped: ordersList.filter(o => o.status === 'shipped').length,
    delivered: ordersList.filter(o => o.status === 'delivered').length,
    completed: ordersList.filter(o => o.status === 'completed').length,
    cancelled: ordersList.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl border border-orange-500/30">
        {(['all', 'pending', 'processing', 'assigned', 'out_for_delivery', 'shipped', 'delivered', 'completed', 'cancelled']).map((status) => {
          const cfg = status === 'all' ? null : STATUS_CONFIG[status];
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/30'
                  : 'bg-white text-gray-500 border-orange-500/20 hover:border-orange-500/50'
              }`}
            >
              {cfg?.icon}
              <span className="capitalize">{status}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[status]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-orange-500/20 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-xs text-gray-400">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No orders found for this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const isExpanded = expandedOrderId === order.id;
                  const nextStatuses = STATUS_FLOW[order.status] || [];

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className="hover:bg-orange-500/3 transition-colors cursor-pointer group"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      >
                        {/* Order ID */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-orange-400" />
                            <span className="text-xs font-black text-gray-800">{order.order_number || `ORD-${String(order.id).padStart(4, '0')}`}</span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {(order.user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-800 block truncate max-w-[140px]">
                                {order.user?.email || `Customer #${order.user_id}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Items count */}
                        <td className="p-4">
                          <span className="text-xs text-gray-500 font-semibold">
                            {order.items?.length || 1} item{(order.items?.length || 1) > 1 ? 's' : ''}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="p-4">
                          <span className="text-xs font-black text-gray-900">
                            {order.total_price ? `QAR ${parseFloat(String(order.total_price).replace(/([$]|qar|[\s,])/gi, "") || "0").toFixed(2)}` : "—"}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-4">
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {nextStatuses.map((nextStatus) => {
                              const nextCfg = STATUS_CONFIG[nextStatus];
                              return (
                                <button
                                  key={nextStatus}
                                  disabled={updatingId === order.id}
                                  onClick={() => handleStatusChange(order.id, nextStatus)}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${nextCfg.bg} ${nextCfg.color} hover:opacity-80`}
                                >
                                  {updatingId === order.id ? (
                                    <span className="h-2.5 w-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                                  ) : nextCfg.icon}
                                  Mark {nextCfg.label}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border border-orange-500/20"
                            >
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Order Details */}
                      {isExpanded && (
                        <tr className="bg-orange-500/3">
                          <td colSpan={7} className="px-4 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              {/* Items */}
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order Items</span>
                                {(order.items || []).map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 bg-white border border-orange-500/20 rounded-xl p-3">
                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                      {item.product?.main_image_url && (
                                        <img
                                          src={item.product.main_image_url}
                                          alt={item.product.title}
                                          className="h-full w-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-gray-800 truncate">{item.product?.title || `Product #${item.product_id}`}</p>
                                      <p className="text-[10px] text-gray-400">Qty: {item.quantity} × QAR {Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, "")).toFixed(2)}</p>
                                    </div>
                                    <span className="text-xs font-black text-gray-800 shrink-0">
                                      QAR {(Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, "")) * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Shipping */}
                              <div className="space-y-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Details</span>
                                <div className="bg-white border border-orange-500/20 rounded-xl p-4 space-y-3">
                                  <div className="flex items-start gap-2.5">
                                    <MapPin className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Shipping Address</p>
                                      <p className="text-xs font-bold text-gray-800 mt-0.5">{order.shipping_address}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2.5 pt-2 border-t border-orange-500/10">
                                    <Mail className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Customer Email</p>
                                      <p className="text-xs font-bold text-gray-800 mt-0.5">{order.user?.email || `User #${order.user_id}`}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2.5 pt-2 border-t border-orange-500/10">
                                    <ShoppingCart className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Order Total</p>
                                      <p className="text-sm font-black text-gray-900 mt-0.5">
                                        {order.total_price ? `QAR ${parseFloat(String(order.total_price).replace(/([$]|qar|[\s,])/gi, "") || "0").toFixed(2)}` : "—"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* FEATURE: Delivery Boy System — Assign Driver */}
                                <div className="pt-3 border-t border-orange-500/10">
                                  <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1.5">🚚 Assign Delivery Driver</p>
                                  {(order as any).delivery_boy_id ? (
                                    <p className="text-xs font-bold text-blue-600">
                                      ✅ Assigned to: {deliveryBoys.find(d => d.id === (order as any).delivery_boy_id)?.name || `Driver #${(order as any).delivery_boy_id}`}
                                    </p>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={selectedDriverId[order.id] || ''}
                                        onChange={(e) => setSelectedDriverId(prev => ({ ...prev, [order.id]: Number(e.target.value) }))}
                                        className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:border-orange-400"
                                      >
                                        <option value="">Select Driver...</option>
                                        {deliveryBoys.map(d => (
                                          <option key={d.id} value={d.id}>{d.name} ({d.activeOrderCount} active)</option>
                                        ))}
                                      </select>
                                      <button
                                        disabled={!selectedDriverId[order.id] || assigningId === order.id}
                                        onClick={(e) => { e.stopPropagation(); handleAssignDriver(order.id); }}
                                        className="text-[10px] font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-3 py-2 rounded-lg cursor-pointer"
                                      >
                                        {assigningId === order.id ? '...' : 'Assign'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
