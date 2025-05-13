import React, { useState, useEffect } from 'react';
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
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';
import { ADMIN_CREDENTIALS } from '../../config/auth';
import { useAuth } from '../../context/AuthContext';
import { API_URL, endpoints } from '../../config/api';
import { colors, typography, shadows, spacing, borderRadius } from '../../config/theme';

const { width, height } = Dimensions.get('window');

const Signup = ({ route }) => {
  const navigation = useNavigation();
  const { onCreateSuccess } = route.params || {};
  const { isAdminLoggedIn } = useAuth();
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if admin is not logged in
  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigation.replace('AdminLogin');
    }
  }, [isAdminLoggedIn]);

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError('');
      
      const endpoint = accountType === 'student' ? endpoints.studentCreate : endpoints.instructorCreate;
      const url = `${API_URL}${endpoint}`;
      
      console.log('Starting signup process...');
      console.log('API URL:', url);
      console.log('Account type:', accountType);
      
      const requestBody = {
        idNumber,
        fullName,
        password,
        ...(accountType === 'student' && { course: 'BSIT', year: '1', section: 'A' }),
        ...(accountType === 'instructor' && { department: 'IT' })
      };

      // Test server connectivity first
      try {
        console.log('Testing server connectivity...');
        const testResponse = await fetch(`${API_URL}/test`);
        if (!testResponse.ok) {
          throw new Error('Server connectivity test failed');
        }
        console.log('Server connectivity test passed');
      } catch (testError) {
        console.error('Server connectivity test failed:', testError);
        throw new Error('Cannot connect to server. Please check your network connection.');
      }

      console.log('Sending signup request...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-id': ADMIN_CREDENTIALS.ADMIN_ID,
          'admin-password': ADMIN_CREDENTIALS.ADMIN_PASSWORD
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        setAlert({
          visible: true,
          type: 'success',
          message: 'Account created successfully'
        });
        
        // Clear form
        setFullName('');
        setIdNumber('');
        setPassword('');
        
        // Call the onCreateSuccess callback if provided
        if (onCreateSuccess) {
          onCreateSuccess();
        }
        
        // Navigate back
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        const errorMessage = data?.message || 'Failed to create account';
        console.error('Server returned error:', errorMessage);
        setAlert({
          visible: true,
          type: 'error',
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Signup error:', {
        message: error.message,
        stack: error.stack
      });
      setAlert({
        visible: true,
        type: 'error',
        message: error.message || 'Failed to connect to server. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!fullName || !idNumber || !password) {
      setAlert({
        visible: true,
        type: 'error',
        message: 'Please fill in all fields'
      });
      return false;
    }
    return true;
  };

  return (
    <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.background} />
        
        {alert.visible && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        )}
        
        <ScrollView>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
            style={styles.content}
          >
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={28} color={colors.text.inverse} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Create Account</Text>
                <Text style={styles.headerSubtitle}>Add a new user to the system</Text>
              </View>
            </View>

            {/* Signup Form */}
            <View style={styles.formCard}>
              {/* Account Type Selection */}
              <View style={styles.optionButtonsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.optionButton,
                    accountType === 'student' && styles.optionButtonActive
                  ]}
                  onPress={() => setAccountType('student')}
                >
                  <Text style={[
                    styles.optionButtonText,
                    accountType === 'student' && styles.optionButtonTextActive
                  ]}>Student</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.optionButton,
                    accountType === 'instructor' && styles.optionButtonActive
                  ]}
                  onPress={() => setAccountType('instructor')}
                >
                  <Text style={[
                    styles.optionButtonText,
                    accountType === 'instructor' && styles.optionButtonTextActive
                  ]}>Instructor</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formSectionTitle}>User Information</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="id-card-outline" size={20} color={colors.text.secondary} />
                  <Text style={styles.inputLabel}>ID Number</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter ID number"
                  value={idNumber}
                  onChangeText={(text) => setIdNumber(text)}
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
                  <Ionicons name="person-outline" size={20} color={colors.text.secondary} />
                  <Text style={styles.inputLabel}>Full Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  value={fullName}
                  onChangeText={(text) => setFullName(text)}
                  keyboardType="default"
                  autoCapitalize="words"
                  enterKeyHint="next"
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
                    placeholder="Enter password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    enterKeyHint="done"
                    autoComplete="new-password"
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
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled
                ]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.text.inverse} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: width * 0.3,
    borderBottomRightRadius: width * 0.3,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.medium,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.inverse,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  logoContainer: {
    marginLeft: spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  formSectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  optionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    ...shadows.small,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    ...typography.body1,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  optionButtonTextActive: {
    color: colors.text.inverse,
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
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  submitButtonText: {
    ...typography.body1,
    color: colors.text.inverse,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
});

export default Signup; 