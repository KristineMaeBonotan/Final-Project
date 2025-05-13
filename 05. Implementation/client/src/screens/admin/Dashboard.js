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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TabBar from '../../components/TabBar';
import Header from '../../components/Header';
import StatisticsChart from '../../components/StatisticsChart';
import TrendChart from '../../components/TrendChart';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { ADMIN_CREDENTIALS } from '../../config/auth';
import { colors, typography, spacing, shadows, borderRadius } from '../../config/theme';
import Courses from './Courses';
import Users from './Users';

const Dashboard = () => {
  const navigation = useNavigation();
  const { loginAdmin, logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    students: 0,
    instructors: 0,
    courses: 0,
  });
  const [trendData, setTrendData] = useState({
    labels: [],
    datasets: [
      {
        data: [0], // Initialize with a single 0 to prevent empty data error
      },
    ],
  });

  useEffect(() => {
    loginAdmin();
    fetchStatistics();
    fetchTrendData();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch students count
      const studentsRes = await fetch(`${API_URL}/api/students`, {
        headers: {
          'Content-Type': 'application/json',
          'admin-id': ADMIN_CREDENTIALS.ADMIN_ID,
          'admin-password': ADMIN_CREDENTIALS.ADMIN_PASSWORD
        }
      });
      const students = await studentsRes.json();

      // Fetch instructors count
      const instructorsRes = await fetch(`${API_URL}/api/instructors`, {
        headers: {
          'Content-Type': 'application/json',
          'admin-id': ADMIN_CREDENTIALS.ADMIN_ID,
          'admin-password': ADMIN_CREDENTIALS.ADMIN_PASSWORD
        }
      });
      const instructors = await instructorsRes.json();

      // Fetch courses count
      const coursesRes = await fetch(`${API_URL}/api/courses`, {
        headers: {
          'Content-Type': 'application/json',
          'admin-id': ADMIN_CREDENTIALS.ADMIN_ID,
          'admin-password': ADMIN_CREDENTIALS.ADMIN_PASSWORD
        }
      });
      const courses = await coursesRes.json();

      setStatistics({
        students: Array.isArray(students) ? students.length : 0,
        instructors: Array.isArray(instructors) ? instructors.length : 0,
        courses: Array.isArray(courses) ? courses.length : 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchTrendData = async () => {
    try {
      // Fetch students with creation dates
      const studentsRes = await fetch(`${API_URL}/api/students`, {
        headers: {
          'Content-Type': 'application/json',
          'admin-id': ADMIN_CREDENTIALS.ADMIN_ID,
          'admin-password': ADMIN_CREDENTIALS.ADMIN_PASSWORD
        }
      });
      const students = await studentsRes.json();

      // Get last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();

      // Process data to get counts per day
      const counts = last7Days.map(date => {
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        return students.filter(student => {
          const createdAt = new Date(student.createdAt);
          return createdAt >= dayStart && createdAt <= dayEnd;
        }).length;
      });

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
            data: counts,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching trend data:', error);
      // Set default data in case of error
      setTrendData({
        labels: [''],
        datasets: [{ data: [0] }],
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatistics(), fetchTrendData()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigation.replace('RoleSelection');
  };

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleStatPress = (type) => {
    switch (type) {
      case 'students':
      case 'courses':
        setActiveTab(type === 'students' ? 'users' : 'courses');
        break;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return <Users onUpdate={fetchStatistics} />;
      case 'courses':
        return <Courses onUpdate={fetchStatistics} />;
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
            <Text style={styles.welcomeSubtitle}>Admin Dashboard</Text>
          </View>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="person-circle-outline" size={60} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        
        <View style={styles.statsGrid}>
          <StatCard 
            icon="people-outline"
            title="Students"
            value={statistics.students.toString()}
            accentColor={colors.primary}
            onPress={() => setActiveTab('users')}
          />
          
          <StatCard 
            icon="school-outline"
            title="Instructors"
            value={statistics.instructors.toString()}
            accentColor={colors.secondary}
            onPress={() => setActiveTab('users')}
          />
          
          <StatCard 
            icon="book-outline"
            title="Courses"
            value={statistics.courses.toString()}
            accentColor={colors.accent}
            onPress={() => setActiveTab('courses')}
          />
          
          <StatCard 
            icon="bar-chart-outline"
            title="Avg Students"
            value={`${((statistics.students / (statistics.courses || 1)) || 0).toFixed(1)}`}
            accentColor={colors.warning}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsContainer}>
          <ActionButton 
            icon="person-add-outline"
            title="Add User"
            onPress={() => navigation.navigate('Signup')}
          />
          
          <ActionButton 
            icon="add-circle-outline"
            title="Add Course"
            onPress={() => setActiveTab('courses')}
          />
          
          <ActionButton 
            icon="download-outline"
            title="Export Data"
            onPress={() => {}}
          />
        </View>
        
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.activityCard}>
          {/* This would be populated with actual activity data */}
          <ActivityItem 
            icon="person-add-outline"
            title="New student added"
            subtitle="BSIT student account created"
            time="10 mins ago"
          />
          
          <ActivityItem 
            icon="book-outline"
            title="New course created"
            subtitle="Web Development I"
            time="3 hours ago"
          />
          
          <ActivityItem 
            icon="school-outline"
            title="Instructor assigned"
            subtitle="Mr. Smith assigned to Computer Science"
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
    >
      <View style={[styles.statIcon, { backgroundColor: accentColor }]}>
        <Ionicons name={icon} size={24} color={colors.text.inverse} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const ActionButton = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
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
          <Text style={styles.headerTitle}>Attendance System</Text>
          <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
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

export default Dashboard; 