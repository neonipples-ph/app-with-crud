import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, Alert, StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import { Avatar, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

type DashboardScreenProps = StackScreenProps<RootStackParamList, 'Dashboard'>;

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  createdAt?: string;
  avatar?: string | any;
}

const API_URL = 'https://apikonatalagato.vercel.app/api';

const avatars = [
  require('../assets/images/avatar1.png'),
  require('../assets/images/avatar2.png'),
  require('../assets/images/avatar3.png'),
  require('../assets/images/avatar4.png'),
  require('../assets/images/avatar5.png'),
  require('../assets/images/avatar6.png'),
  require('../assets/images/avatar7.png'),
  require('../assets/images/avatar8.png'),
  require('../assets/images/avatar9.png'),
  require('../assets/images/avatar10.png'),
];

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    getCurrentUser();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      let data: User[] = await response.json();

      let usedIndexes: number[] = [];
      data = data.map(user => {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * avatars.length);
        } while (usedIndexes.includes(randomIndex) && usedIndexes.length < avatars.length);

        usedIndexes.push(randomIndex);
        if (usedIndexes.length >= avatars.length) usedIndexes = [];

        return {
          ...user,
          avatar: user.avatar || avatars[randomIndex],
        };
      });

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  

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

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to delete user');
              }

              setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
            } catch (error) {
              console.error('Error deleting user:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Invisible Header with Welcome Text */}
      <View style={{ height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
        <Text style={{ fontSize: 25, fontWeight: 'bold', color: 'green' }}>
          Welcome, @{currentUser ? currentUser.username : 'Guest'}!
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => (
                <TouchableOpacity
                  onPress={() => handleDeleteUser(item._id)}
                  style={{
                    backgroundColor: 'red',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: '100%',
                    borderRadius: 10,
                    marginLeft: 5,
                  }}
                >
                  <MaterialIcons name="delete" size={30} color="white" />
                </TouchableOpacity>
              )}
            >
             <Card.Content style={styles.profileContainer}>
  <Avatar.Image size={60} source={typeof item.avatar === 'string' ? { uri: item.avatar } : item.avatar} />
  <Text style={styles.username}>@{item.username}</Text>
  <Text style={styles.fullName}>{item.fullName}</Text>
  <Text style={styles.email}>{item.email}</Text>

  {/* Display Joined Date */}
  {item.createdAt && (
    <Text style={styles.createdAt}>
      Joined: {new Date(item.createdAt).toLocaleDateString('en-US')}
    </Text>
  )}

  {/* Edit Info Button */}
  <TouchableOpacity onPress={() => navigation.navigate('EditUser', { user: item, onUserUpdated: fetchUsers })}>
    <Text style={{ color: 'red', fontSize: 16, marginTop: 5 }}>Edit Info</Text>
  </TouchableOpacity>
</Card.Content>

            </Swipeable>
          )}
        />
      )}

      {/* Floating Buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('UserProfile')}>
          <MaterialIcons name="account-circle" size={24} color="white" />
          <Text style={styles.floatingButtonText}>My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Register')}>
          <MaterialIcons name="person-add" size={24} color="white" />
          <Text style={styles.floatingButtonText}>Add User</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingButton} onPress={() => AsyncStorage.removeItem('user').then(() => navigation.replace('Login'))}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.floatingButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
    card: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    width: '96%',
    alignSelf: 'center',

  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    width: '96%',
    alignSelf: 'center',


  },
  fullName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  username: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#555',
  },
  createdAt: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deleteButton: {
    borderColor: 'red',
    borderWidth: 1,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'darkgreen',
    padding: 5,
    borderRadius: 30,
    elevation: 5, // Shadow effect
  },
  floatingButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },  
});

export default DashboardScreen;
