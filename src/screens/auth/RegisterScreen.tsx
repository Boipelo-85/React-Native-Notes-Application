import { Link } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const submitting = useRef(false);
  const emailInput = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);
  const confirmInput = useRef<ComponentRef<typeof TextInput>>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  async function register() {
    if (submitting.current) return;
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

    submitting.current = true;
    setBusy(true);
    setError('');
    Keyboard.dismiss();
    try {
      const result = await signUp(name, emailAddress, password);
      if (result === 'duplicate') {
        setError('An account already exists for this email address.');
      } else if (result === 'created') {
        setError('Your account was created. Tap Log in to sign in.');
      }
    } catch {
      setError('Could not create your account. Please try again.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.title}>Register</Text>
          <Text style={styles.prompt}>
            Already have an account? {busy
              ? <Text style={styles.link}>Log in</Text>
              : <Link href="/login" dismissTo style={styles.link}>Log in</Link>}
          </Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            accessibilityLabel="Name"
            autoComplete="name"
            editable={!busy}
            onChangeText={setName}
            onSubmitEditing={() => emailInput.current?.focus()}
            returnKeyType="next"
            submitBehavior="submit"
            style={styles.input}
            value={name}
          />

          <Text style={styles.label}>Email address</Text>
          <TextInput
            ref={emailInput}
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!busy}
            keyboardType="email-address"
            onChangeText={setEmail}
            onSubmitEditing={() => passwordInput.current?.focus()}
            returnKeyType="next"
            submitBehavior="submit"
            style={styles.input}
            value={email}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            ref={passwordInput}
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!busy}
            onChangeText={setPassword}
            onSubmitEditing={() => confirmInput.current?.focus()}
            returnKeyType="next"
            submitBehavior="submit"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            ref={confirmInput}
            accessibilityLabel="Confirm password"
            autoCapitalize="none"
            autoComplete="off"
            editable={!busy}
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
            accessibilityState={{ busy, disabled: busy }}
            disabled={busy}
            onPress={register}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            {busy && <ActivityIndicator color={appColors.surface} />}
            <Text style={styles.buttonText}>{busy ? 'Creating account…' : 'Register'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: appColors.background },
  keyboard: { flex: 1 },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center', paddingHorizontal: 26, paddingTop: 48, paddingBottom: 32 },
  title: { color: appColors.text, fontSize: 36, fontWeight: '700' },
  prompt: { color: appColors.muted, fontSize: 15, marginTop: 12, marginBottom: 16 },
  link: { color: appColors.accent, fontWeight: '700' },
  label: { color: appColors.text, fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: {
    minHeight: 50,
    borderWidth: 1.25,
    borderColor: appColors.border,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: appColors.text,
  },
  error: { color: appColors.text, fontSize: 14, marginTop: 14 },
  button: { alignSelf: 'flex-end', alignItems: 'center', flexDirection: 'row', gap: 8, backgroundColor: appColors.primary, borderRadius: 25, marginTop: 28, paddingHorizontal: 24, minHeight: 50, justifyContent: 'center' },
  pressed: { opacity: 0.8 },
  buttonText: { color: appColors.surface, fontSize: 15, fontWeight: '700' },
});
