import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  dateOfBirth?: string;
  age?: number | null;
  gender?: string;
  course?: string;
  joinedAt?: string;
  avatar?: string | any;
}

const API_URL = 'https://apinijno.vercel.app/api';

const avatars = [
  require('../assets/images/avatar1.png'),
  require('../assets/images/avatar2.png'),
  require('../assets/images/avatar3.png'),
  require('../assets/images/avatar4.png'),
  require('../assets/images/avatar5.png'),
  require('../assets/images/avatar6.png'),
  require('../assets/images/avatar7.png'),
  require('../assets/images/avatar8.png'),
  require('../assets/images/avatar9.png'),
  require('../assets/images/avatar10.png'),
];

const RandomGroup: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [numberOfGroups, setNumberOfGroups] = useState<string>('2');
  const [groupNames, setGroupNames] = useState<string[]>(['', '']);
  const [groupedUsers, setGroupedUsers] = useState<{ name: string; members: User[] }[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Retrieve token from storage
  
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }
  
      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
  
      let data: User[] = await response.json();
  
      let usedIndexes: number[] = [];
      data = data.map(user => {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * avatars.length);
        } while (usedIndexes.includes(randomIndex) && usedIndexes.length < avatars.length);
  
        usedIndexes.push(randomIndex);
        if (usedIndexes.length >= avatars.length) usedIndexes = [];
  
        // ✅ Calculate age correctly
        let age = null;
        if (user.dateOfBirth) {
          const birthDate = new Date(user.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          if (today < birthdayThisYear) {
            age -= 1;
          }
        }
  
        return {
          ...user,
          avatar: user.avatar || avatars[randomIndex],
          age,
        };
      });
  
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const createGroups = () => {
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    const numGroups = parseInt(numberOfGroups) || 1;
    const groups = Array.from({ length: numGroups }, (_, i) => ({
      name: groupNames[i] || `Group ${i + 1}`,
      members: [] as User[],
    }));

    shuffledUsers.forEach((user, index) => {
      groups[index % numGroups].members.push(user);
    });

    setGroupedUsers(groups);
    setModalVisible(false);
  };

  const exportToPDF = async () => {
    const content = groupedUsers.map(group => `\n${group.name}\n${'-'.repeat(20)}\n${group.members.map(member => `${member.fullName} (${member.username}) - ${member.email}`).join('\n')}`).join('\n\n');
    
    const fileUri = FileSystem.documentDirectory + 'groups.pdf';
    const { uri } = await Print.printToFileAsync({ html: `<pre>${content}</pre>` });
    await Sharing.shareAsync(uri);
  };

    function handleGroupNumberChange(text: string): void {
        const num = parseInt(text, 10);
        if (!isNaN(num) && num > 0) {
            setNumberOfGroups(text);
            const newGroupNames = Array.from({ length: num }, (_, i) => groupNames[i] || `Group ${i + 1}`);
            setGroupNames(newGroupNames);
        } else {
            setNumberOfGroups('');
            setGroupNames([]);
        }
    }

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedUsers}
        keyExtractor={(item, index) => `group-${index}`}
        contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.groupTitle}>{item.name}</Text>
            {item.members.map(member => (
              <Card key={member._id} style={styles.card}>
                <Card.Content>
                  <View style={styles.profileHeader}>
                    <Avatar.Image size={60} source={typeof member.avatar === 'string' ? { uri: member.avatar } : member.avatar} style={styles.avatar} />
                    <Text style={styles.username}>@{member.username}</Text>
                  </View>
                  <Text style={styles.fullName}>{member.fullName}{member.age ? `, ${member.age}` : ''} {member.gender ? `(${member.gender})` : ''}</Text>
                  <Text style={styles.email}>{member.email}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="group" size={24} color="white" />
        <Text style={styles.buttonText}>Create Groups</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Number of Groups" 
            keyboardType="numeric" 
            value={numberOfGroups} 
            onChangeText={handleGroupNumberChange} 
          />
          {groupNames.map((name, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Enter Group ${index + 1} Name`}
              value={groupNames[index]}
              onChangeText={(text) => {
                const newNames = [...groupNames];
                newNames[index] = text;
                setGroupNames(newNames);
              }}
            />
          ))}
          <TouchableOpacity style={styles.button} onPress={createGroups}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
        
      </Modal>
      
        <TouchableOpacity style={styles.button} onPress={exportToPDF}>
          <MaterialIcons name="file-download" size={24} color="white" />
          <Text style={styles.buttonText}>Export PDF</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  input: {
    height: 50,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 30,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  card: {
    marginBottom: 15,
    marginHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    color: 'gray',
  },
  fullName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  email: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 2,
  },
});

export default RandomGroup;
