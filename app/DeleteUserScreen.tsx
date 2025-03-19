import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';

type DeleteUserScreenProps = StackScreenProps<RootStackParamList, 'DeleteUser'>;

const API_URL = 'https://apikonatalagato.vercel.app/api'; // Replace with your actual API URL

const DeleteUserScreen: React.FC<DeleteUserScreenProps> = ({ route, navigation }) => {
  const { user } = route.params;
  const [loading, setLoading] = useState(false);

  const handleDeleteUser = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'User deleted successfully');
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', data.message || 'Deletion failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Are you sure you want to delete this user?</Text>
      <Text>Email: {user.email}</Text>
      <Button title={loading ? 'Deleting...' : 'Delete'} onPress={handleDeleteUser} disabled={loading} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default DeleteUserScreen;
