import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingCart, CheckCircle, Truck, XCircle, Clock, UserCheck,
  ChevronDown, Package, MapPin, Mail, Hash, AlertTriangle, RefreshCw, PhoneCall,
  Printer, Download
} from 'lucide-react';
import { useToast } from '@/app/context/ToastContext';
import { AdminOrder, updateOrderStatusApi, downloadOrdersExportApi, bulkPrintOrdersApi, reconcileCashPaymentApi } from '../../utils/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
  processing:       ['shipped', 'cancelled'],
  assigned:         ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  shipped:          ['delivered', 'cancelled'],
  delivered:        [],
  completed:        [],
  cancelled:        [],
  attempted:        ['processing', 'cancelled'],
  rescheduled:      ['delivered', 'cancelled'],
  failed:           ['processing', 'cancelled'],
};

interface DeliveryBoy {
  id: number;
  name: string;
  email: string;
  activeOrderCount: number;
}

export default function OrdersTab({ ordersList, setOrdersList }: OrdersTabProps) {
  const { toast } = useToast();
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
  const [openDateSelect, setOpenDateSelect] = useState(false);
  const [openPrintSelect, setOpenPrintSelect] = useState(false);
  const [openSlotSelect, setOpenSlotSelect] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStatus, setExportStatus] = useState('all');
  const [exportPrintStatus, setExportPrintStatus] = useState('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [openPrintMenuId, setOpenPrintMenuId] = useState<number | null>(null);
  const [isBulkPrintModalOpen, setIsBulkPrintModalOpen] = useState(false);

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
  const [dropdownDir, setDropdownDir] = useState<'bottom' | 'top'>('bottom');

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

  const [reconcilingId, setReconcilingId] = useState<number | null>(null);

  const handleReconcileCash = async (orderId: number) => {
    setReconcilingId(orderId);
    try {
      const success = await reconcileCashPaymentApi(orderId);
      if (success) {
        setOrdersList(prev =>
          prev.map(o => o.id === orderId ? { ...o, cash_reconciliation_status: 'reconciled' } : o)
        );
        toast.success("Cash payment reconciled and confirmed successfully.");
      } else {
        toast.error("Failed to reconcile cash payment.");
      }
    } catch {
      toast.error("An error occurred during cash reconciliation.");
    } finally {
      setReconcilingId(null);
    }
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

  const generateOrderSlipContent = (order: AdminOrder, type: 'packing' | 'invoice' | 'both') => {
    const formatQatarPhone = (phone: string | undefined | null) => {
      if (!phone) return 'N/A';
      const clean = phone.replace(/[\s\-\(\)\+]/g, '');
      if (clean.startsWith('974')) {
        return `+974 ${clean.substring(3)}`;
      }
      return `+974 ${clean}`;
    };

    const orderNumber = order.order_number || `ORD-${String(order.id).padStart(4, '0')}`;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const deliverySlotName = (order as any).deliverySlot?.name || deliverySlots.find(s => Number(s.id) === Number(order.delivery_slot_id))?.name || "None";

    const subtotal = (order.items || []).reduce((acc, item) => {
      const rawPrice = Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, ""));
      return acc + (isNaN(rawPrice) ? 0 : rawPrice) * item.quantity;
    }, 0);

    const generatePackingSlipHtml = () => `
      <div class="slip-container packing-slip">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
          <div>
            <img src="${window.location.origin}/images/logo-dark.png" alt="GRIVA" style="height: 30px; width: auto; object-fit: contain; display: block; margin-bottom: 4px;" />
            <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #666; display: block; margin-top: 2px; font-family: sans-serif;">Packing & Fulfillment Checklist</span>
          </div>
          <div style="text-align: right; font-family: sans-serif;">
            <div style="font-size: 12px; font-weight: bold; color: #333;">ORDER CHECKLIST</div>
            <div style="font-size: 10px; color: #777; margin-top: 2px;">Please verify items before packing</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 12px; border: 1px solid #eee; font-family: sans-serif;">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #777; font-weight: bold; margin-bottom: 5px;">Order Details</div>
            <div style="font-size: 13px; margin-bottom: 3px;"><strong style="color: #111;">Order Number:</strong> ${orderNumber}</div>
            <div style="font-size: 13px; margin-bottom: 3px;"><strong style="color: #111;">Order Date:</strong> ${orderDate}</div>
            <div style="font-size: 13px;"><strong style="color: #111;">Delivery Slot:</strong> <span style="background: #fff; padding: 2px 6px; border: 1px solid #ddd; border-radius: 4px; font-weight: bold; color: #f54900;">${deliverySlotName}</span></div>
          </div>
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #777; font-weight: bold; margin-bottom: 5px;">Deliver To</div>
            <div style="font-size: 13px; font-weight: bold; color: #111; margin-bottom: 3px;">${order.customer_name || 'N/A'}</div>
            <div style="font-size: 13px; margin-bottom: 3px;"><strong style="color: #111;">Phone:</strong> ${formatQatarPhone(order.customer_phone)}</div>
            <div style="font-size: 13px; margin-bottom: 3px;"><strong style="color: #111;">Email:</strong> ${order.user?.email || (order as any).customer_email || 'N/A'}</div>
            <div style="font-size: 13px;"><strong style="color: #111;">Address:</strong> ${order.shipping_address}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px; font-family: sans-serif;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #111; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 10px; text-align: center; width: 60px; border-top-left-radius: 6px; border-bottom-left-radius: 6px; border: 1px solid #eaeaea;">Packed</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #eaeaea;">Item Description</th>
                <th style="padding: 10px; text-align: center; width: 80px; border-top-right-radius: 6px; border-bottom-right-radius: 6px; border: 1px solid #eaeaea;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((item, idx) => {
                const title = item.product?.title || `Product #${item.product_id}`;
                let attrsDesc = "";
                if (item.selected_attributes && Object.keys(item.selected_attributes).length > 0) {
                  attrsDesc = Object.entries(item.selected_attributes).map(([k, v]) => `${k}: ${v}`).join(", ");
                } else {
                  const parts = [];
                  if (item.selected_color) parts.push(`Color: ${item.selected_color}`);
                  if (item.selected_storage) parts.push(`Storage: ${item.selected_storage}`);
                  attrsDesc = parts.join(", ");
                }
                const displayTitle = attrsDesc ? `${title} (${attrsDesc})` : title;
                return `
                  <tr style="border-bottom: 1px solid #eaeaea; font-size: 13px;">
                    <td style="padding: 12px; text-align: center; font-size: 18px; color: #bbb; font-weight: normal; border: 1px solid #eaeaea;">☐</td>
                    <td style="padding: 12px; font-weight: bold; color: #222; border: 1px solid #eaeaea;">${displayTitle}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 900; font-size: 14px; color: #111; background: #fcfcfc; border: 1px solid #eaeaea;">${item.quantity}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${order.delivery_notes ? `
          <div style="margin-bottom: 20px; border: 1px solid #f54900; background: #fffaf8; padding: 15px; border-radius: 12px; font-family: sans-serif;">
            <div style="font-size: 11px; text-transform: uppercase; color: #f54900; font-weight: 900; margin-bottom: 5px; letter-spacing: 0.5px;">⚠️ Customer Instructions / Delivery Notes</div>
            <div style="font-size: 13px; color: #333; font-weight: bold; line-height: 1.5;">${order.delivery_notes}</div>
          </div>
        ` : ''}

        <div style="border-top: 1px dashed #ccc; padding-top: 15px; text-align: center; color: #777; font-size: 11px; font-family: sans-serif;">
          <span>Thank you for shopping with Griva. Packing slip contains NO price info. Detailed invoice is packed inside.</span>
        </div>
      </div>
    `;

    const generateInvoiceHtml = () => `
      <div class="slip-container invoice-slip">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px; font-family: sans-serif;">
          <div>
            <img src="${window.location.origin}/images/logo-dark.png" alt="GRIVA" style="height: 35px; width: auto; object-fit: contain; display: block; margin-bottom: 4px;" />
            <span style="font-size: 10px; color: #999; display: block; margin-top: 1px;">State of Qatar | support@thegriva.com</span>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: #111; letter-spacing: 1px;">TAX INVOICE</h2>
            <div style="font-size: 12px; font-weight: bold; color: #444; margin-top: 5px;">Invoice No: GRV-INV-${order.id}</div>
            <div style="font-size: 11px; color: #777; margin-top: 2px;">Date: ${orderDate}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; font-family: sans-serif;">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; margin-bottom: 6px; letter-spacing: 0.5px;">Sold By</div>
            <div style="font-size: 13px; font-weight: bold; color: #111;">GRIVA</div>
            <div style="font-size: 12px; color: #555; line-height: 1.5; margin-top: 3px;">
              Commercial Registration: #129481A<br/>
              State of Qatar<br/>
              WhatsApp Support: ${formatQatarPhone('50921122')}
            </div>
          </div>
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; margin-bottom: 6px; letter-spacing: 0.5px;">Deliver To / Bill To</div>
            <div style="font-size: 13px; font-weight: bold; color: #111;">${order.customer_name || 'N/A'}</div>
            <div style="font-size: 12px; color: #555; line-height: 1.5; margin-top: 3px;">
              <strong>Phone:</strong> ${formatQatarPhone(order.customer_phone)}<br/>
              <strong>Email:</strong> ${order.user?.email || (order as any).customer_email || 'N/A'}<br/>
              <strong>Address:</strong> ${order.shipping_address}<br/>
              <strong>Delivery Slot:</strong> ${deliverySlotName}
            </div>
          </div>
        </div>

        <div style="background: #fdfdfd; border: 1px solid #eaeaea; border-radius: 12px; padding: 15px; margin-bottom: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-family: sans-serif;">
          <div>
            <span style="font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; display: block;">Payment Method</span>
            <span style="font-size: 13px; font-weight: bold; color: #111; display: block; margin-top: 2px;">${(order as any).delivery_payment_method || 'Cash on Delivery (COD)'}</span>
          </div>
          <div>
            <span style="font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; display: block;">Payment Status</span>
            <span style="font-size: 13px; font-weight: bold; color: ${order.status === 'delivered' || order.status === 'completed' ? '#16a34a' : '#ea580c'}; display: block; margin-top: 2px;">
              ${order.status === 'delivered' || order.status === 'completed' ? 'Paid' : 'Unpaid (COD)'}
            </span>
          </div>
        </div>

        <div style="margin-bottom: 25px; font-family: sans-serif;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd; font-size: 10px; text-transform: uppercase; color: #555; letter-spacing: 0.5px;">
                <th style="padding: 10px; text-align: left; width: 40px; border: 1px solid #eee;">S.No</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #eee;">Item Description</th>
                <th style="padding: 10px; text-align: center; width: 60px; border: 1px solid #eee;">Qty</th>
                <th style="padding: 10px; text-align: right; width: 100px; border: 1px solid #eee;">Unit Price</th>
                <th style="padding: 10px; text-align: right; width: 120px; border: 1px solid #eee;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((item, idx) => {
                const rawPrice = Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, ""));
                const unitPrice = isNaN(rawPrice) ? 0 : rawPrice;
                const totalItemPrice = unitPrice * item.quantity;
                const title = item.product?.title || `Product #${item.product_id}`;
                let attrsDesc = "";
                if (item.selected_attributes && Object.keys(item.selected_attributes).length > 0) {
                  attrsDesc = Object.entries(item.selected_attributes).map(([k, v]) => `${k}: ${v}`).join(", ");
                } else {
                  const parts = [];
                  if (item.selected_color) parts.push(`Color: ${item.selected_color}`);
                  if (item.selected_storage) parts.push(`Storage: ${item.selected_storage}`);
                  attrsDesc = parts.join(", ");
                }
                const displayTitle = attrsDesc ? `${title} (${attrsDesc})` : title;
                return `
                  <tr style="border-bottom: 1px solid #eaeaea; font-size: 13px; color: #333;">
                    <td style="padding: 12px 10px; color: #777; border: 1px solid #eee;">${idx + 1}</td>
                    <td style="padding: 12px 10px; font-weight: bold; color: #111; border: 1px solid #eee;">${displayTitle}</td>
                    <td style="padding: 12px 10px; text-align: center; border: 1px solid #eee;">${item.quantity}</td>
                    <td style="padding: 12px 10px; text-align: right; border: 1px solid #eee;">QAR ${unitPrice.toFixed(2)}</td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #111; border: 1px solid #eee;">QAR ${totalItemPrice.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 30px; font-family: sans-serif;">
          <div style="width: 250px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; color: #555;">
              <span>Subtotal:</span>
              <span>QAR ${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #555;">
              <span>Delivery Fee:</span>
              <span>QAR 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; border-top: 1px solid #ccc; padding-top: 8px; color: #111;">
              <span>Grand Total:</span>
              <span>QAR ${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style="border-top: 1px dashed #ccc; padding-top: 15px; text-align: center; color: #777; font-size: 11px; font-family: sans-serif;">
          <p style="margin: 0; font-weight: bold; color: #333;">Thank you for shopping with Griva!</p>
          <p style="margin: 3px 0 0 0;">This is a computer-generated tax invoice. No physical signature is required.</p>
        </div>
      </div>
    `;

    if (type === 'packing') {
      return generatePackingSlipHtml();
    } else if (type === 'invoice') {
      return generateInvoiceHtml();
    } else {
      return `
        ${generatePackingSlipHtml()}
        <div class="page-break"></div>
        ${generateInvoiceHtml()}
      `;
    }
  };

  const printOrderSlip = (order: AdminOrder, type: 'packing' | 'invoice' | 'both' = 'both') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.warning("Please allow popups in your browser to print orders.");
      return;
    }

    const orderNumber = order.order_number || `ORD-${String(order.id).padStart(4, '0')}`;
    const contentHtml = generateOrderSlipContent(order, type);

    const html = `
      <html>
        <head>
          <title>Print Order ${orderNumber}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              margin: 10px;
              color: #333;
              line-height: 1.4;
            }
            .slip-container {
              padding: 10px;
            }
            @media print {
              .page-break {
                page-break-after: always;
                break-after: page;
                clear: both;
                display: block;
                height: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
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

  const handlePrintNewOrders = async (type: 'packing' | 'invoice' | 'both' = 'both') => {
    const unprintedOrders = ordersList.filter(o => !(o as any).is_printed);
    if (unprintedOrders.length === 0) {
      setToastMsg('No new unprinted orders to print.');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.warning("Please allow popups in your browser to print orders.");
      return;
    }

    const slipsHtml = unprintedOrders.map((order, orderIdx) => {
      const content = generateOrderSlipContent(order, type);
      const isLast = orderIdx === unprintedOrders.length - 1;
      return `
        <div class="order-slip-wrapper">
          ${content}
          ${!isLast ? '<div class="page-break"></div>' : ''}
        </div>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <title>Print Bulk Orders</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              margin: 10px;
              color: #333;
              line-height: 1.4;
            }
            .order-slip-wrapper {
              padding: 10px;
            }
            @media print {
              .page-break {
                page-break-after: always;
                break-after: page;
                clear: both;
                display: block;
                height: 0;
              }
              body {
                margin: 0;
                padding: 0;
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
                  <div><span className="text-gray-400 font-semibold">Amount:</span> <span className="font-bold text-gray-800">QAR {parseFloat(String(order.total_price).replace(/([$]|qar|[\s,])/gi, "") || "0").toFixed(2)}</span></div>
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
                          const isCurrentlyOpen = openReassignSelectId === order.id;
                          if (!isCurrentlyOpen) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            if (spaceBelow < 220 && rect.top > 220) {
                              setDropdownDir('top');
                            } else {
                              setDropdownDir('bottom');
                            }
                          }
                          setOpenReassignSelectId(isCurrentlyOpen ? null : order.id);
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
                          <div className={`absolute left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in duration-150 max-h-48 overflow-y-auto min-w-[180px] ${
                            dropdownDir === 'top'
                              ? "bottom-full mb-1 slide-in-from-bottom-2"
                              : "top-full mt-1 slide-in-from-top-2"
                          }`}>
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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4.5 rounded-2xl border border-orange-500/30 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Order Operations</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Manage packing slips, batch printing, and flexible data exports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsBulkPrintModalOpen(true)}
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

      {/* Search and Dropdowns Filter Grid */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-orange-500/30 shadow-xs">
        {/* Unified Search Input */}
        <div className="flex-1 min-w-[250px] relative">
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
        <div className="relative z-[47]">
          <button
            type="button"
            onClick={() => {
              setOpenDateSelect(!openDateSelect);
              setOpenPrintSelect(false);
              setOpenSlotSelect(false);
            }}
            className="flex items-center justify-between gap-1.5 px-3 py-2.5 bg-gray-50 border border-orange-500/10 hover:border-orange-500/30 rounded-xl text-xs font-bold text-gray-750 cursor-pointer min-w-[140px] text-left"
          >
            <span>
              {filterDateRange === "all" && "📅 All Time"}
              {filterDateRange === "today" && "📅 Today"}
              {filterDateRange === "yesterday" && "📅 Yesterday"}
              {filterDateRange === "week" && "📅 Last 7 Days"}
            </span>
            <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${openDateSelect ? "rotate-180 text-orange-500" : ""}`} />
          </button>

          {openDateSelect && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setOpenDateSelect(false)} />
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 min-w-[140px]">
                <button
                  type="button"
                  onClick={() => { setFilterDateRange("all"); setOpenDateSelect(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterDateRange === "all" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  📅 All Time
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterDateRange("today"); setOpenDateSelect(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterDateRange === "today" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  📅 Today
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterDateRange("yesterday"); setOpenDateSelect(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterDateRange === "yesterday" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  📅 Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterDateRange("week"); setOpenDateSelect(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterDateRange === "week" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  📅 Last 7 Days
                </button>
              </div>
            </>
          )}
        </div>

        {/* Print Status Dropdown */}
        <div className="relative z-[46]">
          <button
            type="button"
            onClick={() => {
              setOpenPrintSelect(!openPrintSelect);
              setOpenDateSelect(false);
              setOpenSlotSelect(false);
            }}
            className="flex items-center justify-between gap-1.5 px-3 py-2.5 bg-gray-50 border border-orange-500/10 hover:border-orange-500/30 rounded-xl text-xs font-bold text-gray-750 cursor-pointer min-w-[160px] text-left"
          >
            <span>
              {filterPrintStatus === "all" && "🖨️ All Print Statuses"}
              {filterPrintStatus === "printed" && "🖨️ Printed Orders"}
              {filterPrintStatus === "unprinted" && "🖨️ Unprinted Orders"}
            </span>
            <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${openPrintSelect ? "rotate-180 text-orange-500" : ""}`} />
          </button>

          {openPrintSelect && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setOpenPrintSelect(false)} />
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => { setFilterPrintStatus("all"); setOpenPrintSelect(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterPrintStatus === "all" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  🖨️ All Print Statuses
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterPrintStatus("printed"); setOpenPrintSelect(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterPrintStatus === "printed" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  🖨️ Printed Orders
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterPrintStatus("unprinted"); setOpenPrintSelect(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterPrintStatus === "unprinted" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  🖨️ Unprinted Orders
                </button>
              </div>
            </>
          )}
        </div>

        {/* Delivery Slot Dropdown */}
        <div className="relative z-[45]">
          <button
            type="button"
            onClick={() => {
              setOpenSlotSelect(!openSlotSelect);
              setOpenDateSelect(false);
              setOpenPrintSelect(false);
            }}
            className="flex items-center justify-between gap-1.5 px-3 py-2.5 bg-gray-50 border border-orange-500/10 hover:border-orange-500/30 rounded-xl text-xs font-bold text-gray-750 cursor-pointer min-w-[170px] text-left"
          >
            <span>
              {filterSlot === "all"
                ? "🚚 All Delivery Slots"
                : `🚚 ` + (deliverySlots.find((s) => String(s.id) === filterSlot)?.name || "Delivery Slot")}
            </span>
            <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${openSlotSelect ? "rotate-180 text-orange-500" : ""}`} />
          </button>

          {openSlotSelect && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setOpenSlotSelect(false)} />
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto min-w-[170px]">
                <button
                  type="button"
                  onClick={() => { setFilterSlot("all"); setOpenSlotSelect(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterSlot === "all" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  All Delivery Slots
                </button>
                {deliverySlots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setFilterSlot(String(s.id)); setOpenSlotSelect(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold ${filterSlot === String(s.id) ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sleek Horizontal Status Tabs Strip */}
      <div className="flex items-center gap-1 bg-white border-b border-orange-500/20 px-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1 select-none">
        {/* All Tab */}
        <button
          onClick={() => setFilterStatus('all')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
            filterStatus === 'all'
              ? 'text-orange-500 border-orange-500 font-extrabold'
              : 'text-gray-500 border-transparent hover:text-gray-800'
          }`}
        >
          <span>All</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            filterStatus === 'all' ? 'bg-orange-500/10 text-orange-600 font-black' : 'bg-gray-100 text-gray-500'
          }`}>
            {counts['all']}
          </span>
        </button>

        {/* Dynamic status tabs */}
        {(['new', 'pending', 'processing', 'assigned', 'out_for_delivery', 'shipped', 'delivered', 'cancelled']).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const isActive = filterStatus === status;
          const label = status === 'new' ? 'New' : status.replace(/_/g, ' ');

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer capitalize ${
                isActive
                  ? 'text-orange-500 border-orange-500 font-extrabold'
                  : 'text-gray-500 border-transparent hover:text-gray-800'
              }`}
            >
              {cfg?.icon && (
                <span className="shrink-0">
                  {cfg.icon}
                </span>
              )}
              <span>{label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-orange-500/10 text-orange-600 font-black' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[status]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1250px]">
            <thead>
              <tr className="border-b border-orange-500/20 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 whitespace-nowrap">
                <th className="p-4 pl-5 sticky left-0 bg-gray-50 z-20 min-w-[210px]">Order</th>
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
                        className={`transition-colors cursor-pointer group whitespace-nowrap ${
                          order.status === 'pending' && !(order as any).reviewed_at
                            ? 'bg-[#fdf8ee] hover:bg-[#fbf1dc]'
                            : 'bg-white hover:bg-[#fff9f3]'
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
                        {/* Order ID (Sticky Left) */}

                        <td
                          className={`p-4 sticky left-0 z-10 transition-colors ${
                            order.status === 'pending' && !(order as any).reviewed_at
                              ? 'bg-[#fdf8ee] group-hover:bg-[#fbf1dc] border-l-4 border-l-amber-500 pl-4'
                              : 'bg-white group-hover:bg-[#fff9f3] pl-5'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-wrap min-w-[210px]">
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
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenPrintMenuId(openPrintMenuId === order.id ? null : order.id);
                                }}
                                title="Print Options"
                                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                  openPrintMenuId === order.id
                                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                    : "text-orange-500 hover:bg-orange-50 hover:text-orange-600 border-orange-500/20"
                                }`}
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>

                              {openPrintMenuId === order.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenPrintMenuId(null);
                                    }}
                                  />
                                  <div className="absolute right-0 mt-1 bg-white border border-gray-150 rounded-xl shadow-xl z-50 py-1.5 min-w-[170px] text-left animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">
                                      Select Print Format
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        printOrderSlip(order, 'packing');
                                        bulkPrintOrdersApi([order.id]).then(success => {
                                          if (success) {
                                            setOrdersList(prev =>
                                              prev.map(o => o.id === order.id ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
                                            );
                                          }
                                        });
                                        setOpenPrintMenuId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-55 hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                                    >
                                      📦 Packing Slip (No Price)
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        printOrderSlip(order, 'invoice');
                                        bulkPrintOrdersApi([order.id]).then(success => {
                                          if (success) {
                                            setOrdersList(prev =>
                                              prev.map(o => o.id === order.id ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
                                            );
                                          }
                                        });
                                        setOpenPrintMenuId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-55 hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                                    >
                                      📄 Tax Invoice (Detailed)
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        printOrderSlip(order, 'both');
                                        bulkPrintOrdersApi([order.id]).then(success => {
                                          if (success) {
                                            setOrdersList(prev =>
                                              prev.map(o => o.id === order.id ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
                                            );
                                          }
                                        });
                                        setOpenPrintMenuId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs font-black text-orange-650 hover:bg-orange-55 transition-colors flex items-center gap-1.5 border-t border-gray-100 mt-1 pt-2 cursor-pointer bg-transparent"
                                    >
                                      📑 Twin Pack (Both Slips)
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
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
                          <td colSpan={9} className="px-4 pb-4 whitespace-normal">
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
                                      {((item.selected_attributes && Object.keys(item.selected_attributes).length > 0) || item.selected_color || item.selected_storage) && (
                                        <div className="flex flex-wrap gap-1.5 mt-0.5 mb-1">
                                          {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 ? (
                                            Object.entries(item.selected_attributes).map(([k, v]) => (
                                              <span key={k} className="inline-block text-[8px] bg-orange-50/70 border border-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">
                                                {k}: {v}
                                              </span>
                                            ))
                                          ) : (
                                            <>
                                              {item.selected_color && (
                                                <span className="inline-block text-[8px] bg-orange-50/70 border border-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">
                                                  Color: {item.selected_color}
                                                </span>
                                              )}
                                              {item.selected_storage && (
                                                <span className="inline-block text-[8px] bg-orange-50/70 border border-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">
                                                  Storage: {item.selected_storage}
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      )}
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
                                  {(order as any).delivery_payment_method && (
                                    <div className="flex flex-col gap-3 pt-2 border-t border-orange-500/10">
                                      <div className="flex items-start gap-2.5">
                                        <span className="text-xs mt-0.5 shrink-0">💳</span>
                                        <div>
                                          <p className="text-[10px] text-gray-400 font-semibold uppercase">Payment Collected At Delivery</p>
                                          <p className="text-xs font-black text-green-700 mt-0.5">
                                            {(order as any).delivery_payment_method}
                                          </p>
                                        </div>
                                      </div>

                                      {(order as any).delivery_payment_method === "Cash" && (
                                        <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 space-y-2 mt-1">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Cash Reconciliation</span>
                                            {(order as any).cash_reconciliation_status === "reconciled" ? (
                                              <span className="text-[9px] font-black text-green-700 bg-green-50 border border-green-250 px-2.5 py-0.5 rounded-lg">
                                                Reconciled
                                              </span>
                                            ) : (
                                              <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-250 px-2.5 py-0.5 rounded-lg animate-pulse">
                                                Awaiting Submission
                                              </span>
                                            )}
                                          </div>
                                          {(order as any).cash_reconciliation_status !== "reconciled" && (
                                            <button
                                              onClick={() => handleReconcileCash(order.id)}
                                              disabled={reconcilingId === order.id}
                                              className="w-full text-center text-[10px] font-extrabold py-2 px-3 bg-gradient-to-r from-green-600 to-green-700 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white rounded-lg transition-all cursor-pointer shadow-sm"
                                            >
                                              {reconcilingId === order.id ? "Reconciling..." : "💵 Confirm Cash Received"}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
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
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          printOrderSlip(order, 'packing');
                                          bulkPrintOrdersApi([order.id]).then(success => {
                                            if (success) {
                                              setOrdersList(prev =>
                                                prev.map(o => o.id === order.id ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
                                              );
                                            }
                                          });
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-orange-500/20 hover:border-orange-500 text-orange-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer h-[32px]"
                                      >
                                        📦 Packing Slip
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          printOrderSlip(order, 'invoice');
                                          bulkPrintOrdersApi([order.id]).then(success => {
                                            if (success) {
                                              setOrdersList(prev =>
                                                prev.map(o => o.id === order.id ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
                                              );
                                            }
                                          });
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-orange-500/20 hover:border-orange-500 text-orange-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer h-[32px]"
                                      >
                                        📄 Tax Invoice
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          printOrderSlip(order, 'both');
                                          bulkPrintOrdersApi([order.id]).then(success => {
                                            if (success) {
                                              setOrdersList(prev =>
                                                prev.map(o => o.id === order.id ? { ...o, is_printed: true, printed_at: new Date().toISOString() } : o)
                                              );
                                            }
                                          });
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-[10px] font-black shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer h-[32px]"
                                      >
                                        📑 Twin Pack (Both)
                                      </button>
                                    </div>
                                  </div>

                                  {/* Mobile-Friendly Status Actions */}
                                  {nextStatuses.length > 0 && (
                                    <div className="pt-3 border-t border-orange-500/10">
                                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 flex items-center gap-1">
                                        <span>⚙️</span> Update Order Status
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {nextStatuses.map((nextStatus) => {
                                          const nextCfg = STATUS_CONFIG[nextStatus];
                                          return (
                                            <button
                                              key={nextStatus}
                                              disabled={updatingId === order.id}
                                              onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, nextStatus); }}
                                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${nextCfg.bg} ${nextCfg.color} hover:opacity-80`}
                                            >
                                              {updatingId === order.id ? (
                                                <span className="h-2.5 w-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                                              ) : nextCfg.icon}
                                              Mark {nextCfg.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

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
                                                 const isCurrentlyOpen = openDriverSelectId === order.id;
                                                 if (!isCurrentlyOpen) {
                                                   const rect = e.currentTarget.getBoundingClientRect();
                                                   const spaceBelow = window.innerHeight - rect.bottom;
                                                   if (spaceBelow < 220 && rect.top > 220) {
                                                     setDropdownDir('top');
                                                   } else {
                                                     setDropdownDir('bottom');
                                                   }
                                                 }
                                                 setOpenDriverSelectId(isCurrentlyOpen ? null : order.id);
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
                                                 <div className={`absolute left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in duration-150 max-h-48 overflow-y-auto ${
                                                    dropdownDir === 'top'
                                                      ? "bottom-full mb-1 slide-in-from-bottom-2"
                                                      : "top-full mt-1 slide-in-from-top-2"
                                                  }`}>
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

      {/* Bulk Print Selection Modal */}
      {isBulkPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setIsBulkPrintModalOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-1.5">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
                <Printer className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Batch Printing System
              </h3>
              <p className="text-[11px] text-gray-400 font-semibold">
                Select output format for {ordersList.filter(o => !(o as any).is_printed).length} new unprinted orders.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  handlePrintNewOrders('packing');
                  setIsBulkPrintModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/10 text-left font-bold text-xs text-gray-700 transition-all flex items-center justify-between cursor-pointer bg-white"
              >
                <span>📦 Packing Slips Only</span>
                <span className="text-[10px] font-normal text-gray-400">No prices</span>
              </button>
              <button
                onClick={() => {
                  handlePrintNewOrders('invoice');
                  setIsBulkPrintModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/10 text-left font-bold text-xs text-gray-700 transition-all flex items-center justify-between cursor-pointer bg-white"
              >
                <span>📄 Tax Invoices Only</span>
                <span className="text-[10px] font-normal text-gray-400">With prices & totals</span>
              </button>
              <button
                onClick={() => {
                  handlePrintNewOrders('both');
                  setIsBulkPrintModalOpen(false);
                }}
                className="w-full py-3.5 px-4 rounded-xl border border-orange-200 bg-orange-50/20 hover:bg-orange-50/40 text-left font-black text-xs text-orange-700 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>📑 Twin Packs (Slips + Invoices)</span>
                <span className="text-[10px] font-bold text-orange-500">2 pages per order</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsBulkPrintModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-50 border border-gray-250 text-xs font-bold rounded-xl text-gray-700 hover:bg-gray-100 transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
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
