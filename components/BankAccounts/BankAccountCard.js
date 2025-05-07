import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const BankAccountCard = ({ account }) => {
  // Determine icon based on account type
  const getIcon = (type) => {
    switch (type) {
      case 'depository': return 'account-balance';
      case 'credit': return 'credit-card';
      case 'loan': return 'monetization-on';
      case 'investment': return 'trending-up';
      default: return 'account-balance-wallet';
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={getIcon(account.type)} 
            size={24} 
            color="#007AFF" 
          />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountType}>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
          </Text>
        </View>
        <Text style={styles.balance}>
          {formatCurrency(account.balances.current, account.balances.iso_currency_code)}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BankAccountCard;
