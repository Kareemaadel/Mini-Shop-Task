import { useEffect, useState, useCallback } from 'react';
import {
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ordersService, type Order, type OrdersResponse } from '../services/orders';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const LIMIT = 10;

export default function OrdersPage() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: { page: number; limit: number; status?: string } = {
        page,
        limit: LIMIT,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const result = await ordersService.getOrders(params);
      setData(result);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (filter: string) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const openOrderDetail = async (order: Order) => {
    setDetailLoading(true);
    setSelectedOrder(order);
    try {
      const full = await ordersService.getOrder(order.id);
      setSelectedOrder(full);
    } catch {
      toast.error('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setStatusUpdating(orderId);
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as Order['status'] } : null);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    } finally {
      setStatusUpdating(null);
    }
  };

  const orders = data?.orders || [];
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Track and manage customer orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-surface text-slate-600 border border-surface-border hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ClipboardDocumentListIcon className="h-16 w-16" />}
            title="No orders found"
            description={
              statusFilter !== 'all'
                ? `No ${statusFilter} orders found. Try changing the filter.`
                : 'No orders have been placed yet.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-slate-50">
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Order ID</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Customer</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Date</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Items</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Total</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                    onClick={() => openOrderDetail(order)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {order.profile?.name || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.order_items?.length || '—'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={statusUpdating === order.id}
                        className="rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-xs font-medium outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="capitalize">
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-surface-border px-6 py-4">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} · {data?.total} total orders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order meta */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Order ID</p>
                <p className="mt-1 font-mono text-sm text-slate-800">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Date</p>
                <p className="mt-1 text-sm text-slate-800">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Customer</p>
                <p className="mt-1 text-sm text-slate-800">
                  {selectedOrder.profile?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Order Items</h3>
              {detailLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                <div className="divide-y divide-surface-border rounded-lg border border-surface-border">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {item.product?.name || 'Unknown product'}
                          </p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No items available</p>
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-700">Total Amount</p>
              <p className="text-lg font-bold text-slate-900">
                ${selectedOrder.total_amount.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
