import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  AddUser: { token: string };
};

type AddUserScreenProps = StackScreenProps<RootStackParamList, 'AddUser'>;

const API_URL = 'https://apinijno.vercel.app/api';

const AddUserScreen: React.FC<AddUserScreenProps> = ({ route, navigation }) => {
  const { token } = route.params || {}; // ✅ Extract token
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const addUser = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Use token
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'User added successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to add user.');
      }
    } catch (error) {
      console.error('Add user error:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View>
      <Text>Add New User</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <Button title="Add User" onPress={addUser} />
    </View>
  );
};

export default AddUserScreen;
