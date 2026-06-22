import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingCart, CheckCircle, Truck, XCircle, Clock, UserCheck,
  ChevronDown, Package, MapPin, Mail, Hash, AlertTriangle, RefreshCw, PhoneCall,
  Printer, Download
} from 'lucide-react';
import { AdminOrder, updateOrderStatusApi, downloadOrdersExportApi, bulkPrintOrdersApi } from '../../utils/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface OrdersTabProps {
  ordersList: AdminOrder[];
  setOrdersList: React.Dispatch<React.SetStateAction<AdminOrder[]>>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  new:              { label: 'New/Unseen',       color: 'text-red-600',    bg: 'bg-red-50 border-red-200',        icon: <Clock className="h-3 w-3 text-red-500 animate-pulse" /> },
  pending:          { label: 'Pending',          color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',    icon: <Clock className="h-3 w-3" /> },
  processing:       { label: 'Processing',       color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200',  icon: <Package className="h-3 w-3" /> },
  assigned:         { label: 'Assigned',         color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',      icon: <UserCheck className="h-3 w-3" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200',  icon: <Truck className="h-3 w-3" /> },
  shipped:          { label: 'Shipped',          color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',      icon: <Truck className="h-3 w-3" /> },
  delivered:        { label: 'Delivered',        color: 'text-green-600',  bg: 'bg-green-50 border-green-200',    icon: <CheckCircle className="h-3 w-3" /> },
  completed:        { label: 'Completed',        color: 'text-green-600',  bg: 'bg-green-50 border-green-200',    icon: <CheckCircle className="h-3 w-3" /> },
  cancelled:        { label: 'Cancelled',        color: 'text-red-500',    bg: 'bg-red-50 border-red-200',        icon: <XCircle className="h-3 w-3" /> },
  attempted:        { label: 'Attempted',        color: 'text-yellow-800', bg: 'bg-yellow-100 border-yellow-200',  icon: <AlertTriangle className="h-3 w-3" /> },
  rescheduled:      { label: 'Rescheduled',      color: 'text-blue-800',   bg: 'bg-blue-100 border-blue-200',     icon: <RefreshCw className="h-3 w-3" /> },
  failed:           { label: 'Failed',           color: 'text-red-800',    bg: 'bg-red-100 border-red-200',       icon: <XCircle className="h-3 w-3" /> },
};

const STATUS_FLOW: Record<string, string[]> = {
  pending:          ['processing', 'cancelled'],
  processing:       ['shipped', 'delivered', 'cancelled'],
  assigned:         ['out_for_delivery', 'delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  shipped:          ['delivered', 'cancelled'],
  delivered:        [],
  completed:        [],
  cancelled:        [],
  attempted:        ['processing', 'delivered', 'cancelled'],
  rescheduled:      ['delivered', 'cancelled'],
  failed:           ['processing', 'delivered', 'cancelled'],
};

interface DeliveryBoy {
  id: number;
  name: string;
  email: string;
  activeOrderCount: number;
}

export default function OrdersTab({ ordersList, setOrdersList }: OrdersTabProps) {
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(statusParam || 'all');
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [filterSlot, setFilterSlot] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterPrintStatus, setFilterPrintStatus] = useState<string>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStatus, setExportStatus] = useState('all');
  const [exportPrintStatus, setExportPrintStatus] = useState('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    if (statusParam) {
      setFilterStatus(statusParam);
    }
  }, [statusParam]);

  // FEATURE: Delivery Boy System — assign driver state
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<Record<number, number>>({});
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [openDriverSelectId, setOpenDriverSelectId] = useState<number | null>(null);
  const [openReassignSelectId, setOpenReassignSelectId] = useState<number | null>(null);

  // FEATURE: Delivery Attempt Management — needs attention state
  interface NeedsAttentionOrder {
    id: number;
    order_number?: string;
    status: string;
    total_price: string;
    shipping_address: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    delivery_attempts: number;
    attempt_notes?: string;
    failed_reason?: string;
    reschedule_time?: string;
    reopen_count: number;
    updatedAt: string;
    user?: { id: number; name: string; email: string };
    deliveryBoy?: { id: number; name: string; email: string };
    items?: { id: number; quantity: number; product?: { id: number; title: string } }[];
  }
  const [needsAttentionOrders, setNeedsAttentionOrders] = useState<NeedsAttentionOrder[]>([]);
  const [reopenModal, setReopenModal] = useState<{ orderId: number; orderNumber: string } | null>(null);
  const [reopenNote, setReopenNote] = useState('');
  const [reopenLoading, setReopenLoading] = useState(false);
  const [reopenError, setReopenError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const fetchDeliveryBoys = async () => {
      try {
        const token = localStorage.getItem('griva_admin_token') || localStorage.getItem('griva_staff_token') || '';
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

  // FEATURE: Delivery Attempt Management — fetch needs attention
  const fetchNeedsAttention = async () => {
    try {
      const token = localStorage.getItem('griva_admin_token') || localStorage.getItem('griva_staff_token') || '';
      const res = await fetch(`${API_BASE}/orders/needs-attention`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNeedsAttentionOrders(data.orders || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNeedsAttention();
  }, [ordersList]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_BASE}/delivery-slots`);
        if (res.ok) {
          const data = await res.json();
          setDeliverySlots(data.slots || []);
        }
      } catch {}
    };
    fetchSlots();
  }, []);

  const handleAssignDriver = async (orderId: number) => {
    const driverId = selectedDriverId[orderId];
    if (!driverId) return;
    setAssigningId(orderId);
    try {
      const token = localStorage.getItem('griva_admin_token') || localStorage.getItem('griva_staff_token') || '';
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
      prev.map(o => o.id === orderId ? { ...o, status: newStatus, reviewed_at: o.reviewed_at || new Date().toISOString() } : o)
    );
    await updateOrderStatusApi(orderId, newStatus);
    setUpdatingId(null);
  };

  // FEATURE: Delivery Attempt Management — reopen order
  const handleReopenOrder = async () => {
    if (!reopenModal) return;
    setReopenLoading(true);
    setReopenError('');
    try {
      const token = localStorage.getItem('griva_admin_token') || localStorage.getItem('griva_staff_token') || '';
      const res = await fetch(`${API_BASE}/orders/${reopenModal.orderId}/reopen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: reopenNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setReopenModal(null);
        setReopenNote('');
        setOrdersList(prev => prev.map(o => o.id === reopenModal.orderId ? { ...o, status: 'processing' } : o));
        fetchNeedsAttention();
        setToastMsg('Order reopened. Please assign a driver.');
        setTimeout(() => setToastMsg(''), 3500);
      } else {
        setReopenError(data.message || 'Something went wrong, please try again.');
      }
    } catch {
      setReopenError('Something went wrong, please try again.');
    } finally {
      setReopenLoading(false);
    }
  };

  const printOrderSlip = (order: AdminOrder) => {
    const itemsHtml = (order.items || []).map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px 0; font-size: 14px;">${item.quantity} x ${item.product?.title || `Product #${item.product_id}`}</td>
        <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: bold;">
          QAR ${(Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, "")) * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print orders.");
      return;
    }

    const orderNumber = order.order_number || `ORD-${String(order.id).padStart(4, '0')}`;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    const html = `
      <html>
        <head>
          <title>Print Order ${orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              letter-spacing: 2px;
            }
            .section {
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #ccc;
            }
            .section-title {
              font-size: 12px;
              text-transform: uppercase;
              color: #777;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .info-row {
              margin-bottom: 4px;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .total-row {
              font-size: 16px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GRIVA</h1>
            <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">Order Print Slip</p>
          </div>

          <div class="section">
            <div class="info-row"><span class="info-label">Order Number:</span> ${orderNumber}</div>
            <div class="info-row"><span class="info-label">Date:</span> ${orderDate}</div>
          </div>

          <div class="section">
            <div class="section-title">Customer Details</div>
            <div class="info-row"><span class="info-label">Name:</span> ${order.customer_name || 'N/A'}</div>
            <div class="info-row"><span class="info-label">Phone:</span> ${order.customer_phone || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Delivery Details</div>
            <div class="info-row"><span class="info-label">Address:</span> ${order.shipping_address}</div>
            <div class="info-row"><span class="info-label">Delivery Slot:</span> ${(order as any).deliverySlot?.name || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Products</div>
            <table>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section" style="border-bottom: none;">
            <div class="total-row">
              <span>Total Items:</span>
              <span>${(order.items || []).reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
            <div class="total-row" style="margin-top: 5px; font-size: 18px;">
              <span>Total Amount:</span>
              <span>${order.total_price || '—'}</span>
            </div>
            <div class="info-row" style="margin-top: 15px;"><span class="info-label">Order Status:</span> <span style="text-transform: capitalize;">${order.status}</span></div>
            ${order.delivery_notes ? `<div class="info-row" style="margin-top: 10px;"><span class="info-label">Notes:</span> ${order.delivery_notes}</div>` : ''}
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintNewOrders = async () => {
    const unprintedOrders = ordersList.filter(o => !(o as any).is_printed);
    if (unprintedOrders.length === 0) {
      setToastMsg('No new unprinted orders to print.');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print orders.");
      return;
    }

    const slipsHtml = unprintedOrders.map(order => {
      const orderNumber = order.order_number || `ORD-${String(order.id).padStart(4, '0')}`;
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      const itemsHtml = (order.items || []).map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0; font-size: 14px;">${item.quantity} x ${item.product?.title || `Product #${item.product_id}`}</td>
          <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: bold;">
            QAR ${(Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, "")) * item.quantity).toFixed(2)}
          </td>
        </tr>
      `).join('');

      return `
        <div class="order-slip">
          <div class="header">
            <h1>GRIVA</h1>
            <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">Order Print Slip</p>
          </div>

          <div class="section">
            <div class="info-row"><span class="info-label">Order Number:</span> ${orderNumber}</div>
            <div class="info-row"><span class="info-label">Date:</span> ${orderDate}</div>
          </div>

          <div class="section">
            <div class="section-title">Customer Details</div>
            <div class="info-row"><span class="info-label">Name:</span> ${order.customer_name || 'N/A'}</div>
            <div class="info-row"><span class="info-label">Phone:</span> ${order.customer_phone || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Delivery Details</div>
            <div class="info-row"><span class="info-label">Address:</span> ${order.shipping_address}</div>
            <div class="info-row"><span class="info-label">Delivery Slot:</span> ${(order as any).deliverySlot?.name || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Products</div>
            <table>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section" style="border-bottom: none;">
            <div class="total-row">
              <span>Total Items:</span>
              <span>${(order.items || []).reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
            <div class="total-row" style="margin-top: 5px; font-size: 18px;">
              <span>Total Amount:</span>
              <span>${order.total_price || '—'}</span>
            </div>
            <div class="info-row" style="margin-top: 15px;"><span class="info-label">Order Status:</span> <span style="text-transform: capitalize;">${order.status}</span></div>
            ${order.delivery_notes ? `<div class="info-row" style="margin-top: 10px;"><span class="info-label">Notes:</span> ${order.delivery_notes}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <title>Print Bulk Orders</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.4;
            }
            .order-slip {
              page-break-after: always;
              border-bottom: 2px solid #333;
              padding-bottom: 30px;
              margin-bottom: 30px;
            }
            .order-slip:last-child {
              page-break-after: avoid;
              border-bottom: none;
              padding-bottom: 0;
              margin-bottom: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              letter-spacing: 2px;
            }
            .section {
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #ccc;
            }
            .section-title {
              font-size: 12px;
              text-transform: uppercase;
              color: #777;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .info-row {
              margin-bottom: 4px;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .total-row {
              font-size: 16px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
            }
            @media print {
              .order-slip {
                border-bottom: none;
                padding-bottom: 0;
                margin-bottom: 0;
              }
            }
          </style>
        </head>
        <body>
          ${slipsHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    const orderIds = unprintedOrders.map(o => o.id);
    try {
      const success = await bulkPrintOrdersApi(orderIds);
      if (success) {
        setOrdersList(prev =>
          prev.map(o => orderIds.includes(o.id) ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
        );
        setToastMsg(`Successfully printed and marked ${orderIds.length} orders.`);
        setTimeout(() => setToastMsg(''), 3500);
      }
    } catch {}
  };

  const handleExportOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    setExporting(true);
    setExportError('');
    try {
      await downloadOrdersExportApi({
        startDate: exportStartDate || undefined,
        endDate: exportEndDate || undefined,
        status: exportStatus === 'all' ? undefined : exportStatus,
        printStatus: exportPrintStatus === 'all' ? undefined : exportPrintStatus,
        format: exportFormat,
      });
      setIsExportModalOpen(false);
    } catch (err: any) {
      setExportError(err.message || 'Failed to export orders. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const timeSince = (dateStr: string) => {
    const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const filteredOrders = ordersList.filter(o => {
    // 1. Status Filter
    let matchesStatus = false;
    if (filterStatus === 'all') {
      matchesStatus = true;
    } else if (filterStatus === 'new') {
      matchesStatus = o.status === 'pending' && !(o as any).reviewed_at;
    } else {
      const displayStatus = o.status === 'completed' ? 'delivered' : o.status;
      matchesStatus = displayStatus === filterStatus;
    }

    // 2. Slot Filter
    const matchesSlot = filterSlot === 'all' || String((o as any).delivery_slot_id) === filterSlot;

    // 3. Date Range Filter
    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      
      if (filterDateRange === 'today') {
        matchesDate = orderDate.toDateString() === today.toDateString();
      } else if (filterDateRange === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        matchesDate = orderDate.toDateString() === yesterday.toDateString();
      } else if (filterDateRange === 'week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      }
    }

    // 4. Unified Search (Order Number, Customer Name, Phone Number)
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const orderNo = (o.order_number || `ORD-${String(o.id).padStart(4, '0')}`).toLowerCase();
      const customerName = (o.customer_name || o.user?.email || '').toLowerCase();
      const customerPhone = (o.customer_phone || '').toLowerCase();
      matchesSearch = orderNo.includes(query) || customerName.includes(query) || customerPhone.includes(query);
    }

    // 5. Print Status Filter
    let matchesPrintStatus = true;
    if (filterPrintStatus === 'printed') {
      matchesPrintStatus = !!(o as any).is_printed;
    } else if (filterPrintStatus === 'unprinted') {
      matchesPrintStatus = !(o as any).is_printed;
    }

    return matchesStatus && matchesSlot && matchesDate && matchesSearch && matchesPrintStatus;
  });

  const counts: Record<string, number> = {
    all: ordersList.length,
    new: ordersList.filter(o => o.status === 'pending' && !(o as any).reviewed_at).length,
    pending: ordersList.filter(o => o.status === 'pending').length,
    processing: ordersList.filter(o => o.status === 'processing').length,
    assigned: ordersList.filter(o => o.status === 'assigned').length,
    out_for_delivery: ordersList.filter(o => o.status === 'out_for_delivery').length,
    shipped: ordersList.filter(o => o.status === 'shipped').length,
    delivered: ordersList.filter(o => o.status === 'delivered' || o.status === 'completed').length,
    cancelled: ordersList.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">

      {/* FEATURE: Delivery Attempt Management — Needs Attention Alert Banner */}
      {needsAttentionOrders.length > 0 && (
        <a
          href="#needs-attention-section"
          className="block bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm font-bold cursor-pointer hover:bg-red-100 transition-colors"
        >
          ⚠️ {needsAttentionOrders.length} order{needsAttentionOrders.length > 1 ? 's' : ''} need your attention
        </a>
      )}

      {/* FEATURE: Delivery Attempt Management — Needs Attention Section */}
      {needsAttentionOrders.length > 0 && (
        <div id="needs-attention-section" className="space-y-3">
          <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            ⚠️ Needs Attention
          </h3>
          {needsAttentionOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const FAILED_REASON_LABELS: Record<string, string> = {
              not_answering: 'Customer not answering',
              customer_refused: 'Customer refused delivery',
              wrong_address: 'Wrong address',
              rescheduled: 'Customer asked to come later',
            };
            return (
              <div key={order.id} className="bg-white border border-red-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-gray-800">{order.order_number || `ORD-${String(order.id).padStart(4, '0')}`}</span>
                    <span className={`ml-2 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold">{timeSince(order.updatedAt)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400 font-semibold">Customer:</span> <span className="font-bold text-gray-800">{order.customer_name || order.user?.name || 'N/A'}</span></div>
                  <div><span className="text-gray-400 font-semibold">Phone:</span> <span className="font-bold text-gray-800">{order.customer_phone || 'N/A'}</span></div>
                  <div><span className="text-gray-400 font-semibold">Driver:</span> <span className="font-bold text-gray-800">{order.deliveryBoy?.name || 'Unassigned'}</span></div>
                  <div><span className="text-gray-400 font-semibold">Attempts:</span> <span className="font-bold text-gray-800">{order.delivery_attempts}</span></div>
                </div>

                {order.attempt_notes && (
                  <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600">
                    <span className="font-bold text-gray-400">Driver Note:</span> {order.attempt_notes}
                  </div>
                )}

                {order.failed_reason && (
                  <div className="text-xs font-bold text-orange-600">
                    Reason: {FAILED_REASON_LABELS[order.failed_reason] || order.failed_reason}
                  </div>
                )}

                {order.status === 'rescheduled' && order.reschedule_time && (
                  <div className="text-xs font-bold text-blue-600">
                    📅 Reschedule: {new Date(order.reschedule_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {order.customer_phone && (
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold border bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 cursor-pointer"
                    >
                      <PhoneCall className="h-3 w-3" />
                      📞 Call Customer
                    </a>
                  )}

                  {(order.status === 'attempted' || order.status === 'failed' || order.status === 'cancelled') && (
                    <button
                      onClick={() => {
                        setReopenModal({ orderId: order.id, orderNumber: order.order_number || `ORD-${String(order.id).padStart(4, '0')}` });
                        setReopenNote('');
                        setReopenError('');
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold border bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      🔄 Reopen Order
                    </button>
                  )}

                  {(order.status === 'rescheduled') && (
                    <button
                      onClick={() => {}}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold border bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer"
                    >
                      <CheckCircle className="h-3 w-3" />
                      ✅ Keep Assignment
                    </button>
                  )}

                  {(order.status === 'rescheduled') && (
                    <div className="relative z-[45]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenReassignSelectId(openReassignSelectId === order.id ? null : order.id);
                        }}
                        className="text-[10px] font-bold text-gray-700 bg-white border border-orange-500/20 rounded-xl px-3 py-2 flex items-center justify-between gap-1.5 outline-none hover:border-orange-500/40 transition-all cursor-pointer min-w-[150px]"
                      >
                        <span className="truncate">
                          {selectedDriverId[order.id]
                            ? deliveryBoys.find(d => d.id === selectedDriverId[order.id])?.name
                            : "🔄 Reassign Driver..."}
                        </span>
                        <ChevronDown size={12} className={`text-gray-400 shrink-0 transition-transform ${openReassignSelectId === order.id ? "rotate-180 text-orange-500" : ""}`} />
                      </button>

                      {openReassignSelectId === order.id && (
                        <>
                          {/* Invisible Fullscreen Backdrop to safely catch click-outside */}
                          <div
                            className="fixed inset-0 z-40 bg-transparent cursor-default"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenReassignSelectId(null);
                            }}
                          />
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto min-w-[180px]">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenReassignSelectId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-[10px] font-semibold text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                            >
                              🔄 Reassign Driver...
                            </button>
                            {deliveryBoys.map(d => (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => {
                                  setSelectedDriverId(prev => ({ ...prev, [order.id]: d.id }));
                                  setOpenReassignSelectId(null);
                                  // Directly invoke assign driver
                                  setAssigningId(order.id);
                                  fetch(`${API_BASE}/orders/${order.id}/assign`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('griva_admin_token') || localStorage.getItem('griva_staff_token') || ''}` },
                                    body: JSON.stringify({ deliveryBoyId: d.id }),
                                  }).then(res => {
                                    if (res.ok) {
                                      setOrdersList(prev => prev.map(o => o.id === order.id ? { ...o, status: 'assigned', delivery_boy_id: d.id } : o));
                                      fetchNeedsAttention();
                                    }
                                    setAssigningId(null);
                                  }).catch(() => setAssigningId(null));
                                }}
                                className={`w-full text-left px-3 py-2 text-[10px] font-semibold transition-colors flex items-center justify-between ${
                                  selectedDriverId[order.id] === d.id
                                    ? "text-orange-500 bg-orange-50/50 font-bold"
                                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                                }`}
                              >
                                <span>👤 {d.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${d.activeOrderCount > 0 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                                  {d.activeOrderCount} active
                                </span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {(order.status === 'attempted' || order.status === 'rescheduled' || order.status === 'failed') && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      disabled={updatingId === order.id}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold border bg-red-50 border-red-200 text-red-700 hover:bg-red-100 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="h-3 w-3" />
                      {updatingId === order.id ? '...' : '❌ Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Operations Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-orange-500/30 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Order Operations</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Manage packing slips, batch printing, and flexible data exports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrintNewOrders}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
          >
            <Printer className="h-4 w-4" />
            Print New Orders
          </button>
          <button
            onClick={() => {
              setExportStartDate('');
              setExportEndDate('');
              setExportStatus('all');
              setExportPrintStatus('all');
              setExportFormat('xlsx');
              setExportError('');
              setIsExportModalOpen(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 border border-orange-500/30 hover:bg-orange-500/5 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
          >
            <Download className="h-4 w-4" />
            Export Orders
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-orange-500/30 shadow-xs">
        {/* Unified Search Input */}
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Search by Order Number, Customer Name, Phone Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-4 pr-10 py-2.5 bg-gray-50 border border-orange-500/10 hover:border-orange-500/30 focus:border-orange-500 focus:bg-white rounded-xl outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date Range Dropdown */}
        <select
          value={filterDateRange}
          onChange={(e) => setFilterDateRange(e.target.value)}
          className="text-xs font-bold text-gray-750 bg-gray-50 border border-orange-500/10 hover:border-orange-500/30 rounded-xl px-3 py-2.5 outline-none cursor-pointer focus:bg-white transition-all shadow-xs"
        >
          <option value="all">📅 All Time</option>
          <option value="today">📅 Today</option>
          <option value="yesterday">📅 Yesterday</option>
          <option value="week">📅 Last 7 Days</option>
        </select>

        {/* Print Status Dropdown */}
        <select
          value={filterPrintStatus}
          onChange={(e) => setFilterPrintStatus(e.target.value)}
          className="text-xs font-bold text-gray-750 bg-gray-50 border border-orange-500/10 hover:border-orange-500/30 rounded-xl px-3 py-2.5 outline-none cursor-pointer focus:bg-white transition-all shadow-xs"
        >
          <option value="all">🖨️ All Print Statuses</option>
          <option value="printed">🖨️ Printed Orders</option>
          <option value="unprinted">🖨️ Unprinted Orders</option>
        </select>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl border border-orange-500/30">
        {(['all', 'new', 'pending', 'processing', 'assigned', 'out_for_delivery', 'shipped', 'delivered', 'cancelled']).map((status) => {
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
              <span className="capitalize">{status === 'new' ? 'New' : status}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[status]}
              </span>
            </button>
          );
        })}

        <select
          value={filterSlot}
          onChange={(e) => setFilterSlot(e.target.value)}
          className="text-xs font-bold text-gray-750 bg-white border border-orange-500/20 rounded-lg px-3 py-1.5 outline-none hover:border-orange-500/40 cursor-pointer md:ml-auto"
        >
          <option value="all">All Delivery Slots</option>
          {deliverySlots.map(s => (
            <option key={s.id} value={String(s.id)}>{s.name}</option>
          ))}
        </select>
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
                <th className="p-4">Delivery Slot</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Age</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-xs text-gray-400">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No orders found for this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const displayStatus = order.status === 'completed' ? 'delivered' : order.status;
                  const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.pending;
                  const isExpanded = expandedOrderId === order.id;
                  const nextStatuses = STATUS_FLOW[displayStatus] || [];

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className={`hover:bg-orange-500/3 transition-colors cursor-pointer group ${
                          order.status === 'pending' && !(order as any).reviewed_at
                            ? 'border-l-4 border-l-amber-500 bg-amber-500/5'
                            : ''
                        }`}
                        onClick={() => {
                          const isUnreviewed = order.status === 'pending' && !(order as any).reviewed_at;
                          if (!isExpanded && isUnreviewed) {
                            const token = localStorage.getItem('griva_admin_token') || localStorage.getItem('griva_staff_token') || '';
                            fetch(`${API_BASE}/orders/${order.id}/review`, {
                              method: 'PATCH',
                              headers: { Authorization: `Bearer ${token}` }
                            }).then(res => {
                              if (res.ok) {
                                setOrdersList(prev => prev.map(o => o.id === order.id ? { ...o, reviewed_at: new Date().toISOString() } : o));
                              }
                            });
                          }
                          setExpandedOrderId(isExpanded ? null : order.id);
                        }}
                      >
                        {/* Order ID */}
                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap max-w-[150px]">
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3 text-orange-400" />
                              <span className="text-xs font-black text-gray-800">
                                {order.order_number || `ORD-${String(order.id).padStart(4, '0')}`}
                              </span>
                            </div>
                            {order.status === 'pending' && !(order as any).reviewed_at && (
                              <span className="inline-flex items-center text-[9px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 rounded-sm animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {(order.customer_name || order.user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-800 block truncate max-w-[145px]" title={order.customer_name || order.user?.email}>
                                {order.customer_name || order.user?.email || `Customer #${order.user_id}`}
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

                        {/* Delivery Slot */}
                        <td className="p-4">
                          <span className="text-xs text-gray-650 font-semibold">
                            {(order as any).deliverySlot?.name || deliverySlots.find(s => Number(s.id) === Number(order.delivery_slot_id))?.name || "None"}
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

                        {/* Age */}
                        <td className="p-4">
                          <span className="text-xs text-gray-500 font-semibold block">
                            {timeSince(order.createdAt)}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                printOrderSlip(order);
                                bulkPrintOrdersApi([order.id]).then(success => {
                                  if (success) {
                                    setOrdersList(prev =>
                                      prev.map(o => o.id === order.id ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
                                    );
                                  }
                                });
                              }}
                              title="Print Order Slip"
                              className="p-1.5 rounded-lg text-orange-500 hover:text-orange-600 hover:bg-orange-55 border border-orange-500/20 cursor-pointer"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
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
                          <td colSpan={9} className="px-4 pb-4">
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
                                    <span className="text-xs mt-0.5 shrink-0">🕒</span>
                                    <div>
                                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Delivery Slot</p>
                                      <p className="text-xs font-bold text-gray-800 mt-0.5">
                                        {(order as any).deliverySlot?.name || deliverySlots.find(s => Number(s.id) === Number(order.delivery_slot_id))?.name || "None"}
                                      </p>
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
                                  {/* Print Slip Section */}
                                  <div className="pt-3 border-t border-orange-500/10 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                                        <span>🖨️</span> Order Slip Tracking
                                      </p>
                                      <p className="text-[10px] text-gray-500 font-semibold">
                                        Status: {order.is_printed ? (
                                          <span className="text-green-600 font-black">Printed</span>
                                        ) : (
                                          <span className="text-red-500 font-black">Unprinted</span>
                                        )}
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        printOrderSlip(order);
                                        bulkPrintOrdersApi([order.id]).then(success => {
                                          if (success) {
                                            setOrdersList(prev =>
                                              prev.map(o => o.id === order.id ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
                                            );
                                          }
                                        });
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-[10px] font-bold text-white rounded-lg shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer h-[32px]"
                                    >
                                      <Printer size={12} />
                                      Print Order Slip
                                    </button>
                                  </div>
                                  {/* FEATURE: Delivery Boy System — Assign Driver */}
                                 <div className="pt-3 border-t border-orange-500/10">
                                   {(order as any).delivery_boy_id ? (
                                     <>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 flex items-center gap-1">
                                         <span>🚚</span> Assigned Delivery Driver
                                       </p>
                                       <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                                         <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                         <p className="text-xs font-bold text-blue-700">
                                           Assigned to: {deliveryBoys.find(d => d.id === (order as any).delivery_boy_id)?.name || `Driver #${(order as any).delivery_boy_id}`}
                                         </p>
                                       </div>
                                     </>
                                   ) : (
                                     !['delivered', 'completed', 'cancelled'].includes(order.status) && (
                                       <>
                                         <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 flex items-center gap-1">
                                           <span>🚚</span> Assign Delivery Driver
                                         </p>
                                         <div className="flex items-center gap-2 max-w-sm relative">
                                           {/* Custom Dropdown Trigger */}
                                           <div className="relative flex-1">
                                             <button
                                               type="button"
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 setOpenDriverSelectId(openDriverSelectId === order.id ? null : order.id);
                                               }}
                                               className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 bg-white border border-orange-500/20 rounded-xl px-3 py-2.5 outline-none hover:border-orange-500/40 transition-all cursor-pointer text-left h-[38px]"
                                             >
                                               <span className="truncate">
                                                 {selectedDriverId[order.id]
                                                   ? deliveryBoys.find(d => d.id === selectedDriverId[order.id])?.name + ` (${deliveryBoys.find(d => d.id === selectedDriverId[order.id])?.activeOrderCount} active)`
                                                   : "Select Driver..."}
                                               </span>
                                               <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${openDriverSelectId === order.id ? "rotate-180 text-orange-500" : ""}`} />
                                             </button>

                                             {/* Custom Dropdown List */}
                                             {openDriverSelectId === order.id && (
                                               <>
                                                 {/* Invisible Fullscreen Backdrop to safely catch click-outside */}
                                                 <div
                                                   className="fixed inset-0 z-40 bg-transparent cursor-default"
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     setOpenDriverSelectId(null);
                                                   }}
                                                 />
                                                 <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto">
                                                   <button
                                                     type="button"
                                                     onClick={() => {
                                                       setSelectedDriverId(prev => ({ ...prev, [order.id]: 0 }));
                                                       setOpenDriverSelectId(null);
                                                     }}
                                                     className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                                                   >
                                                     Select Driver...
                                                   </button>
                                                   {deliveryBoys.map(d => (
                                                     <button
                                                       key={d.id}
                                                       type="button"
                                                       onClick={() => {
                                                         setSelectedDriverId(prev => ({ ...prev, [order.id]: d.id }));
                                                         setOpenDriverSelectId(null);
                                                       }}
                                                       className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                                                         selectedDriverId[order.id] === d.id
                                                           ? "text-orange-500 bg-orange-50/50 font-bold"
                                                           : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                                                       }`}
                                                     >
                                                       <span>👤 {d.name}</span>
                                                       <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${d.activeOrderCount > 0 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                                                         {d.activeOrderCount} active
                                                       </span>
                                                     </button>
                                                   ))}
                                                 </div>
                                               </>
                                             )}
                                           </div>

                                           <button
                                             disabled={!selectedDriverId[order.id] || assigningId === order.id}
                                             onClick={(e) => { e.stopPropagation(); handleAssignDriver(order.id); }}
                                             className="text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 disabled:opacity-50 px-4 py-2.5 rounded-xl cursor-pointer shadow-sm active:scale-[0.98] transition-all shrink-0 h-[38px] flex items-center justify-center"
                                           >
                                             {assigningId === order.id ? '...' : 'Assign'}
                                           </button>
                                         </div>
                                       </>
                                     )
                                   )}
                                 </div>
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

      {/* FEATURE: Delivery Attempt Management — Reopen Confirmation Modal */}
      {reopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setReopenModal(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-gray-900">Reopen Order #{reopenModal.orderNumber}?</h3>
            <p className="text-xs text-gray-500">This will move the order back to Processing so you can assign a driver again.</p>
            <input
              type="text"
              value={reopenNote}
              onChange={(e) => setReopenNote(e.target.value)}
              placeholder="Customer called back and confirmed order"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-green-400"
            />
            {reopenError && <p className="text-red-600 text-xs font-bold bg-red-50 border border-red-200 rounded-lg p-2">{reopenError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleReopenOrder}
                disabled={reopenLoading}
                className="flex-1 bg-green-600 text-white text-xs font-bold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {reopenLoading ? 'Reopening...' : 'Confirm Reopen'}
              </button>
              <button
                onClick={() => setReopenModal(null)}
                className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2.5 rounded-lg cursor-pointer hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Orders Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setIsExportModalOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl z-10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-orange-500/10 pb-2">
              <Download className="h-4.5 w-4.5 text-orange-500" />
              Export Orders System
            </h3>
            <form onSubmit={handleExportOrders} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">From Date</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">To Date</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Order Status</label>
                <select
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="assigned">Assigned</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Print Status</label>
                <select
                  value={exportPrintStatus}
                  onChange={(e) => setExportPrintStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 bg-white"
                >
                  <option value="all">All Orders</option>
                  <option value="printed">Printed Only</option>
                  <option value="unprinted">Unprinted Only</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 bg-white font-bold"
                >
                  <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                  <option value="csv">CSV Document (.csv)</option>
                </select>
              </div>

              {exportError && (
                <p className="text-red-600 text-xs font-bold bg-red-50 border border-red-200 rounded-xl p-2.5">
                  {exportError}
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t border-orange-500/10">
                <button
                  type="submit"
                  disabled={exporting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  {exporting ? 'Exporting...' : 'Start Export'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2.5 rounded-xl cursor-pointer hover:bg-gray-200 flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
