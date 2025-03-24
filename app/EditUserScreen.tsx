import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';

const API_URL = 'https://apikonatalagato.vercel.app/api';

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
        onUserUpdated();
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
    <View style={styles.overlay}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>EDIT USER INFO</Text>
          <TextInput label="Full Name" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
          <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" style={styles.input} />
          <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={styles.input} />
          <Button mode="contained" onPress={handleUpdateUser} loading={loading} disabled={loading} style={styles.button}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    width: '100%',
  },
  button: {
    marginTop: 10,
    backgroundColor: 'darkgreen',
  },
});

export default EditUserScreen;