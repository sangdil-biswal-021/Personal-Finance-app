import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import {Header} from '../components/Header';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Personal Finance" />
      <Text style={styles.balance}>Balance: $5,000</Text>
      <Button title="View Transactions" onPress={() => navigation.navigate('Transactions')} />
      <Button title="View Budget" onPress={() => navigation.navigate('Budget')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
});

export default HomeScreen;
