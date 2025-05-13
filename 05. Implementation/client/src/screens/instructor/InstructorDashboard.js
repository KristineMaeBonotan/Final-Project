import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import InstructorTabBar from '../../components/InstructorTabBar';
import StatisticsChart from '../../components/StatisticsChart';
import TrendChart from '../../components/TrendChart';
import InstructorCourses from './InstructorCourses';
import QRCodeGenerator from './QRCode';
import { API_URL } from '../../config/api';
import { colors, typography, spacing, shadows, borderRadius } from '../../config/theme';

const { width } = Dimensions.get('window');

const InstructorDashboard = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchStatistics = async () => {
    try {
      // TODO: Replace with actual API calls for instructor statistics
      setStatistics({
        totalStudents: 150,
        totalCourses: 5,
        activeClasses: 3,
        attendanceRate: 85,
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

      // TODO: Replace with actual attendance data
      const mockAttendanceData = [75, 82, 88, 85, 90, 87, 85];

      // Format dates for labels
      const labels = last7Days.map(date => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
      });

      setTrendData({
        labels,
        datasets: [
          {
            data: mockAttendanceData,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatistics(), fetchTrendData()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    navigation.replace('RoleSelection');
  };

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'courses':
        return <InstructorCourses />;
      case 'qrcode':
        return <QRCodeGenerator />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    return (
      <ScrollView 
        style={styles.dashboardContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Main Dashboard</Text>
          </View>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="school-outline" size={60} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Class Overview</Text>
        
        <View style={styles.statsGrid}>
          <StatCard 
            icon="people-outline"
            title="Students"
            value={statistics.totalStudents.toString()}
            accentColor={colors.primary}
          />
          
          <StatCard 
            icon="book-outline"
            title="Courses"
            value={statistics.totalCourses.toString()}
            accentColor={colors.secondary}
            onPress={() => setActiveTab('courses')}
          />
          
          <StatCard 
            icon="today-outline"
            title="Active Classes"
            value={statistics.activeClasses.toString()}
            accentColor={colors.accent}
          />
          
          <StatCard 
            icon="stats-chart-outline"
            title="Attendance"
            value={`${statistics.attendanceRate}%`}
            accentColor={colors.warning}
          />
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Attendance Trends</Text>
          <TrendChart
            data={trendData}
            title="Attendance Rate (Last 7 Days)"
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsContainer}>
          <ActionButton 
            icon="qr-code-outline"
            title="Generate QR"
            onPress={() => setActiveTab('qrcode')}
          />
          
          <ActionButton 
            icon="people-outline"
            title="View Students"
            onPress={() => setActiveTab('courses')}
          />
          
          <ActionButton 
            icon="download-outline"
            title="Export Data"
            onPress={() => {}}
          />
        </View>
        
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        
        <View style={styles.activityCard}>
          <ActivityItem 
            icon="qr-code-outline"
            title="QR Code Generated"
            subtitle="Web Development - 10:30 AM"
            time="2 hours ago"
          />
          
          <ActivityItem 
            icon="person-outline"
            title="Student Checked In"
            subtitle="John Smith - Mobile Development"
            time="3 hours ago"
          />
          
          <ActivityItem 
            icon="analytics-outline"
            title="Attendance Report"
            subtitle="Database Management - 85% attendance"
            time="Yesterday"
          />
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
    );
  };

  const StatCard = ({ icon, title, value, accentColor, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, onPress ? styles.statCardTouchable : null]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statIcon, { backgroundColor: accentColor }]}>
        <Ionicons name={icon} size={24} color={colors.text.inverse} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const ActionButton = ({ icon, title, onPress }) => (
    <TouchableOpacity 
      style={styles.actionButton} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ icon, title, subtitle, time }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        <Ionicons name={icon} size={18} color={colors.text.inverse} />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Instructor Portal</Text>
          <Text style={styles.headerSubtitle}>Manage your classes</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <InstructorTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.medium,
  },
  headerLeft: {
    flex: 1,
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
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  dashboardContent: {
    flex: 1,
    padding: spacing.md,
  },
  welcomeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.small,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  welcomeIconContainer: {
    marginLeft: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    width: '48%',
    alignItems: 'center',
    ...shadows.small,
  },
  statCardTouchable: {
    transform: [{ scale: 1 }],
    transition: 'transform 0.2s',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  statTitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    ...shadows.small,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body1,
    color: colors.text.primary,
  },
  activitySubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.disabled,
  },
  spacer: {
    height: 100,
  },
});

export default InstructorDashboard; 