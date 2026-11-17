import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { registerAccount } from '@/services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  function register() {
    const emailAddress = email.trim();

    if (!name.trim() || !emailAddress || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all four fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      setError('Enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    if (!registerAccount(name, emailAddress, password)) {
      setError('An account already exists for this email address.');
      return;
    }

    router.dismissTo('/login');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.title}>Register</Text>
          <Text style={styles.prompt}>
            Already have an account? <Link href="/login" dismissTo style={styles.link}>Log in</Link>
          </Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            accessibilityLabel="Name"
            autoComplete="name"
            onChangeText={setName}
            style={styles.input}
            value={name}
          />

          <Text style={styles.label}>Email address</Text>
          <TextInput
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            style={styles.input}
            value={email}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            accessibilityLabel="Confirm password"
            autoCapitalize="none"
            autoComplete="off"
            onChangeText={setConfirmPassword}
            onSubmitEditing={register}
            returnKeyType="go"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
          />

          {error ? (
            <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={register}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFCFD' },
  keyboard: { flex: 1 },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center', paddingHorizontal: 26, paddingTop: 48, paddingBottom: 32 },
  title: { color: '#111011', fontSize: 36, fontWeight: '700' },
  prompt: { color: '#5C575D', fontSize: 15, marginTop: 12, marginBottom: 16 },
  link: { color: '#823CB0', fontWeight: '700' },
  label: { color: '#111011', fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: {
    minHeight: 50,
    borderWidth: 1.25,
    borderColor: '#C9C2CA',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111011',
  },
  error: { color: '#672D86', fontSize: 14, marginTop: 14 },
  button: { alignSelf: 'flex-end', backgroundColor: '#9350CC', borderRadius: 25, marginTop: 28, paddingHorizontal: 24, minHeight: 50, justifyContent: 'center' },
  pressed: { opacity: 0.8 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
