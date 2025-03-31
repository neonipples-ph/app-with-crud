import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://apinijno.vercel.app/api';

type UserProfileProps = StackScreenProps<RootStackParamList, 'UserProfile'>;

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  dateOfBirth?: string;
  gender?: string;
  course?: string;
  joinedAt?: string;
  avatar?: string;
}

const UserProfileScreen: React.FC<UserProfileProps> = ({ navigation }) => {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUserUsername();
  }, []);

  useEffect(() => {
    if (currentUsername) {
      fetchUserData(currentUsername);
    }
  }, [currentUsername]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => null });
  }, [navigation]);

  const getCurrentUserUsername = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUsername(parsedUser.username);
      }
    } catch (error) {
      console.error('Error getting username:', error);
    }
  };

  const fetchUserData = async (username: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${username}`);
      const data = await response.json();
      if (response.ok) {
        setUserData(data);
      } else {
        console.error('API Error:', data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.profileHeader}>
        <Image 
          style={styles.avatar} 
          source={userData?.avatar ? { uri: userData.avatar } : require('../assets/images/default-avatar.png')} 
        />
        <Text style={styles.fullName}>{userData?.fullName || 'Guest'}</Text>
        <Text style={styles.username}>@{userData?.username || 'Unknown'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Birthdate:</Text>
        <Text style={styles.infoText}>{formatDate(userData?.dateOfBirth)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Course:</Text>
        <Text style={styles.infoText}>{userData?.course || 'N/A'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Joined:</Text>
        <Text style={styles.infoText}>{userData?.joinedAt ? new Date(userData.joinedAt).toLocaleDateString('en-US') : 'N/A'}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="power" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'green',
  },
  username: {
    fontSize: 16,
    color: '#555',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  infoText: {
    fontSize: 16,
    color: '#222',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UserProfileScreen;