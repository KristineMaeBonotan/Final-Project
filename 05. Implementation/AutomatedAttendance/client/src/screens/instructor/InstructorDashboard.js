import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InstructorTabBar from '../../components/InstructorTabBar';
import Header from '../../components/Header';
import TrendChart from '../../components/TrendChart';
import InstructorCourses from './InstructorCourses';
import QRCodeGenerator from './QRCode';
import { API_URL, endpoints } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';

const { width } = Dimensions.get('window');

const InstructorDashboard = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    onConfirm: null
  });
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeClasses: 0,
    attendanceRate: 0,
  });
  const [trendData, setTrendData] = useState({
    labels: [],
    datasets: [
      {
        data: [0],
      },
    ],
  });

  useEffect(() => {
    fetchStatistics();
    fetchTrendData();
  }, []);

  const showAlert = (title, message, type = 'error', onConfirm = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const hideAlert = () => {
    const { onConfirm } = alertConfig;
    setAlertConfig(prev => ({ ...prev, visible: false }));
    
    // If there's a callback function, call it after closing the alert
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  const fetchStatistics = async () => {
    try {
      // We'll fetch real data from API instead of using sample data
      // Initially set all values to zero until real API integration
      setStatistics({
        totalStudents: 0,
        totalCourses: 0,
        activeClasses: 0,
        attendanceRate: 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchTrendData = async () => {
    try {
      // Get last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();

      // Format dates for labels
      const labels = last7Days.map(date => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
      });

      // Set empty data until real API integration
      setTrendData({
        labels,
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0], // Empty data points
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  const handleLogout = async () => {
    // Show confirmation dialog using CustomAlert
    showAlert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      "warning",
      async () => {
        try {
          setIsLoading(true);
          
          // Get instructor ID from AsyncStorage
          const instructorId = await AsyncStorage.getItem('instructorId');
          
          if (instructorId) {
            // Call logout API endpoint
            await fetch(`${API_URL}${endpoints.instructorLogout}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ instructorId }),
            });
          }

          // Clear AsyncStorage data
          const keysToRemove = ['instructorId', 'instructorName', 'userType'];
          await AsyncStorage.multiRemove(keysToRemove);
          
          // Clear authentication state
          logout();
          
          // Show success message with navigation callback
          showAlert('Success', 'Logged out successfully', 'success', () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          });
        } catch (error) {
          console.error('Logout error:', error);
          showAlert('Error', 'Failed to logout', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ScrollView style={styles.dashboardContent}>
            <View style={styles.chartSection}>
              <TrendChart
                data={trendData}
                title="Attendance Rate (Last 7 Days)"
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#165973' }]}>
                  <Ionicons name="people-outline" size={28} color="#fff" />
                  <Text style={styles.statValue}>{statistics.totalStudents}</Text>
                  <Text style={styles.statLabel}>Total Students</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#7FB3D1' }]}>
                  <Ionicons name="book-outline" size={28} color="#fff" />
                  <Text style={styles.statValue}>{statistics.totalCourses}</Text>
                  <Text style={styles.statLabel}>Total Courses</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#165973' }]}>
                  <Ionicons name="school-outline" size={28} color="#fff" />
                  <Text style={styles.statValue}>{statistics.activeClasses}</Text>
                  <Text style={styles.statLabel}>Active Classes</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#7FB3D1' }]}>
                  <Ionicons name="stats-chart" size={28} color="#fff" />
                  <Text style={styles.statValue}>{statistics.attendanceRate}%</Text>
                  <Text style={styles.statLabel}>Attendance Rate</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );
      case 'courses':
        return <InstructorCourses />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Instructor Dashboard"
        showLogout
        onLogout={handleLogout}
      />
      
      <View style={styles.content}>
        {renderContent()}
      </View>

      <InstructorTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
        showConfirmButton={alertConfig.type === 'warning'}
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  dashboardContent: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartSection: {
    alignItems: 'flex-end',
    paddingRight: 0,
    marginBottom: 20,
    marginRight: -2,
  },
  statsContainer: {
    padding: 16,
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
});

export default InstructorDashboard; 