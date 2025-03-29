import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import { Button, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

const API_URL = 'https://apinijno.vercel.app/api';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        navigation.replace('Dashboard', { navigation, route: {}, token: data.token });
      } else {
        Alert.alert('Error', data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: 'green' }]}>Welcome Back</Text>

      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        left={<TextInput.Icon icon="email" />}
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off" : "eye"}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Register')}
        style={styles.outlineButton}
        labelStyle={styles.outlineButtonText}
      >
        Register
      </Button>

      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.termsButton}>Terms & Conditions</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>📜 Terms & Conditions</Text>
              <Text style={styles.modalText}>
                1. By using this app, you agree to bring me snacks. 🍕
              </Text>
              <Text style={styles.modalText}>
                2. If the app crashes, just pretend it’s a feature. 🤡
              </Text>
              <Text style={styles.modalText}>
                3. If you forget your password, try "123456" or "password" (just kidding, don't). 🔐
              </Text>
              <Text style={styles.modalText}>
                4. We do not collect your data… but if we did, we would sell it for tacos. 🌮
              </Text>
              <Text style={styles.modalText}>
                5. If you disagree with these terms, please close your eyes and keep using the app. 👀
              </Text>
            </ScrollView>

            <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  outlineButton: {
    width: '100%',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
    borderColor: '#2E7D32',
  },
  outlineButtonText: {
    fontSize: 16,
    color: '#2E7D32',
  },
  termsButton: {
    marginTop: 20,
    fontSize: 14,
    color: 'gray',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 15,
  },
});

export default LoginScreen;
