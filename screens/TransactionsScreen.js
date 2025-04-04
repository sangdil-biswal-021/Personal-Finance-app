import React, { useState, useCallback } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal
} from 'react-native';
import { TransactionItem } from '../components/TransactionItem';
import { Header } from '../components/Header';
import { mockData } from '../utils/mockData';
import { Ionicons } from '@expo/vector-icons';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState(mockData.transactions);
  const [filteredTransactions, setFilteredTransactions] = useState(mockData.transactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // Calculate summary values
  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  // Filter and search transactions
  const filterTransactions = useCallback(() => {
    let result = [...transactions];
    
    // Apply category/type filter
    if (selectedFilter !== 'all') {
      result = result.filter(t => 
        selectedFilter === 'income' ? t.amount > 0 : 
        selectedFilter === 'expense' ? t.amount < 0 : 
        t.category === selectedFilter
      );
    }
    
    // Apply search
    if (searchQuery) {
      result = result.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortBy === 'date-desc') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'amount-desc') {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-asc') {
      result.sort((a, b) => a.amount - b.amount);
    }
    
    setFilteredTransactions(result);
  }, [transactions, selectedFilter, searchQuery, sortBy]);

  // Apply filters whenever dependencies change
  React.useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  // Pull-to-refresh implementation
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetch delay
    setTimeout(() => {
      // In a real app, you'd fetch fresh data here
      setRefreshing(false);
    }, 1000);
  }, []);

  // Render date group header
  const renderDateGroup = (date, transactions) => (
    <View key={date} style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{date}</Text>
      {transactions.map((transaction, index) => (
        <TransactionItem 
          key={index} 
          transaction={transaction} 
          onPress={() => handleTransactionPress(transaction)}
        />
      ))}
    </View>
  );

  const handleTransactionPress = (transaction) => {
    // Handle transaction press (edit, view details, etc.)
    console.log('Transaction pressed', transaction);
  };

  return (
    <View style={styles.container}>
      <Header title="Transactions" />
      
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, styles.incomeText]}>
            ₹{totalIncome.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, styles.expenseText]}>
            ₹{totalExpenses.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={styles.summaryValue}>
            ₹{(totalIncome - totalExpenses).toFixed(2)}
          </Text>
        </View>
      </View>
      
      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No transactions found</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Object.entries(groupedTransactions).map(([date, transactions]) => 
            renderDateGroup(date, transactions)
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
      
      {/* Add Transaction Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
      
      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.filterSectionTitle}>Transaction Type</Text>
            <View style={styles.filterOptions}>
              {['all', 'income', 'expense'].map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterOption,
                    selectedFilter === filter && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text 
                    style={[
                      styles.filterOptionText,
                      selectedFilter === filter && styles.filterOptionTextSelected
                    ]}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.filterOptions}>
              {[
                {id: 'date-desc', label: 'Newest First'},
                {id: 'date-asc', label: 'Oldest First'},
                {id: 'amount-desc', label: 'Highest Amount'},
                {id: 'amount-asc', label: 'Lowest Amount'}
              ].map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    sortBy === option.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSortBy(option.id)}
                >
                  <Text 
                    style={[
                      styles.filterOptionText,
                      sortBy === option.id && styles.filterOptionTextSelected
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#2E7D32',
  },
  expenseText: {
    color: '#C62828',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPadding: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    color: '#333',
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TransactionsScreen;
