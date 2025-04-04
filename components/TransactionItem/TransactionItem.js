import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const TransactionItem = ({ transaction, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(transaction)}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Transaction Details */}
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={transaction.amount > 0 ? 'arrow-up-circle' : 'arrow-down-circle'} 
                size={24} 
                color={transaction.amount > 0 ? 'green' : 'red'} 
              />
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{transaction.name}</Text>
              <Text style={styles.date}>{new Date(transaction.date).toDateString()}</Text>
            </View>
            <Text 
              style={[
                styles.amount, 
                transaction.amount > 0 ? styles.income : styles.expense
              ]}
            >
              ₹{Math.abs(transaction.amount).toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  income: {
    color: 'green',
  },
  expense: {
    color: 'red',
  },
});

export default TransactionItem;
