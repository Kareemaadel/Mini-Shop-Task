import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAppTheme } from '../../../src/hooks/useAppTheme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const theme = useAppTheme();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const toggleTheme = () => {
    const nextMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(nextMode);
  };

  const getThemeIcon = () => {
    if (themeMode === 'light') return 'sun';
    if (themeMode === 'dark') return 'moon';
    return 'smartphone';
  };

  if (!user) return null;

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.card]}
      style={styles.container}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: theme.colors.white }]}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.colors.text }]}>{user.name}</Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user.email}</Text>
        
        <View style={[styles.roleBadge, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
          <Text style={[styles.roleText, { color: theme.colors.textSecondary }]}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={[styles.menuContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        
        {/* Theme Toggle */}
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]} onPress={toggleTheme}>
          <View style={styles.menuIcon}>
            <Feather name={getThemeIcon()} size={20} color={theme.colors.primary} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>
            Appearance: {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
          </Text>
          <Feather name="refresh-ccw" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.menuIcon}>
            <Feather name="settings" size={20} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Settings</Text>
          <Feather name="chevron-right" size={20} color={theme.colors.border} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.menuIcon}>
            <Feather name="help-circle" size={20} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Help & Support</Text>
          <Feather name="chevron-right" size={20} color={theme.colors.border} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]} 
          onPress={handleLogout}
        >
          <View style={[styles.menuIcon, styles.logoutIcon, { backgroundColor: theme.colors.error + '15' }]}>
            <Feather name="log-out" size={18} color={theme.colors.error} />
          </View>
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 40,
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
