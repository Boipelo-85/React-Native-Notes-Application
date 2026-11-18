import { useRouter } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { appColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const contentWidth = Math.min(width - insets.left - insets.right, 420);
  const circleSize = contentWidth * 1.15;

  async function submit() {
    if (submitting.current) return;
    if (!username.trim()) {
      setMessage('Enter your email address.');
      return;
    }
    if (!password) {
      setMessage('Enter your password.');
      passwordInput.current?.focus();
      return;
    }
    submitting.current = true;
    setBusy(true);
    setMessage('');
    try {
      if (!(await signIn(username, password))) {
        setMessage('Incorrect email address or password.');
      }
    } catch {
      setMessage('Could not sign in. Please try again.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View
        pointerEvents="none"
        style={[
          styles.circle,
          { width: circleSize, height: circleSize, left: -circleSize * 0.31, top: -circleSize * 0.07 },
        ]}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: Math.max(32, height * 0.37 - insets.top),
                paddingHorizontal: contentWidth * 0.1,
              },
            ]}>
            <Text accessibilityRole="header" style={styles.title}>{busy ? 'Signing in…' : 'Login'}</Text>
            <View style={styles.signUpRow}>
              <Text style={styles.prompt}>Don’t have an account?</Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                disabled={busy}
                onPress={() => router.push('/register')}>
                <Text style={styles.link}>sign up</Text>
              </Pressable>
            </View>

            <View style={styles.fields}>
              <View style={styles.field}>
                <TextInput
                  accessibilityLabel="Email address"
                  autoCapitalize="none"
                  autoComplete="username"
                  keyboardType="email-address"
                  autoCorrect={false}
                  placeholder="Email address"
                  placeholderTextColor={appColors.muted}
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordInput.current?.focus()}
                  onChangeText={(value) => {
                    setUsername(value);
                    setMessage('');
                  }}
                  style={styles.input}
                  value={username}
                />
              </View>

              <View style={styles.field}>
                <View accessible={false} style={styles.lock}>
                  <View style={styles.lockShackle} />
                  <View style={styles.lockBody} />
                </View>
                <TextInput
                  ref={passwordInput}
                  accessibilityLabel="Password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  placeholder="Password"
                  placeholderTextColor={appColors.muted}
                  returnKeyType="go"
                  secureTextEntry
                  onSubmitEditing={submit}
                  onChangeText={(value) => {
                    setPassword(value);
                    setMessage('');
                  }}
                  style={styles.input}
                  value={password}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                  hitSlop={8}
                  onPress={() => setMessage('Password reset is currently unavailable.')}>
                  <Text style={styles.forgot}>FORGOT</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.actions}>
              {message ? (
                <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.message}>
                  {message}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={submit}
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
                <Text style={styles.loginLabel}>Login</Text>
                <View accessible={false} style={styles.loginIcon}>
                  <View style={styles.door} />
                  <Text style={styles.arrow}>{'\u2192'}</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: appColors.background, overflow: 'hidden' },
  safeArea: { flex: 1 },
  circle: {
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: appColors.soft,
  },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center', paddingBottom: 32 },
  title: { color: appColors.text, fontSize: 34, fontWeight: '700' },
  signUpRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 16 },
  prompt: { color: appColors.muted, fontSize: 15 },
  link: { color: appColors.accent, fontSize: 15, fontWeight: '700' },
  fields: { gap: 16, marginTop: 44, marginRight: 10 },
  field: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1.25,
    borderColor: appColors.border,
    borderRadius: 25,
    backgroundColor: appColors.background,
  },
  input: { flex: 1, minWidth: 0, minHeight: 48, color: appColors.text, fontSize: 15, paddingVertical: 10 },
  forgot: { color: appColors.accent, fontSize: 11, fontWeight: '800' },
  lock: { alignItems: 'center', width: 14 },
  lockShackle: { width: 8, height: 6, borderWidth: 1.4, borderBottomWidth: 0, borderColor: appColors.muted, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  lockBody: { width: 13, height: 10, borderWidth: 1.4, borderColor: appColors.muted, borderRadius: 3 },
  actions: { alignItems: 'flex-end', marginTop: 80, marginRight: -20, gap: 12 },
  message: { color: appColors.accent, fontSize: 14, textAlign: 'right' },
  loginButton: {
    minHeight: 50,
    minWidth: 120,
    paddingHorizontal: 22,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: appColors.primary,
  },
  pressed: { opacity: 0.8 },
  loginLabel: { color: appColors.surface, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  loginIcon: { width: 20, height: 22, justifyContent: 'center' },
  door: { position: 'absolute', right: 0, width: 14, height: 20, borderWidth: 2, borderRadius: 3, borderColor: appColors.surface },
  arrow: { color: appColors.surface, fontSize: 19, fontWeight: '700', lineHeight: 22 },
});
