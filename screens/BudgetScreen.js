import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import {BudgetCard} from '../components/BudgetCard';
import {Header} from '../components/Header';
import { mockData } from '../utils/mockData';

const BudgetScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Budget" />
      <ScrollView>
        {mockData.budgets.map((budget, index) => (
          <BudgetCard key={index} budget={budget} />
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

export default BudgetScreen;
