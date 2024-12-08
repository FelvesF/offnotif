import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { realtimedb } from './firebaseConfig'; // Ensure this is correctly configured
import { ref, onValue } from 'firebase/database';

const BACKGROUND_TASK_NAME = 'background-fetch-task'; // Task name for background fetch

// Shared cooldown tracker
let lastNotificationTime = 0;
const COOLDOWN_TIME = 10000; // 10 seconds cooldown

// Define the background fetch task
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    // Fetch data from Firebase Realtime Database
    const response = await fetch('https://firecloud-84d68-default-rtdb.firebaseio.com/value.json');
    const value = await response.json();
    console.log('Background fetch - Current value:', value);

    // Check cooldown and send notification
    if (value > 10 && Date.now() - lastNotificationTime > COOLDOWN_TIME) {
      lastNotificationTime = Date.now();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Number Alert!',
          body: `The database value is now ${value}, exceeding 10!`,
        },
        trigger: null, // Immediate notification
      });
      console.log('Background notification sent!');
    }

    return BackgroundFetch.Result.NewData; // Success
  } catch (error) {
    console.error('Error in background fetch task:', error);
    return BackgroundFetch.Result.Failed; // Failure
  }
});

// Main App Component
export default function App() {
  const [value, setValue] = useState(0);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Notification permissions status:', status);
      if (status !== 'granted') {
        alert('Permission for notifications was not granted.');
      }
    };

    if (Platform.OS !== 'web') {
      requestPermissions();
    }
  }, []);

  // Set up notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Foreground listener for database changes
  useEffect(() => {
    const valueRef = ref(realtimedb, 'value');
    const unsubscribe = onValue(valueRef, (snapshot) => {
      const newValue = snapshot.val() ?? 0;
      console.log('New value from Firebase:', newValue);
      setValue(newValue);

      // Check cooldown and send notification
      if (newValue > 10 && Date.now() - lastNotificationTime > COOLDOWN_TIME) {
        lastNotificationTime = Date.now();
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Number Alert!',
            body: `The database value is now ${newValue}, exceeding 10!`,
          },
          trigger: null, // Immediate notification
        });
        console.log('Foreground notification sent!');
      }
    });

    return () => unsubscribe();
  }, []);

  // Register the background fetch task
  useEffect(() => {
    const registerBackgroundTask = async () => {
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minimumInterval: 60, // Reduced interval for frequent testing (60 seconds)
          stopOnTerminate: false, // Keep running in background
          startOnBoot: true, // Start on device boot
        });
        console.log('Background fetch task registered successfully!');
      } catch (err) {
        console.error('Error registering background fetch task:', err);
      }
    };

    registerBackgroundTask();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.number}>Current Value: {value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  number: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
