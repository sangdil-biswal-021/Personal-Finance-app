import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import BudgetScreen from './screens/BudgetScreen';
import SplitMoneyScreen from './screens/SplitMoneyScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
        }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Financial Dashboard'}} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="SplitMoney" component={SplitMoneyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
