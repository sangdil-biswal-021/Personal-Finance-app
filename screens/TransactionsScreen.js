import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import {TransactionItem} from '../components/TransactionItem';
import {Header} from '../components/Header';
import { mockData } from '../utils/mockData';

const TransactionsScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Transactions" />
      <ScrollView>
        {mockData.transactions.map((transaction, index) => (
          <TransactionItem key={index} transaction={transaction} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TransactionsScreen;
