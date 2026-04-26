import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore, CartItem } from '../../../src/store/useCartStore';
import { ordersService } from '../../../src/services/orders';
import { useAppTheme } from '../../../src/hooks/useAppTheme';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, getCartTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useAppTheme();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));
      
      const order = await ordersService.createOrder(orderItems);
      clearCart();
      router.push({
        pathname: '/(app)/cart/confirmation',
        params: { orderId: order.id, total: order.total_amount },
      });
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Something went wrong while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: CartItem, index: number }) => (
    <View 
      style={[styles.cartItem, { backgroundColor: theme.colors.card }]}
    >
      <View style={[styles.itemImageContainer, { backgroundColor: theme.colors.background }]}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.imagePlaceholder]}>
            <Feather name="image" size={24} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.itemActions}>
          <View style={[styles.quantityContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.product_id, -1)}
            >
              <Feather name="minus" size={16} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: theme.colors.text }]}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.product_id, 1)}
            >
              <Feather name="plus" size={16} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeItem(item.product_id)}
          >
            <Feather name="trash-2" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const total = getCartTotal();

  if (items.length === 0) {
    return (
      <LinearGradient colors={[theme.colors.background, theme.colors.card]} style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.card }]}>
          <Feather name="shopping-cart" size={64} color={theme.colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Looks like you haven't added anything to your cart yet.</Text>
        <TouchableOpacity 
          style={[styles.shopButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(app)/(tabs)/shop')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.card]} style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product_id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>Free</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>${total.toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.checkoutButton, { backgroundColor: theme.colors.primary }, loading && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Feather name="arrow-right" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  itemImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  checkoutButton: {
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
});
