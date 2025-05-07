import React from 'react';
import { View, Dimensions, Text, StyleSheet } from 'react-native';
import { VictoryPie, VictoryLegend } from 'victory-native';

const BankAccountChart = ({ accounts }) => {
  if (!accounts || accounts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No accounts to display</Text>
      </View>
    );
  }

  // Color palette for different account types
  const colorScale = {
    depository: '#4ECDC4',  // Teal
    credit: '#FF6B6B',      // Red
    loan: '#FFE66D',        // Yellow
    investment: '#7A77FF',  // Purple
    other: '#A5A5A5'        // Gray
  };

  // Prepare data for the pie chart
  const chartData = accounts.map(account => ({
    x: account.name,
    y: Math.max(0.01, account.balances.current), // Ensure positive values for chart
    color: colorScale[account.type] || colorScale.other
  }));

  // Prepare data for the legend
  const legendData = Object.keys(colorScale).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    symbol: { fill: colorScale[key] }
  }));

  // Calculate total balance
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balances.current, 
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance Distribution</Text>
      <Text style={styles.totalBalance}>
        Total: ${totalBalance.toFixed(2)}
      </Text>
      
      <View style={styles.chartContainer}>
        <VictoryPie
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={250}
          colorScale={chartData.map(d => d.color)}
          innerRadius={50}
          labelRadius={({ innerRadius }) => innerRadius + 30}
          style={{
            labels: { fill: 'white', fontSize: 12, fontWeight: 'bold' }
          }}
          labelPlacement="parallel"
        />
      </View>
      
      <VictoryLegend
        x={Dimensions.get('window').width / 2 - 125}
        width={250}
        centerTitle
        orientation="horizontal"
        gutter={20}
        style={{
          labels: { fontSize: 12 }
        }}
        data={legendData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  totalBalance: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    height: 250,
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  }
});

export default BankAccountChart;
