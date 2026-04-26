import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { ordersService, Order } from '../../../src/services/orders';
import { useAppTheme } from '../../../src/hooks/useAppTheme';



export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useAppTheme();

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError('');
    
    try {
      const data = await ordersService.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'processing': return theme.colors.primaryLight;
      case 'shipped': return theme.colors.primary;
      case 'delivered': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const renderItem = ({ item, index }: { item: Order, index: number }) => (
    <Pressable 
      style={[styles.orderCard, { backgroundColor: theme.colors.card }]}
      onPress={() => router.push(`/(app)/order/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: theme.colors.text }]}>Order #{item.id.substring(0, 8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={[styles.orderContent, { backgroundColor: theme.colors.background }]}>
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.textSecondary }]}>Date</Text>
          <Text style={[styles.orderValue, { color: theme.colors.text }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.textSecondary }]}>Items</Text>
          <Text style={[styles.orderValue, { color: theme.colors.text }]}>{item.order_items?.length || 0} items</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.textSecondary }]}>Total</Text>
          <Text style={[styles.orderValue, styles.orderTotal, { color: theme.colors.primary }]}>${item.total_amount.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={[styles.viewDetailsText, { color: theme.colors.primary }]}>View Details</Text>
        <Feather name="chevron-right" size={18} color={theme.colors.primary} />
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.card }]}>
        <Feather name="package" size={64} color={theme.colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No orders yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>When you place an order, it will appear here.</Text>
      <TouchableOpacity 
        style={[styles.shopButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/(app)/(tabs)/shop')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.card]} style={styles.container}>
      {error && !loading && !refreshing ? (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={() => fetchOrders()}>
            <Text style={[styles.retryText, { color: theme.colors.error }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={loading ? [] : orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : renderEmptyState()}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  separator: {
    height: 16,
  },
  orderCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orderContent: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderLabel: {
    fontSize: 14,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderTotal: {
    fontWeight: '800',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 96,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  shopButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  errorContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontWeight: '600',
  },
  retryText: {
    fontWeight: '800',
  },
});
