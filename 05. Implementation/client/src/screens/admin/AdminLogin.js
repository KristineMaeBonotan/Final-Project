import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';
import { ADMIN_CREDENTIALS } from '../../config/auth';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, shadows, spacing, borderRadius } from '../../config/theme';

const { width, height } = Dimensions.get('window');

const AdminLogin = () => {
  const navigation = useNavigation();
  const { loginAdmin } = useAuth();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      // Validate inputs
      if (!adminId || !password) {
        setAlert({
          visible: true,
          type: 'error',
          message: 'Please fill in all fields'
        });
        return;
      }

      setIsLoading(true);

      // Check admin credentials
      if (adminId === ADMIN_CREDENTIALS.ADMIN_ID && password === ADMIN_CREDENTIALS.ADMIN_PASSWORD) {
        // Set admin as logged in
        loginAdmin();
        
        setAlert({
          visible: true,
          type: 'success',
          message: 'Login successful!'
        });

        // Clear form
        setAdminId('');
        setPassword('');

        // Navigate to Dashboard after showing success message
        setTimeout(() => {
          navigation.navigate('Dashboard');
        }, 1000);
      } else {
        setAlert({
          visible: true,
          type: 'error',
          message: 'Invalid admin credentials'
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        type: 'error',
        message: 'Login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.backgroundElements}>
          <View style={styles.backgroundMain} />
          <View style={styles.backgroundPattern1} />
          <View style={styles.backgroundPattern2} />
        </View>
        
        {alert.visible && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        )}
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Login</Text>
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.contentContainer}>
            <View style={styles.logoSection}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Please login with your admin credentials</Text>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Admin ID</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your admin ID"
                  value={adminId}
                  onChangeText={setAdminId}
                  keyboardType="default"
                  autoCapitalize="none"
                  enterKeyHint="next"
                  autoComplete="username"
                  spellCheck={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Password</Text>
                </View>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    enterKeyHint="done"
                    autoComplete="current-password"
                    spellCheck={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotPasswordLink}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.loginButtonText}>Login</Text>
                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.inverse} />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.securityNote}>
                <Ionicons name="lock-closed" size={16} color={colors.text.secondary} />
                <Text style={styles.securityText}>
                  Secure admin access only
                </Text>
              </View>
            </View>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Automated Attendance System
            </Text>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundMain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backgroundPattern1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backgroundPattern2: {
    position: 'absolute',
    top: 60,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? spacing.lg : spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // To offset the back button and center the title
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.inverse,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: spacing.md,
  },
  welcomeText: {
    ...typography.h2,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subtitleText: {
    ...typography.body2,
    color: colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  labelText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    ...typography.body1,
    color: colors.text.primary,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    ...typography.body1,
    color: colors.text.primary,
  },
  passwordToggle: {
    padding: spacing.md,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.secondary,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    ...shadows.small,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    ...typography.body1,
    color: colors.text.inverse,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  securityNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  securityText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  versionText: {
    ...typography.caption,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
});

export default AdminLogin;