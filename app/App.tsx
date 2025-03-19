// App.tsx - Navigation Setup (TypeScript)
import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import DashboardScreen from './DashboardScreen';
import EditUserScreen from './EditUserScreen';
import DeleteUserScreen from './DeleteUserScreen';
import UserProfileScreen from './UserProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    EditUser: { user: { _id: string; email: string }; onUserUpdated: () => Promise<void> };
    DeleteUser: { user: { _id: string; email: string } };
    UserProfile: undefined;
  };

export default function App() {
  return (
    <NavigationIndependentTree>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="EditUser" component={EditUserScreen} />
        <Stack.Screen name="DeleteUser" component={DeleteUserScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </NavigationIndependentTree>
  );
}
