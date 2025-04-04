import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { Card, Text } from 'react-native-paper';
import { mockData } from '../utils/mockData';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Finance Dashboard" />
      <ScrollView>
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
      </ScrollView>
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
  statValueMinus: { fontSize: 18, fontWeight: 'bold',color:'red' },
  quickAccessContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  quickAccessButton: { padding: 12, backgroundColor: '#e0e0e0', borderRadius: 8 },
  sectionCard: { margin: 16 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  expense: { color: 'red' },
  income: { color: 'green' },
  viewAll: { color: 'blue', textAlign: 'center', marginTop: 8 }
});

export default HomeScreen;
