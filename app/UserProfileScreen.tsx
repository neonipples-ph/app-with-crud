import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar, Button, Card, IconButton } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';

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

      <Text style={[styles.welcomeMessage, { color: 'green' }]}>
        Hello, {userData?.username || 'Guest'}!
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          {/* Avatar, Username, Full Name, Age, Gender */}
          <View style={styles.profileHeader}>
          <Avatar.Image 
  size={80} 
  source={userData?.avatar ? { uri: userData.avatar } : require('../assets/images/default-avatar.png')} 
/>
<View style={styles.userInfo}>
  <Text style={styles.fullName}>
    {userData?.fullName || 'Guest'}
    {userData?.dateOfBirth ? `, ${calculateAge(userData?.dateOfBirth)}` : ''}
  </Text>
  {userData?.gender && (
    <Text style={styles.gender}> | {userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)}</Text>
  )}
</View>

          </View>
          <Text style={styles.username}>@{userData?.username || 'Unknown'}</Text>

          {/* User Details */}
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
            <Text style={styles.infoText}>
              {userData?.joinedAt ? new Date(userData.joinedAt).toLocaleDateString('en-US') : 'N/A'}
            </Text>
          </View>
        </Card.Content>
      </Card>
      <View style={styles.logoutContainer}>

  <IconButton
    icon="power"
    size={30}
    iconColor="red"
    onPress={handleLogout}
    style={styles.logoutButton}
  />
</View>

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
    justifyContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 5,
    marginTop: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 10,
    
    
  },
  avatar: {
    marginRight: 10,
    position: 'absolute',
    top: -20,
    left: -20,
    zIndex: 1,

  },
  userInfo: {
    flexDirection: 'row', // Align age and gender inline
    alignItems: 'center', // Align vertically
    gap: 5, // Add spacing between text elements
  },
  gender: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  
  fullName: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  username: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 30,  // Adjust based on screen size
    alignSelf: 'center', // Centers it horizontally
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 5, // Shadow effect
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 50, // Circular button
    elevation: 5,
  },
  

});

export default UserProfileScreen;
