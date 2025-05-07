import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import { Header } from '../components/Header';
import { mockData } from '../utils/mockData';
import { getPlaidLinkToken, exchangePlaidToken, getBankAccounts } from '../api/plaid/config';
import { PlaidLink } from 'react-native-plaid-link-sdk';
import BankAccountCard from '../components/BankAccounts/BankAccountCard';
import BankAccountChart from '../components/BankAccounts/BankAccountChart';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkToken, setLinkToken] = useState(null);
  const [linkLoading, setLinkLoading] = useState(false);

  // Fetch accounts when component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    setLinkLoading(true);
    try {
      const token = await getPlaidLinkToken();
      setLinkToken(token);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize account linking. Please try again.');
      console.error('Link token error:', error);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleSuccess = async (success) => {
    setLinkLoading(true);
    try {
      await exchangePlaidToken(success.publicToken);
      fetchAccounts();
      Alert.alert('Success', 'Your bank account was linked successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to link account. Please try again.');
      console.error('Exchange token error:', error);
    } finally {
      setLinkLoading(false);
      setLinkToken(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Finance Dashboard" 
        navigation={navigation}
        rightActions={[
          {
            icon: 'account-circle',
            onPress: () => navigation.navigate('Profile')
          }
        ]}
      />
      
      <ScrollView>
        {/* Current Balance Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.balanceTitle}>Current Balance</Text>
            <Text style={styles.balanceAmount}>₹{mockData.totalBalance}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValuePlus}>₹{mockData.monthlyIncome}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statValueMinus}>₹{mockData.monthlyExpenses}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Bank Account Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Accounts</Text>
          {linkLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <TouchableOpacity 
              style={styles.addAccountButton} 
              onPress={handleLinkAccount}
            >
              <MaterialIcons name="add" size={16} color="#007AFF" />
              <Text style={styles.addAccountText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
        ) : bankAccounts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="account-balance" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No bank accounts linked</Text>
            <Text style={styles.emptyStateSubtext}>
              Connect your bank accounts to see your finances in one place
            </Text>
          </View>
        ) : (
          <>
            {/* Bank account cards */}
            {bankAccounts.map((account) => (
              <BankAccountCard key={account.id} account={account} />
            ))}
            
            {/* Chart visualization */}
            <BankAccountChart accounts={bankAccounts} />
          </>
        )}
        
        {/* Quick access buttons */}
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessButton} 
            onPress={() => navigation.navigate('Transactions')}>
            <Text>Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAccessButton} 
            onPress={() => navigation.navigate('Budget')}>
            <Text>Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAccessButton} 
            onPress={() => navigation.navigate('SplitMoney')}>
            <Text>Split Money</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent transactions preview */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Recent Transactions" />
          <Card.Content>
            {mockData.transactions.slice(0, 3).map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <Text>{transaction.name}</Text>
                <Text style={transaction.amount < 0 ? styles.expense : styles.income}>
                  ₹{Math.abs(transaction.amount)}
                </Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.viewAll}>View all transactions</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Plaid Link Component */}
      {linkToken && (
        <PlaidLink
          tokenConfig={{
            token: linkToken,
          }}
          onSuccess={handleSuccess}
          onExit={() => setLinkToken(null)}
        >
          <View style={styles.plaidButton}>
            <Text style={styles.plaidButtonText}>Link Your Bank Account</Text>
          </View>
        </PlaidLink>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  summaryCard: { margin: 16, elevation: 4 },
  balanceTitle: { fontSize: 16, color: '#666' },
  balanceAmount: { fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  statItem: { flex: 1},
  statLabel: { fontSize: 14, color: '#666' },
  statValuePlus: { fontSize: 18, fontWeight: 'bold', color:'green' },
  statValueMinus: { fontSize: 18, fontWeight: 'bold', color:'red' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#EDF6FF',
  },
  addAccountText: {
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  quickAccessContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  quickAccessButton: { padding: 12, backgroundColor: '#e0e0e0', borderRadius: 8 },
  sectionCard: { margin: 16 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  expense: { color: 'red' },
  income: { color: 'green' },
  viewAll: { color: 'blue', textAlign: 'center', marginTop: 8 },
  loader: {
    marginVertical: 32,
  },
  bottomPadding: {
    height: 40,
  },
  plaidButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  plaidButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;
