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
import { RootStackParamList } from './App';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RegisterScreenProps = StackScreenProps<RootStackParamList, 'Register'>;

const API_URL = 'https://apinijno.vercel.app/api';

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const formatBirthdate = (text: string) => {
    let cleanText = text.replace(/\D/g, ''); // Remove non-numeric characters

    // Auto-format as YYYY-MM-DD
    if (cleanText.length > 4) cleanText = `${cleanText.slice(0, 4)}-${cleanText.slice(4)}`;
    if (cleanText.length > 7) cleanText = `${cleanText.slice(0, 7)}-${cleanText.slice(7)}`;
    if (cleanText.length > 10) cleanText = cleanText.slice(0, 10);

    setBirthdate(cleanText);
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password || !course || !gender || !birthdate) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
  
    const birthdatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdatePattern.test(birthdate)) {
      Alert.alert('Error', 'Birthdate must be in YYYY-MM-DD format.');
      return;
    }
  
    const age = calculateAge(birthdate);
    const createdAt = new Date().toLocaleDateString(); // Current timestamp in ISO format
  
    setLoading(true);
  
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username,
          email,
          password,
          course,
          dateOfBirth: birthdate, // Send formatted birthdate
          age, // Include calculated age
          gender,
          createdAt, // Send createdAt timestamp
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert('Success', 'User registered successfully');
        navigation.replace('Login');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const selectGender = (selected: string) => setGender(selected);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Register</Text>

          <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
          <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Course" value={course} onChangeText={setCourse} />

          {/* Gender Selection */}
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity key={g} style={styles.genderOption} onPress={() => setGender(g)}>
                  <MaterialCommunityIcons name={gender === g ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="black" />
                  <Text style={styles.genderText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

          {/* Birthdate Input */}
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={birthdate}
            onChangeText={formatBirthdate}
            keyboardType="numeric"
            maxLength={10}
          />

          {/* Password Input (Moved to Last) */}
          <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

          <Button mode="contained" onPress={handleRegister} style={styles.button} labelStyle={styles.buttonText} loading={loading} disabled={loading}>
            Register
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginHorizontal: 15 

  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  genderContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginHorizontal: 15 
  },
  genderText: {
    marginLeft: 10,
    fontSize: 16,
    
  },
  button: {
    width: '100%',
    backgroundColor: 'green',
    borderRadius: 10,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default RegisterScreen;
