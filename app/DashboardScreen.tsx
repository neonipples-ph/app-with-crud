import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, Alert, StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
// import { RootStackParamList } from './App';
import { Avatar, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

type DashboardScreenProps = StackScreenProps<RootStackParamList, 'Dashboard'>;
export type RootStackParamList = {
  // Other routes
  Dashboard: { token: string }; // Add token to Dashboard route
  Login: undefined; // Add Login route
  UserProfile: undefined; // Add UserProfile route
  AddUser: { token: string; onUserAdded: () => Promise<void> }; // Add AddUser route
  EditUser: { user: User; onUserUpdated: () => Promise<void> }; // Add EditUser route
};

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  dateOfBirth?: string; // Changed from birthdate to dateOfBirth (to match API)
  age?: number | null; // ✅ Added age
  gender?: string;
  course?: string;
  joinedAt?: string; // ✅ Added joinedAt (from API)
  avatar?: string | any;
  token?: string; // ✅ Added token property
}


const API_URL = 'https://apinijno.vercel.app/api';

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

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation, route }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { token } = route.params || {};


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
        // 🔹 Assign a random avatar
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * avatars.length);
        } while (usedIndexes.includes(randomIndex) && usedIndexes.length < avatars.length);
  
        usedIndexes.push(randomIndex);
        if (usedIndexes.length >= avatars.length) usedIndexes = [];
  
        // ✅ Calculate age from dateOfBirth
        let age = null;
        if (user.dateOfBirth) {
          const birthDate = new Date(user.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
  
          // Adjust if the birthday hasn't occurred yet this year
          const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          if (today < birthdayThisYear) {
            age -= 1;
          }
        }
  
        return {
          ...user,
          avatar: user.avatar || avatars[randomIndex],
          age, // ✅ Attach calculated age
        };
      });
  
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };


  interface NewUser {
    fullName: string;
    email: string;
    username: string;
    dateOfBirth?: string;
    gender?: string;
    course?: string;
  }

  interface AddUserResponse {
    message?: string;
  }

  const addUser = async (newUser: NewUser): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Use token
        },
        body: JSON.stringify(newUser),
      });
  
      const data: AddUserResponse = await response.json();
      if (response.ok) {
        Alert.alert("Success", "User added successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "Failed to add user.");
      }
    } catch (error) {
      console.error("Add user error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };
  
  
  const getCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Get token from storage
      const userData = await AsyncStorage.getItem('user');
  
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUser({ ...parsedUser, token }); // ✅ Attach token to user
      } else {
        console.warn("No user data or token found.");
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
                  style={styles.deleteSwipe}
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

{/* ✅ Display Age (Now Dynamic) */}
{item.age !== null ? (
  <Text style={styles.infoText}>Age: {item.age}</Text>
) : (
  <Text style={styles.infoText}>Age: N/A</Text>
)}


  {/* ✅ Display Course */}
  {item.course ? (
    <Text style={styles.infoText}>Course: {item.course}</Text>
  ) : (
    <Text style={styles.infoText}>Course: N/A</Text>
  )}

  {/* ✅ Display Birthdate (Formatted) */}
  {item.dateOfBirth ? (
    <Text style={styles.infoText}>
      Birthdate: {new Date(item.dateOfBirth).toLocaleDateString('en-US')}
    </Text>
  ) : (
    <Text style={styles.infoText}>Birthdate: N/A</Text>
  )}

  {/* ✅ Display Gender (Capitalized) */}
  {item.gender ? (
    <Text style={styles.infoText}>
      Gender: {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
    </Text>
  ) : (
    <Text style={styles.infoText}>Gender: N/A</Text>
  )}
{/* ✅ Display Joined Date (Fix: Use joinedAt instead of createdAt) */}
{item.joinedAt ? (
  <Text style={styles.infoText}>
    Joined: {new Date(item.joinedAt).toLocaleDateString('en-US')}
  </Text>
) : (
  <Text style={styles.infoText}>Joined: N/A</Text>
)}


  {/* Edit Info Button */}
  <TouchableOpacity onPress={() => navigation.navigate('EditUser', { 
    user: { 
      ...item, 
      dateOfBirth: item.dateOfBirth ? String(item.dateOfBirth) : "" 
    }, 
    onUserUpdated: fetchUsers 
  })}>
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


<TouchableOpacity 
  style={styles.floatingButton} 
  onPress={() => {
    if (currentUser?.token) {
      navigation.navigate('AddUser', { 
        token: currentUser.token, 
        onUserAdded: fetchUsers 
      });
    } else {
      console.error('Token is undefined');
      Alert.alert('Error', 'User token is missing. Please log in again.');
    }
  }}
>
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
  deleteSwipe: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
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
  infoText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});

export default DashboardScreen;