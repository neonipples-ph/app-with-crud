import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, Alert, StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Avatar, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

type DashboardScreenProps = StackScreenProps<RootStackParamList, 'Dashboard'>;

export type RootStackParamList = {
  Dashboard: { token: string };
  Login: undefined;
  UserProfile: undefined;
  AddUser: { token: string; onUserAdded: () => Promise<void> };
  EditUser: { user: User; onUserUpdated: () => Promise<void> };
  RandomGroup: undefined; // Added RandomGroup route
};

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  dateOfBirth?: string;
  age?: number | null;
  gender?: string;
  course?: string;
  joinedAt?: string;
  avatar?: string | any;
  token?: string;
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
    getCurrentUser();
  }, []);

  // ✅ Re-fetch users when dashboard screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

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

        // ✅ Calculate age correctly
        let age = null;
        if (user.dateOfBirth) {
          const birthDate = new Date(user.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          if (today < birthdayThisYear) {
            age -= 1;
          }
        }

        return {
          ...user,
          avatar: user.avatar || avatars[randomIndex],
          age,
        };
      });

      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUser({ ...parsedUser, token });
      } else {
        console.warn('No user data or token found.');
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

const handleDeleteUser = async (userId: string) => {
    Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!currentUser?.token) {
              Alert.alert('Error', 'Authentication token is missing.');
              return;
            }

            const response = await fetch(`${API_URL}/users/${userId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${currentUser.token}`,
              },
            });

            if (!response.ok) throw new Error('Failed to delete user');

            setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete user.');
          }
        },
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

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
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (





            <Swipeable
              renderLeftActions={() => (
                <TouchableOpacity onPress={() => {
                  console.log('Editing user:', item);
                  const formattedDate = item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().split('T')[0] : '';
                  navigation.navigate('EditUser', { 
                    user: { ...item, dateOfBirth: formattedDate }, 
                    onUserUpdated: fetchUsers 
                  });
                }} style={styles.editSwipe}>
                  <MaterialIcons name="edit" size={30} color="white" />
                </TouchableOpacity>
              )}
              renderRightActions={() => (
                <TouchableOpacity onPress={() => handleDeleteUser(item._id)} style={styles.deleteSwipe}>
                  <MaterialIcons name="delete" size={30} color="white" />
                </TouchableOpacity>
              )}
            >
<Card.Content style={styles.profileCont}>
  {/* Absolute Positioned Header */}
  <View style={styles.profileHeader}>
    {/* Avatar + Username */}
    <Avatar.Image size={60} source={typeof item.avatar === 'string' ? { uri: item.avatar } : item.avatar} style={styles.avatar} />
    <Text style={styles.user_avatar}>@{item.username}</Text>

    {/* Full Name, Age, Gender */}
    <Text style={styles.fullname}>
      {item.fullName}
      {item.age ? `, ${item.age}` : ''}
      {item.gender ? ` (${item.gender.charAt(0).toUpperCase() + item.gender.slice(1)})` : ''}
    </Text>
  </View>

  {/* Center-aligned Information */}
  <View style={styles.centeredInfo}>
    <Text style={styles.email}>{item.email}</Text>
    <Text style={styles.infoText}>Course: {item.course ?? 'N/A'}</Text>
    <Text style={styles.infoText}>
      Birthdate: {item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString('en-US') : 'N/A'}
    </Text>
    <Text style={styles.infoText}>Joined: {item.joinedAt ? new Date(item.joinedAt).toLocaleDateString('en-US') : 'N/A'}</Text>
  </View>
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

<TouchableOpacity 
          style={styles.floatingButton} 
          onPress={() => navigation.navigate('RandomGroup')}>
          <MaterialIcons name="group" size={24} color="white" />
          <Text style={styles.floatingButtonText}>Random Group</Text>
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

container: { flex: 1, backgroundColor: '#f8f9fa',
},
    deleteSwipe: {
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      width: 70,
      height: '95%',
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
    },
    editSwipe: {
      backgroundColor: 'blue',
      justifyContent: 'center',
      alignItems: 'center',
      width: 70,
      height: '95%',
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
    },
  // profileCont: { padding: 15, backgroundColor: '#fff', borderRadius: 10, margin: 10 

  // },
  // avatar: { marginBottom: 10 

  // },
  // fullname: { fontSize: 16, fontWeight: 'bold' 

  // },
  email: { fontSize: 14, color: '#555' 

  },

  card: {
    marginBottom: 15, // Space between each card
    marginHorizontal: 10, // Adds spacing on the sides
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
  // email: {
  //   fontSize: 16,
  //   color: '#555',
  // },
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
  // deleteSwipe: {
  //   backgroundColor: 'red',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: 70,
  //   height: '95%',
  //   borderTopLeftRadius: 10, // Adjust the curve as needed
  //   borderBottomLeftRadius: 10, // Adjust the curve as needed
  // },
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
  profileCont: {
    position: 'relative',
    paddingTop: 80, // Ensures space for the absolute header
    elevation: 5, // Android shadow effect
    borderTopLeftRadius: 20, // More pronounced curve
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 10, // Slightly less curved for contrast
    borderBottomRightRadius: 10,
    backgroundColor: '#fff', // Ensure the background is visible
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4, // iOS shadow effect
    marginBottom: 15, // Space between each card
    marginHorizontal: 10, // Adds spacing on the sides

  },
  
  
  profileHeader: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  
  user_avatar: {
    position: 'absolute',
    top: 65,
    left: 10,
    fontSize: 14,
    color: 'gray',
  },
  
  fullname: {
    position: 'absolute',
    top: 15,
    left: 80,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  centeredInfo: {
    alignItems: 'center',
    marginTop: 50, // Adjust so content doesn't overlap the absolute header
  },
  
});

export default DashboardScreen;

function useRef(arg0: {}) {
  throw new Error('Function not implemented.');
}
