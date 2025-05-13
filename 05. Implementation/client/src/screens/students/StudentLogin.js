import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import CustomAlert from '../../components/CustomAlert';
import { colors, typography, shadows, spacing, borderRadius } from '../../config/theme';

const StudentLogin = () => {
  const navigation = useNavigation();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error'
  });

  const showAlert = (title, message, type = 'error') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleLogin = async () => {
    if (!studentId.trim() || !password.trim()) {
      setError('Please enter both Student ID and Password');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/students/login`, {
        studentId: studentId.trim(),
        password: password.trim()
      });

      if (response.data.success) {
        // Store student data in AsyncStorage
        await AsyncStorage.multiSet([
          ['studentId', response.data.student.idNumber],
          ['studentName', response.data.student.fullName],
          ['userType', 'student']
        ]);

        // Show success message
        showAlert('Success', 'Login successful!', 'success');
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigation.replace('StudentDashboard', { 
            studentData: {
              idNumber: response.data.student.idNumber,
              fullName: response.data.student.fullName
            }
          });
        }, 1500);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
        {/* Enhanced background design */}
        <View style={styles.backgroundContainer}>
          <View style={styles.backgroundGradient} />
          <View style={styles.backgroundCircle1} />
          <View style={styles.backgroundCircle2} />
          <View style={styles.backgroundWave} />
        </View>
        
        {alertConfig.visible && (
          <CustomAlert
            type={alertConfig.type}
            message={alertConfig.message}
            onClose={hideAlert}
          />
        )}
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
          style={styles.content}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Back Button with improved styles */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
            </TouchableOpacity>
            
            {/* Logo and Title */}
            <View style={styles.headerContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Student Login</Text>
              <Text style={styles.subtitle}>Sign in to access your attendance portal</Text>
            </View>
            
            {/* Login Form Card with enhanced shadow */}
            <View style={styles.formCard}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="person-outline" size={20} color={colors.text.secondary} />
                  <Text style={styles.inputLabel}>Student ID</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChangeText={(text) => {
                    setError('');
                    setStudentId(text);
                  }}
                  keyboardType="default"
                  autoCapitalize="none"
                  enterKeyHint="next"
                  autoComplete="username"
                  spellCheck={false}
                  placeholderTextColor={colors.text.disabled}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />
                  <Text style={styles.inputLabel}>Password</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text) => {
                      setError('');
                      setPassword(text);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    enterKeyHint="done"
                    autoComplete="current-password"
                    spellCheck={false}
                    placeholderTextColor={colors.text.disabled}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
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
              
              {/* Enhanced login button with animation effect */}
              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
                ) : (
                  <View style={styles.loginButtonInner}>
                    <Text style={styles.loginButtonText}>Login</Text>
                    <Ionicons name="log-in-outline" size={20} color={colors.text.inverse} />
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Student support section */}
              <View style={styles.supportSection}>
                <Text style={styles.supportText}>Need help? Contact your instructor</Text>
              </View>
            </View>
            
            {/* Enhanced footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Automated Attendance System</Text>
              <View style={styles.versionContainer}>
                <Ionicons name="shield-checkmark-outline" size={12} color={colors.text.inverse} style={styles.versionIcon} />
                <Text style={styles.versionText}>v1.0.0</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: colors.primary,
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backgroundWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 70,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  subtitle: {
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorText: {
    ...typography.body2,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text.primary,
  },
  eyeIcon: {
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
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  loginButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  loginButtonInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    ...typography.body1,
    color: colors.text.inverse,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  supportSection: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  supportText: {
    ...typography.body2,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.body2,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionIcon: {
    marginRight: spacing.xs,
  },
  versionText: {
    ...typography.caption,
    color: colors.text.inverse,
    opacity: 0.6,
    marginTop: spacing.xs,
  },
});

export default StudentLogin; 