import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import DashboardScreen from './DashboardScreen';
import EditUserScreen from './EditUserScreen';
import DeleteUserScreen from './DeleteUserScreen';
import UserProfileScreen from './UserProfileScreen';
import AddUserScreen from './AddUserScreen'; // Import the AddUserScreen
import RandomGroupScreen from './RandomGroup'; // Import RandomGroupScreen

const Stack = createStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: { navigation: any; route: any; token: string }; // Add navigation and route props
  AddUserScreen: undefined;
  EditUser: { 
    user: { 
      dateOfBirth: string | Date; // Ensure it accepts both formats
      age: number; // Changed from `any` to `number`
      course: string;
      gender: string;
      username: string;
      fullName: string;
      _id: string;
      email: string;
    }; 
    onUserUpdated: () => void; // Changed from `Promise<void>` to `void`
  };
  DeleteUser: { user: { _id: string; email: string } };
  UserProfile: undefined;
  AddUser: { token: string; onUserAdded: () => void }; // Changed from `Promise<void>` to `void`
  RandomGroup: undefined; // Added RandomGroup to navigation
};

export default function App() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="EditUser" 
            component={EditUserScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="DeleteUser" 
            component={DeleteUserScreen} 
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AddUser" 
            component={AddUserScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="RandomGroup" 
            component={RandomGroupScreen} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
