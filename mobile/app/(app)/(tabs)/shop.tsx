import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { productsService, Product } from '../../../src/services/products';
import { useDebounce } from '../../../src/hooks/useDebounce';
import { theme } from '../../../src/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.md * 3) / 2;

const CATEGORIES = [
  { id: '', name: 'All' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'food', name: 'Food' },
];

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const router = useRouter();

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError('');
    
    try {
      const data = await productsService.getProducts({
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
  };

  const renderSkeleton = () => (
    <View style={styles.cardSkeleton}>
      <View style={styles.imageSkeleton} />
      <View style={styles.textSkeleton} />
      <View style={[styles.textSkeleton, { width: '40%' }]} />
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(app)/product/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Feather name="image" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyState}>
        <Feather name="search" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => {
            setSearchQuery('');
            setSelectedCategory('');
          }}
        >
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
        
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  selectedCategory === item.id && styles.categoryPillActive
                ]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.categoryTextActive
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchProducts()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={loading ? [] : products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={loading ? (
          <View style={styles.skeletonContainer}>
            {Array.from({ length: 6 }).map((_, i) => (
              <React.Fragment key={`skeleton-${i}`}>
                {renderSkeleton()}
              </React.Fragment>
            ))}
          </View>
        ) : renderEmptyState()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: theme.colors.text,
  },
  categoriesContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: theme.colors.white,
  },
  list: {
    flex: 1,
  },
  productList: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: theme.spacing.sm,
  },
  productName: {
    ...theme.typography.body,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    height: 40, // fix height for 2 lines
  },
  productPrice: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  cardSkeleton: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  imageSkeleton: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.skeleton,
    borderRadius: theme.borderRadius.sm,
  },
  textSkeleton: {
    height: 16,
    backgroundColor: theme.colors.skeleton,
    borderRadius: theme.borderRadius.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.xxl * 2,
  },
  emptyTitle: {
    ...theme.typography.h2,
    marginTop: theme.spacing.lg,
  },
  emptySubtitle: {
    ...theme.typography.bodySecondary,
    marginTop: theme.spacing.xs,
  },
  resetButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.full,
  },
  resetButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  errorContainer: {
    padding: theme.spacing.md,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    flex: 1,
  },
  retryButton: {
    padding: theme.spacing.sm,
  },
  retryText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
