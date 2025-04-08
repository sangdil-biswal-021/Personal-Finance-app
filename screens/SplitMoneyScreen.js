import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, Alert } from 'react-native';
import { ref, push, onValue, remove } from 'firebase/database';
import { auth, database } from '../api/firebase/config';
import { Header } from '../components/Header';

const SplitMoneyScreen = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');

  // Load existing split expenses when component mounts
  useEffect(() => {
    const userId = auth.currentUser.uid;
    const expensesRef = ref(database, 'splitExpenses/' + userId);
    
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expensesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setExpenses(expensesList);
      } else {
        setExpenses([]);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const addUser = () => {
    if (name && !users.includes(name)) {
      setUsers([...users, name]);
      setName('');
    } else if (users.includes(name)) {
      Alert.alert('Error', 'This user is already added');
    }
  };

  const addExpense = () => {
    if (amount && users.length > 0 && description) {
      const userId = auth.currentUser.uid;
      const splitAmount = (parseFloat(amount) / users.length).toFixed(2);
      
      const newExpense = {
        description,
        totalAmount: amount,
        splitAmount,
        users,
        createdAt: new Date().toISOString(),
        createdBy: userId
      };
      
      const expensesRef = ref(database, 'splitExpenses/' + userId);
      push(expensesRef, newExpense);
      
      setAmount('');
      setDescription('');
      // Keep users array as is for potential additional expenses with same group
    } else {
      Alert.alert('Error', 'Please fill all fields and add at least one user');
    }
  };

  const deleteExpense = (id) => {
    const userId = auth.currentUser.uid;
    const expenseRef = ref(database, `splitExpenses/${userId}/${id}`);
    remove(expenseRef);
  };

  return (
    <View style={styles.container}>
      <Header title="Split Expenses" />


      
      <Text style={styles.sectionTitle}>Add Users</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter user name"
          value={name}
          onChangeText={setName}
        />
        <Button title="Add User" onPress={addUser} />
      </View>
      
      {users.length > 0 && (
        <View style={styles.usersContainer}>
          <Text style={styles.label}>Users in this split:</Text>
          <Text>{users.join(', ')}</Text>
        </View>
      )}
      
      <Text style={styles.sectionTitle}>Add Expense</Text>
      <TextInput
        style={styles.input}
        placeholder="Description (e.g., Dinner, Movie)"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter total amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Split Expense" onPress={addExpense} />
      
      <Text style={styles.sectionTitle}>Expense History</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text>Total: ${item.totalAmount}</Text>
            <Text>Amount per user: ${item.splitAmount}</Text>
            <Text>Split with: {item.users.join(', ')}</Text>
            <Button title="Delete" onPress={() => deleteExpense(item.id)} color="red" />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  usersContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expenseItem: {
    marginVertical: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default SplitMoneyScreen;
