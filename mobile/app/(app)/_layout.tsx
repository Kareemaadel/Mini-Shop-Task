import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="product/[id]" 
        options={{ 
          headerShown: true, 
          headerTitle: 'Product Details',
          headerBackVisible: true,
        }} 
      />
      <Stack.Screen 
        name="order/[id]" 
        options={{ 
          headerShown: true, 
          headerTitle: 'Order Details',
          headerBackVisible: true,
        }} 
      />
      <Stack.Screen 
        name="cart/confirmation" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}
