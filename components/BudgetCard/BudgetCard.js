import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

const BudgetCard = ({ budget }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{budget.name}</Text>
        <Text style={styles.amount}>${budget.amount}</Text>
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
    color: 'blue',
  },
});

export default BudgetCard;
