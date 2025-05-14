import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const API_BASE = 'https://stock-backend-seven.vercel.app';
const screenWidth = Dimensions.get('window').width;

const StockDetails = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState({ symbol: 'AAPL', name: 'Apple Inc' });
  const [historicalData, setHistoricalData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load default stock (AAPL) and stock list on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [stocksRes, historicalRes, predictionRes] = await Promise.all([
          axios.get(`${API_BASE}/available-stocks`),
          axios.get(`${API_BASE}/historical?symbol=AAPL`),
          axios.get(`${API_BASE}/predict?symbol=AAPL`)
        ]);
        setStocks(stocksRes.data);
        setHistoricalData(historicalRes.data);
        setPrediction(predictionRes.data);
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Memoized filtered stocks with better search
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return stocks.filter(stock =>
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query)
    );
  }, [stocks, searchQuery]);

  // Fetch data when stock is selected
  const fetchStockData = useCallback(async (symbol) => {
    try {
      setChartLoading(true);
      setError(null);
      const [historicalRes, predictionRes] = await Promise.all([
        axios.get(`${API_BASE}/historical?symbol=${symbol}`),
        axios.get(`${API_BASE}/predict?symbol=${symbol}`)
      ]);
      setHistoricalData(historicalRes.data);
      setPrediction(predictionRes.data);
    } catch (err) {
      setError('Failed to load stock data');
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Chart data formatting
  const chartData = useMemo(() => ({
    labels: historicalData.map((_, index) => index % 5 === 0 ? index + 1 : ''),
    datasets: [{
      data: historicalData.map(item => parseFloat(item.close)),
      color: (opacity = 1) => `rgba(0, 97, 255, ${opacity})`,
      strokeWidth: 2
    }]
  }), [historicalData]);

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by symbol (e.g. AAPL)"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Smart Dropdown */}
        {searchQuery.length > 0 && (
          <View style={styles.dropdownWrapper}>
            <FlatList
              data={filteredStocks}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stockItem}
                  onPress={() => {
                    setSearchQuery('');
                    Keyboard.dismiss();
                    fetchStockData(item.symbol);
                    setSelectedStock(item);
                  }}
                >
                  <Text style={styles.stockSymbol}>{item.symbol}</Text>
                  <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              style={styles.dropdownList}
              ListEmptyComponent={<Text style={styles.noResults}>No matching stocks</Text>}
            />
          </View>
        )}
      </View>

      {/* Initial Loading */}
      {initialLoading && (
        <View style={styles.fullLoading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Initial Data...</Text>
        </View>
      )}

      {/* Main Content */}
      {!initialLoading && (
        <>
          {/* Chart Section */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                {selectedStock.name} ({selectedStock.symbol})
              </Text>
              {chartLoading && <ActivityIndicator size="small" color="#007AFF" />}
            </View>

            {historicalData.length > 0 ? (
              <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#f8f9fa',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(0, 97, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  propsForDots: { r: '3' }
                }}
                bezier
              />
            ) : (
              <View style={styles.placeholder}>
                <Icon name="insert-chart" size={40} color="#007AFF" />
                <Text style={styles.placeholderText}>Chart data not available</Text>
              </View>
            )}
          </View>

          {/* Prediction Section */}
          {prediction && (
            <View style={styles.predictionCard}>
              <View style={styles.predictionHeader}>
                <Icon name="trending-up" size={24} color="#4CAF50" />
                <Text style={styles.predictionTitle}>Next Day Prediction</Text>
              </View>
              <View style={styles.predictionContent}>
                <Text style={styles.predictionLabel}>Expected Price:</Text>
                <Text style={styles.predictionValue}>
                  ${prediction.prediction}
                </Text>
              </View>
              <Text style={styles.predictionDate}>
                Updated: {new Date(prediction.last_refreshed).toLocaleDateString()}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={24} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  searchContainer: {
    zIndex: 2,
    marginBottom: 20
  },
  searchInput: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownWrapper: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    elevation: 3,
    zIndex: 3,
  },
  dropdownList: {
    paddingHorizontal: 10,
  },
  stockItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    width: '25%'
  },
  stockName: {
    fontSize: 14,
    color: '#666',
    width: '70%'
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  placeholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10
  },
  predictionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8
  },
  predictionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8
  },
  predictionLabel: {
    fontSize: 16,
    color: '#666'
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50'
  },
  predictionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic'
  },
  fullLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 20
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8
  },
  noResults: {
    padding: 15,
    color: '#999',
    textAlign: 'center'
  }
});

export default StockDetails;
