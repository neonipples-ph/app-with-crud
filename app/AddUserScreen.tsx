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
import { Button, Card } from 'react-native-paper';
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
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    if (!fullName || !username || !email || !password || !course || !birthdate || !gender) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          username,
          email,
          password,
          course,
          dateOfBirth: birthdate,
          gender
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user.");
      }
  
      Alert.alert("Success", "User added successfully.");
      navigation.goBack(); // Navigate back to the dashboard
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const formatBirthdate = (text: string) => {
    let cleanText = text.replace(/\D/g, '');
    if (cleanText.length > 4) cleanText = `${cleanText.slice(0, 4)}-${cleanText.slice(4)}`;
    if (cleanText.length > 7) cleanText = `${cleanText.slice(0, 7)}-${cleanText.slice(7)}`;
    if (cleanText.length > 10) cleanText = cleanText.slice(0, 10);
    setBirthdate(cleanText);
    if (cleanText.length === 10) {
      const computedAge = calculateAge(cleanText);
      setAge(computedAge.toString());
    }
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Add New User</Text>
            <View style={styles.row}>
              <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
              <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
            </View>
            <View style={styles.row}>
              <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="Age" value={age} editable={false} />
            </View>
            <View style={styles.row}>
              <TextInput style={styles.input} placeholder="Course" value={course} onChangeText={setCourse} />
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={birthdate} onChangeText={formatBirthdate} keyboardType="numeric" maxLength={10} />
            </View>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity key={g} style={styles.genderOption} onPress={() => setGender(g)}>
                  <MaterialCommunityIcons name={gender === g ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="black" />
                  <Text style={styles.genderText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Button
  mode="contained"
  onPress={handleAddUser}
  style={styles.button}
  labelStyle={styles.buttonText}
  loading={loading}
  disabled={loading}
>
  <MaterialCommunityIcons name="account-plus" size={24} color="white" />
</Button>

          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { padding: 20, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  input: { flex: 1, height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, marginHorizontal: 5, backgroundColor: '#fff' },
  label: { alignSelf: 'flex-start', fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginHorizontal: 8  },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  genderOption: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 },
  genderText: { marginLeft: 10, fontSize: 16 },
  button: { marginTop: 10, backgroundColor: 'green', borderRadius: 10 },
  buttonText: { fontSize: 16, color: '#fff' },
});

export default AddUserScreen;
