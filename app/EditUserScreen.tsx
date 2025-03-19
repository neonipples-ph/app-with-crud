import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';

type User = {
  _id: string;
  email: string;
  fullName?: string;
  username?: string;
};

type EditUserScreenProps = StackScreenProps<RootStackParamList, 'EditUser'> & {
  route: {
    params: {
      user: User;
      onUserUpdated: () => void;
    };
  };
};

const API_URL = 'https://apikonatalagato.vercel.app/api';

const EditUserScreen: React.FC<EditUserScreenProps> = ({ route, navigation }) => {
  const { user, onUserUpdated } = route.params;
  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    if (!fullName || !username || !email) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'User updated successfully');
        onUserUpdated(); // Refresh Dashboard after update
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Update failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Edit User" />
        <Card.Content>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleUpdateUser}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    alignItems: 'center',
  },
  input: {
    marginBottom: 15,
    width: '100%',
  },
  button: {
    marginTop: 10,
  },
});

export default EditUserScreen;
