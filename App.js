import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './api/firebase/config';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import BudgetScreen from './screens/BudgetScreen';
import SplitMoneyScreen from './screens/SplitMoneyScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import FinanceDashboard from './screens/CurrencyConverter';
import CurrencyConverter from './screens/CurrencyConverter';
import StockDetails from './screens/StockDetails';

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  function onAuthStateChangedHandler(user) { //this user is not the state rather a variable
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Authenticated user screens
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={({ navigation }) => ({
            title: 'Home',
            headerRight: () => (
              <MaterialIcons 
                name="account-circle" 
                size={28} 
                color="#007bff" 
                style={{ marginRight: 16 }} 
                onPress={() => navigation.navigate("Profile")} 
              />
            ),
          })} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />
            <Stack.Screen name="Budget" component={BudgetScreen} />
            <Stack.Screen name="SplitMoney" component={SplitMoneyScreen} />
            <Stack.Screen name="CurrencyConvertor" component={CurrencyConverter} />
            <Stack.Screen name="StockDetails" component={StockDetails} />
          </>
        ) : (
          // Non-authenticated user screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
