import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { authService } from '../../src/services/auth';
import { theme } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>Password reset link sent to your email.</Text>
            <TouchableOpacity 
              style={[styles.button, { marginTop: theme.spacing.lg }]} 
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Return to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Send reset link</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!success && (
          <View style={styles.footer}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Return to Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySecondary,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#ECFDF5',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  successText: {
    color: theme.colors.success,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '500',
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerLink: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});
