import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';

const API_URL = 'https://apinijno.vercel.app/api';

type User = {
  _id: string;
  email: string;
  fullName?: string;
  username?: string;
  dateOfBirth: string;
  age?: number;
  gender?: string;
  course?: string;
};

type EditUserScreenProps = StackScreenProps<RootStackParamList, 'EditUser'>;

const EditUserScreen: React.FC<EditUserScreenProps> = ({ route, navigation }) => {
  const { user, onUserUpdated } = route.params;
  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [gender, setGender] = useState(user.gender || '');
  const [course, setCourse] = useState(user.course || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    if (!fullName || !username || !email || !gender || !course) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username,
          email,
          gender,
          course,
          password: password ? password : undefined,
        }),
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.overlay}>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>EDIT USER INFO</Text>

                <TextInput label="Full Name" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
                <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" style={styles.input} />
                <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={styles.input} />

                {/* Read-Only Birthdate */}
                <View>
                  <Text style={styles.note}>* Age cannot be edited.</Text>
                  <TextInput label="Age" value={user.age?.toString() || ''} mode="outlined" editable={false} style={styles.input} />

                  <Text style={styles.note}>* Birthdate cannot be edited.</Text>
                  <TextInput label="Birthdate" value={new Date(user.dateOfBirth).toISOString().split('T')[0]} mode="outlined" editable={false} style={styles.input} />
                </View>

                {/* Course Input */}
                <TextInput label="Course" value={course} onChangeText={setCourse} mode="outlined" style={styles.input} />

                {/* Gender Picker */}
                <View style={styles.pickerContainer}>
                  <Text style={styles.label}>Gender</Text>
                  <Picker
                    selectedValue={gender}
                    onValueChange={(itemValue) => setGender(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </View>

                {/* Password Input */}
                <Text style={styles.note}>* Leave blank if you do not want to change your password.</Text>
                <TextInput
                  label="New Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                />
                <TextInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                />

                <Button mode="contained" onPress={handleUpdateUser} loading={loading} disabled={loading} style={styles.button}>
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: '100%',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
    marginLeft: 5,
  },
  picker: {
    width: '100%',
  },
  button: {
    marginTop: 10,
    backgroundColor: 'darkgreen',
  },
  note: {
    fontSize: 12,
    color: 'gray',
  },
});

export default EditUserScreen;