import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import { Avatar, Button, Card } from 'react-native-paper';

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
];

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      navigation.setOptions({
        headerTitle: `Welcome, ${currentUser.username}!`,
        headerStyle: styles.header,
        headerRight: () => (
          <Avatar.Icon
            icon="account-circle"
            onTouchEnd={() => navigation.navigate('UserProfile')}
          />
        ),
      });
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      let data: User[] = await response.json();
      data = data.map(user => ({
        ...user,
        avatar: user.avatar || avatars[Math.floor(Math.random() * avatars.length)],
      }));
      data.sort((a, b) => a.fullName.localeCompare(b.fullName));
      data.sort((a, b) => (b.createdAt && a.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0));
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
        <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
        {loading ? (
          <ActivityIndicator size="large" color="green" />
        ) : (

        <FlatList
          data={users}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content style={styles.profileContainer}>
                <Avatar.Image size={60} source={typeof item.avatar === 'string' ? { uri: item.avatar } : item.avatar} />
                <Text style={styles.fullName}>{item.fullName}</Text>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
                {item.createdAt && <Text style={styles.createdAt}>Joined: {new Date(item.createdAt).toLocaleDateString()}</Text>}
              </Card.Content>
              <Card.Actions style={styles.buttonContainer}>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('EditUser', { user: item, onUserUpdated: fetchUsers })}
                >
                  Edit
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => handleDeleteUser(item._id)} 
                  style={styles.deleteButton} 
                  labelStyle={styles.deleteButtonText}
                >
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4CAF50',
    height: 100,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  profileContainer: {
    alignItems: 'center',
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
  avatarIcon: {
    marginRight: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deleteButton: {
    borderColor: 'red',
    backgroundColor: 'red',
    color: 'white',
  },
  deleteButtonText: {
    color: 'white',
  },
});

export default DashboardScreen;
