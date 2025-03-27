import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RootStackParamList = {
  AddUser: { token: string };
};

const API_URL = 'https://apinijno.vercel.app/api';

const AddUserScreen: React.FC<StackScreenProps<RootStackParamList, 'AddUser'>> = ({ route, navigation }) => {
  const { token } = route.params;
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const formatBirthdate = (text: string) => {
    let cleanText = text.replace(/\D/g, '');
    if (cleanText.length > 4) cleanText = `${cleanText.slice(0, 4)}-${cleanText.slice(4)}`;
    if (cleanText.length > 7) cleanText = `${cleanText.slice(0, 7)}-${cleanText.slice(7)}`;
    if (cleanText.length > 10) cleanText = cleanText.slice(0, 10);
    setBirthdate(cleanText);
  };

  const addUser = async () => {
    if (!fullName || !username || !email || !course || !gender || !birthdate) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const birthdatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdatePattern.test(birthdate)) {
      Alert.alert('Error', 'Birthdate must be in YYYY-MM-DD format.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, username, email, course, birthdate, gender }),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Add New User</Text>
          <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
          <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Course" value={course} onChangeText={setCourse} />
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {['Male', 'Female', 'Non-binary'].map((g) => (
              <TouchableOpacity key={g} style={styles.genderOption} onPress={() => setGender(g)}>
                <MaterialCommunityIcons name={gender === g ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="black" />
                <Text style={styles.genderText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={birthdate} onChangeText={formatBirthdate} keyboardType="numeric" maxLength={10} />
          <Button mode="contained" onPress={addUser} style={styles.button} labelStyle={styles.buttonText} loading={loading} disabled={loading}>
            Add User
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  container: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { alignSelf: 'flex-start', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, marginBottom: 15, backgroundColor: '#fff' },
  genderContainer: { flexDirection: 'column', alignSelf: 'flex-start', marginBottom: 15 },
  genderOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  genderText: { marginLeft: 10, fontSize: 16 },
  button: { width: '100%', backgroundColor: 'green', borderRadius: 10, paddingVertical: 8 },
  buttonText: { fontSize: 16, color: '#fff' },
});

export default AddUserScreen;
