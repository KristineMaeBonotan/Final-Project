import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    try {
      // Parse the QR code data
      const attendanceData = JSON.parse(data);
      
      // Here you can add your logic to handle the scanned data
      // For example, sending it to your backend
      Alert.alert(
        "QR Code Scanned",
        "Attendance recorded successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              // Navigate back or to a confirmation screen
              // navigation.navigate('StudentDashboard');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Invalid QR Code format. Please try again.",
        [
          {
            text: "OK",
            onPress: () => setScanned(false)
          }
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button 
          title="Request Permission Again" 
          onPress={() => BarCodeScanner.requestPermissionsAsync()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.scanner}
      />
      {scanned && (
        <Button 
          title="Tap to Scan Again" 
          onPress={() => setScanned(false)}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanner: {
    width: '100%',
    height: '80%',
  },
  button: {
    marginTop: 20,
  },
});

export default QRScanner; 