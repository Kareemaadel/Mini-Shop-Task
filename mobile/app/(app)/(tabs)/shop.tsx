import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, RefreshControl, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { productsService, Product } from '../../../src/services/products';
import { useDebounce } from '../../../src/hooks/useDebounce';
import { useAppTheme } from '../../../src/hooks/useAppTheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = [
  { id: '', name: 'All' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'food', name: 'Food' },
];



const ProductCard = ({ item, index, onPress, theme }: { item: Product, index: number, onPress: () => void, theme: any }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: theme.colors.card }
      ]}
    >
      <View style={[styles.imageContainer, { backgroundColor: theme.colors.background }]}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Feather name="image" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.productPrice, { color: theme.colors.primary }]}>${item.price.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
};

export default function ShopScreen() {
  const theme = useAppTheme();
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
    <View style={[styles.cardSkeleton, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.imageSkeleton, { backgroundColor: theme.colors.skeleton }]} />
      <View style={[styles.textSkeleton, { backgroundColor: theme.colors.skeleton }]} />
      <View style={[styles.textSkeleton, { width: '40%', backgroundColor: theme.colors.skeleton }]} />
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyState}>
        <Feather name="search" size={64} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No products found</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Try adjusting your search or filters</Text>
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: theme.colors.primary }]}
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
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.primary, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 }]}>
          <Feather name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholderTextColor={theme.colors.textSecondary}
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
            renderItem={({ item, index }) => {
              const isActive = selectedCategory === item.id;
              return (
                <Pressable
                  style={[
                    styles.categoryPill,
                    { 
                      backgroundColor: isActive ? theme.colors.primary : theme.colors.card,
                      borderColor: isActive ? theme.colors.primary : theme.colors.border
                    }
                  ]}
                  onPress={() => setSelectedCategory(item.id)}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: isActive ? theme.colors.white : theme.colors.textSecondary }
                  ]}>
                    {item.name}
                  </Text>
                </Pressable>
              )
            }}
          />
        </View>
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={() => fetchProducts()}>
            <Text style={[styles.retryText, { color: theme.colors.error }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.card]}
      style={styles.container}
    >
      <FlatList
        style={styles.list}
        data={loading ? [] : products}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ProductCard 
            item={item} 
            index={index} 
            theme={theme}
            onPress={() => router.push(`/(app)/product/${item.id}`)} 
          />
        )}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  categoriesContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  productList: {
    padding: 16,
    paddingBottom: 48,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
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
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    height: 40, 
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardSkeleton: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 12,
    gap: 8,
  },
  imageSkeleton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  textSkeleton: {
    height: 16,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  resetButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
  },
  resetButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontWeight: '500',
  },
  retryText: {
    fontWeight: '700',
  },
});
