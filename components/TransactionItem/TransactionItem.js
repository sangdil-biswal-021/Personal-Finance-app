import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

const TransactionItem = ({ transaction }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{transaction.name}</Text>
        <Text style={styles.amount}>${transaction.amount}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    color: 'green',
  },
});

export default TransactionItem;
