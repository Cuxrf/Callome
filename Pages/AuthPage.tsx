import { useState } from 'react';
import { router } from 'expo-router';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { styles } from '../Styling/AuthStyles';
import { useProfile } from '../state/ProfileContext';
import { brand } from '../Styling/BrandColors';

type AuthMode = 'welcome' | 'signUp' | 'signIn';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [name, setDraftName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setName } = useProfile();
  const { height } = useWindowDimensions();
  const isWelcome = mode === 'welcome';

  const submit = () => {
    if (name.trim()) setName(name.trim());
    router.replace('/home');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../assets/Illustrations/klcc-community.webp')}
        resizeMode="cover"
        style={styles.background}
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={isWelcome ? ['rgba(8,9,21,0.10)', 'rgba(8,9,21,0.02)', '#0B0A10', '#0B0A10'] : ['rgba(8,9,21,0.35)', '#0B0A10', '#0B0A10']}
        locations={isWelcome ? [0, 0.39, 0.72, 1] : [0, 0.37, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {isWelcome ? (
        <View style={[styles.welcomeContent, { minHeight: height }]}>
          <View style={styles.bottomContent}>
            <Text style={styles.heroTitle}>Res-Central.</Text>
            <Text style={styles.description}>
              Parcels, mall parking, and everyday plans, all in one place. Spend less time sorting things out and more time living.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={() => setMode('signUp')}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Get started</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setMode('signIn')}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.formContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.formScroll, { minHeight: height }]}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable style={styles.backButton} onPress={() => setMode('welcome')} accessibilityRole="button">
              <Text style={styles.backText}>←  Back</Text>
            </Pressable>

            <View style={styles.formContent}>
              <Text style={styles.formTitle}>{mode === 'signUp' ? 'Come on in.' : 'Welcome back.'}</Text>
              <Text style={styles.formDescription}>
                {mode === 'signUp' ? 'A simpler day starts here.' : 'Pick up where your day left off.'}
              </Text>

              {mode === 'signUp' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What should we call you?"
                    placeholderTextColor="#8B8A97"
                    value={name}
                    onChangeText={setDraftName}
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                    selectionColor={brand.blue}
                  />
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#8B8A97"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  selectionColor={brand.blue}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#8B8A97"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                  textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
                  returnKeyType="done"
                  onSubmitEditing={submit}
                  selectionColor={brand.blue}
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.primaryButton, styles.formSubmit, pressed && styles.buttonPressed]}
                onPress={submit}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>{mode === 'signUp' ? 'Create account' : 'Sign in'}</Text>
              </Pressable>

              <Pressable
                style={styles.switchButton}
                onPress={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}
                accessibilityRole="button"
              >
                <Text style={styles.switchText}>
                  {mode === 'signUp' ? 'Already have an account? ' : 'New around here? '}
                  <Text style={styles.switchLink}>{mode === 'signUp' ? 'Sign in' : 'Get started'}</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
