import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Button, FlatList, Alert,
  TouchableOpacity, Keyboard, Modal, TouchableWithoutFeedback,
  Platform, ScrollView, KeyboardAvoidingView
} from 'react-native';
import { ref, push, onValue, remove } from 'firebase/database';
import { auth, database } from '../api/firebase/config';
import { Header } from '../components/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SplitMoneyScreen = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    selectedUsers: [],
    paidBy: null
  });
  const [userTotals, setUserTotals] = useState({});

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const expensesRef = ref(database, 'splitExpenses/' + userId);

    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const expensesList = Object.keys(data).map(key => ({
        id: key,
        selectedUsers: data[key].selectedUsers || [],
        paidBy: data[key].paidBy || null,
        ...data[key]
      }));
      setExpenses(expensesList);
      calculateUserTotals(expensesList);
    });

    return () => unsubscribe();
  }, []);

  const calculateUserTotals = (expenses) => {
    const totals = {};
    expenses.forEach(expense => {
      const amount = parseFloat(expense.amount) || 0;
      const splitCount = expense.selectedUsers.length;
      if (splitCount === 0) return;

      const perPerson = amount / splitCount;
      expense.selectedUsers.forEach(user => {
        if (user === expense.paidBy) {
          totals[user] = (totals[user] || 0) + (amount - perPerson);
        } else {
          totals[user] = (totals[user] || 0) - perPerson;
        }
      });
    });
    setUserTotals(totals);
  };

  const addUser = () => {
    const trimmed = name.trim();
    if (trimmed && !users.includes(trimmed)) {
      setUsers([...users, trimmed]);
      setName('');
      Keyboard.dismiss();
    } else if (users.includes(trimmed)) {
      Alert.alert('Error', 'This user is already added');
    }
  };

  const toggleUserSelection = (user) => {
    setNewExpense(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(user)
        ? prev.selectedUsers.filter(u => u !== user)
        : [...prev.selectedUsers, user]
    }));
  };

  const selectPayer = (user) => {
    setNewExpense(prev => ({
      ...prev,
      paidBy: user,
      selectedUsers: prev.selectedUsers.includes(user) 
        ? prev.selectedUsers 
        : [...prev.selectedUsers, user]
    }));
  };

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount || 
        !newExpense.paidBy || newExpense.selectedUsers.length === 0) {
      Alert.alert('Error', 'Please fill all fields and select payer + participants');
      return;
    }

    const userId = auth.currentUser.uid;
    const splitAmount = (parseFloat(newExpense.amount) / newExpense.selectedUsers.length).toFixed(2);

    const expenseData = {
      description: newExpense.description,
      amount: newExpense.amount,
      selectedUsers: newExpense.selectedUsers,
      paidBy: newExpense.paidBy,
      splitAmount,
      createdAt: new Date().toISOString(),
      createdBy: userId
    };

    const expensesRef = ref(database, 'splitExpenses/' + userId);
    push(expensesRef, expenseData);

    setNewExpense({ description: '', amount: '', selectedUsers: [], paidBy: null });
    setShowExpenseModal(false);
    Keyboard.dismiss();
  };

  const deleteExpense = (id) => {
    const userId = auth.currentUser.uid;
    const expenseRef = ref(database, `splitExpenses/${userId}/${id}`);
    remove(expenseRef);
  };

  const renderExpenseItem = ({ item }) => {
    const perPerson = parseFloat(item.splitAmount);
    const totalPaid = parseFloat(item.amount);
    const payer = item.paidBy;

    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseHeader}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <Text style={styles.expenseAmount}>₹{item.amount}</Text>
        </View>
        <Text style={styles.paidByText}>Paid by: {payer}</Text>
        <Text style={styles.splitText}>
          Split between: {item.selectedUsers.join(', ')}
        </Text>
        
        <View style={styles.debtContainer}>
          {item.selectedUsers.map(user => (
            user !== payer && (
              <View key={user} style={styles.debtRow}>
                <Text style={styles.debtUser}>{user}</Text>
                <Text style={styles.owesText}>
                  owes ₹{perPerson.toFixed(2)} to {payer}
                </Text>
              </View>
            )
          ))}
        </View>
        <Button title="Delete" onPress={() => deleteExpense(item.id)} color="#e74c3c" />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header title="Split Expenses" backgroundColor={'grey'} />

        <FlatList
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>Participants</Text>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Add participant name"
                    value={name}
                    onChangeText={setName}
                    onSubmitEditing={addUser}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addUser}>
                    <Icon name="person-add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>

              {users.length > 0 && (
                <View style={styles.usersContainer}>
                  <Text style={styles.label}>Participants:</Text>
                  <Text>{users.join(', ')}</Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>Current Balances</Text>
              <View style={styles.totalsContainer}>
                {users.length === 0 ? (
                  <Text style={{ color: '#888' }}>Add participants to begin</Text>
                ) : (
                  users.map(user => (
                    <View key={user} style={styles.userBalance}>
                      <Text style={styles.userName}>{user}</Text>
                      <Text style={[
                        styles.balanceAmount,
                        { color: userTotals[user] >= 0 ? '#2ecc71' : '#e74c3c' }
                      ]}>
                        ₹{Math.abs(userTotals[user]?.toFixed(2)) || '0.00'}
                        {userTotals[user] >= 0 ? ' owed to' : ' owes'} 
                      </Text>
                    </View>
                  ))
                )}
              </View>

              <Text style={styles.sectionTitle}>Expense History</Text>
            </>
          }
          data={expenses}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center' }}>No expenses yet.</Text>}
          renderItem={renderExpenseItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        <TouchableOpacity style={styles.floatingButton} onPress={() => setShowExpenseModal(true)}>
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>

        {showExpenseModal && (
          <Modal
            visible={showExpenseModal}
            animationType="slide"
            transparent={Platform.OS === 'ios'}
            onRequestClose={() => setShowExpenseModal(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContainer}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  <Text style={styles.modalTitle}>New Expense</Text>

                  <Text style={styles.subTitle}>Who paid?</Text>
                  <View style={styles.participantsContainer}>
                    {users.map(user => (
                      <TouchableOpacity
                        key={user}
                        style={[
                          styles.userTag,
                          newExpense.paidBy === user && styles.payerTag
                        ]}
                        onPress={() => selectPayer(user)}
                      >
                        <Text style={newExpense.paidBy === user && styles.selectedUserText}>
                          {user}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={styles.modalInput}
                    placeholder="Expense description"
                    value={newExpense.description}
                    onChangeText={text => setNewExpense(prev => ({ ...prev, description: text }))}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Total amount"
                    keyboardType="numeric"
                    value={newExpense.amount}
                    onChangeText={text => setNewExpense(prev => ({ ...prev, amount: text }))}
                  />

                  <Text style={styles.subTitle}>Participants</Text>
                  <View style={styles.participantsContainer}>
                    {users.length === 0 && <Text style={{ color: '#888' }}>Add users first</Text>}
                    {users.map(user => (
                      <TouchableOpacity
                        key={user}
                        style={[
                          styles.userTag,
                          newExpense.selectedUsers.includes(user) && styles.selectedUserTag
                        ]}
                        onPress={() => toggleUserSelection(user)}
                      >
                        <Text style={newExpense.selectedUsers.includes(user) && styles.selectedUserText}>
                          {user}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.modalButtonContainer}>
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setShowExpenseModal(false);
                        Keyboard.dismiss();
                      }}
                      color="#666"
                    />
                    <Button
                      title="Add Expense"
                      onPress={addExpense}
                      color="#2ecc71"
                    />
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginVertical: 16, color: '#2c3e50', marginLeft: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16 },
  input: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 8, marginRight: 8, fontSize: 16, elevation: 2 },
  addButton: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, elevation: 2 },
  usersContainer: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 4, marginHorizontal: 16, marginBottom: 16 },
  label: { fontWeight: 'bold', marginBottom: 4 },
  floatingButton: {
    position: 'absolute', bottom: 30, right: 30, backgroundColor: '#27ae60',
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    elevation: 5, zIndex: 1,
  },
  totalsContainer: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginHorizontal: 16, marginBottom: 16, elevation: 2 },
  userBalance: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  userName: { fontSize: 16, color: '#34495e' },
  balanceAmount: { fontSize: 16, fontWeight: '600' },
  expenseItem: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginHorizontal: 16, marginBottom: 12, elevation: 2 },
  expenseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  expenseDescription: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  expenseAmount: { fontSize: 16, color: '#e74c3c', fontWeight: '600' },
  paidByText: { color: '#3498db', marginBottom: 8, fontWeight: '600' },
  splitText: { color: '#7f8c8d', marginBottom: 4 },
  debtContainer: { marginVertical: 8, padding: 8, backgroundColor: '#f8f9fa', borderRadius: 8 },
  debtRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  debtUser: { color: '#2c3e50' },
  owesText: { color: '#e74c3c' },
  modalContainer: { flex: 1, padding: 24, backgroundColor: 'white' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#2c3e50', textAlign: 'center' },
  modalInput: { backgroundColor: '#ecf0f1', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  subTitle: { fontSize: 16, fontWeight: '600', marginVertical: 12, color: '#34495e' },
  participantsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  userTag: { backgroundColor: '#ecf0f1', borderRadius: 16, padding: 8, margin: 4 },
  selectedUserTag: { backgroundColor: '#3498db' },
  payerTag: { backgroundColor: '#2ecc71', borderWidth: 2, borderColor: '#27ae60' },
  selectedUserText: { color: 'white' },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, marginBottom: 24 },
});

export default SplitMoneyScreen;
