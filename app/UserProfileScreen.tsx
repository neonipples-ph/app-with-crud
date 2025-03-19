import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar, Button, Card } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';

type UserProfileProps = StackScreenProps<RootStackParamList, 'UserProfile'>;

interface User {
  fullName: string;
  email: string;
  username: string;
  avatar?: string | any;

}

const UserProfileScreen: React.FC<UserProfileProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);
    useEffect(() => {
      if (currentUser) {
        navigation.setOptions({
          headerTitle: '',
          headerStyle: styles.header,
          headerRight: () => null,
        });
      }
    }, [currentUser]);

  // Hide the back button when this screen is displayed
  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => null });
  }, [navigation]);

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Login'); // This ensures the user can't go back
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />

      {/* Curved Header
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, {currentUser?.fullName || 'Guest'}!</Text>
      </View> */}

      {/* User Profile Card */}
      <Card style={styles.card}>
        <Card.Content style={styles.profileContainer}>
          {/* Avatar */}
          <Avatar.Icon size={80} icon="account-circle" />
          <Text style={styles.username}>@{currentUser?.username || 'Unknown'}</Text>
          <Text style={styles.fullName}>{currentUser?.fullName || 'Guest'}</Text>
          <Text style={styles.email}>{currentUser?.email || 'No email available'}</Text>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
        Logout
      </Button>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4CAF50',
    width: '100%',
    height: 100,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarIcon: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 3,
    marginTop: 20,
  },
  profileContainer: {
    alignItems: 'center',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  username: {
    fontSize: 16,
    color: '#999',
    marginTop: 5,
  },
  logoutButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: 'red',
  },
});

export default UserProfileScreen;
