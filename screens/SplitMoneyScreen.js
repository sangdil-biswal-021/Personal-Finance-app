import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList } from 'react-native';
import { Header } from '../components/Header';

const SplitMoneyScreen = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]);

  const addUser = () => {
    if (name) {
      setUsers([...users, name]);
      setName('');
    }
  };

  const addExpense = () => {
    if (amount && users.length > 0) {
      const splitAmount = parseFloat(amount) / users.length;
      setExpenses([
        ...expenses,
        { id: Date.now().toString(), amount: splitAmount.toFixed(2), users },
      ]);
      setAmount('');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Split Expenses" />
      <Text style={styles.label}>Add User:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter user name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Add User" onPress={addUser} />

      <Text style={styles.label}>Add Expense:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter total amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Split Expense" onPress={addExpense} />

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text>Amount per user: ${item.amount}</Text>
            <Text>Users: {item.users.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  expenseItem: {
    marginVertical: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
});

export default SplitMoneyScreen;
