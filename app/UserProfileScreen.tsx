import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar, Button, Card } from 'react-native-paper';
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
  age?: number;
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

  // Fetch the logged-in user's username from AsyncStorage
  const getCurrentUserUsername = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log("🔹 Stored User Data:", userData); // Debug log

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUsername(parsedUser.username);
      }
    } catch (error) {
      console.error('❌ Error getting username:', error);
    }
  };


  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'; // Handle null/undefined dates
  
    const cleanText = dateString.split('T')[0]; // Extract YYYY-MM-DD
    const date = new Date(cleanText);
  
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }); // Format as "March 24, 2025"
  };

  // Fetch user data using the username
  const fetchUserData = async (username: string) => {
    try {
      console.log(`Fetching user: ${API_URL}/users/${username}`);
  
      const response = await fetch(`${API_URL}/users/${username}`);
  
      // Log raw response before parsing
      const textResponse = await response.text();
      console.log("Raw API Response:", textResponse);
  
      // Try parsing the JSON
      const data = JSON.parse(textResponse);
  
      if (response.ok) {
        setUserData(data);
      } else {
        console.error('❌ API Error:', data.message);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.error('❌ Error during logout:', error);
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
        <Card.Content style={styles.profileContainer}>
          <Avatar.Text size={80} label={userData?.username?.substring(0, 2).toUpperCase() || "??"} />

          <Text style={styles.username}>@{userData?.username || 'Unknown'}</Text>
          <Text style={styles.fullName}>{userData?.fullName || 'Guest'}</Text>
          <Text style={styles.email}>{userData?.email || 'No email available'}</Text>

          {/* Display Birthdate Properly */}
          {/* <View style={styles.infoContainer}>
  <Text style={styles.infoText}>
    Birthdate: {formatDate(userData?.dateOfBirth)} (Not Editable)
  </Text>
</View> */}


          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Age:</Text>
            {userData?.age ? (
              <Text style={styles.infoText}>{userData.age} (Not Editable)</Text>
            ) : (
              <Text style={styles.infoText}>N/A</Text>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoText}>{userData?.gender || 'N/A'}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Course:</Text>
            <Text style={styles.infoText}>{userData?.course || 'N/A'}</Text>
          </View>

          <View style={styles.infoContainer}>
            {userData?.joinedAt ? (
              <Text style={styles.infoText}>
                Joined: {new Date(userData.joinedAt).toLocaleDateString('en-US')}
              </Text>
            ) : (
              <Text style={styles.infoText}>Joined: N/A</Text>
            )}
          </View>
        </Card.Content>
      </Card>

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
    width: '90%',
    backgroundColor: 'red',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
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
});

export default UserProfileScreen;
