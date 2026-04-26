import { useEffect, useState } from 'react';
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import KPICard from '../components/KPICard';
import { ordersService, type Order } from '../services/orders';
import { productsService } from '../services/products';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [ordersToday, setOrdersToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, products] = await Promise.all([
          ordersService.getOrders({ limit: 100 }),
          productsService.getProducts(),
        ]);

        const allOrders: Order[] = ordersRes.orders || [];
        const today = new Date().toISOString().split('T')[0];

        const todayOrders = allOrders.filter(
          (o) => o.created_at?.split('T')[0] === today
        );

        setOrdersToday(todayOrders.length);
        setRevenueToday(
          todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        );
        setActiveProducts(
          products.filter((p) => p.is_active).length
        );
        setTotalOrders(ordersRes.total || allOrders.length);
      } catch {
        // silently handle — KPIs just show 0
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-main">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">Overview of your store performance</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Orders Today"
          value={ordersToday}
          icon={<ShoppingCartIcon className="h-6 w-6" />}
          color="blue"
          loading={loading}
        />
        <KPICard
          title="Revenue Today"
          value={`$${revenueToday.toFixed(2)}`}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          color="green"
          loading={loading}
        />
        <KPICard
          title="Active Products"
          value={activeProducts}
          icon={<CubeIcon className="h-6 w-6" />}
          color="amber"
          loading={loading}
        />
        <KPICard
          title="Total Orders"
          value={totalOrders}
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          color="purple"
          loading={loading}
        />
      </div>
    </div>
  );
}
