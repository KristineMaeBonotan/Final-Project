import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import CustomAlert from '../../components/CustomAlert';

const StudentDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const studentData = route.params?.studentData || {};
  const [isLoading, setIsLoading] = useState(false);
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

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_URL}/api/students/logout`, {
        studentId: studentData.idNumber
      });

      if (response.data.success) {
        // Clear AsyncStorage
        await AsyncStorage.multiRemove(['studentId', 'studentName', 'userType']);
        
        showAlert('Success', 'Logged out successfully', 'success');
        setTimeout(() => {
          navigation.replace('StudentLogin');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Logout failed');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Hi,</Text>
          <Text style={styles.studentName}>{studentData.fullName || 'Student'}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.logoutButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#165973" size="small" />
          ) : (
            <Ionicons name="log-out-outline" size={24} color="#165973" />
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    color: '#666',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#165973',
  },
  logoutButton: {
    padding: 8,
  },
});

export default StudentDashboard; 