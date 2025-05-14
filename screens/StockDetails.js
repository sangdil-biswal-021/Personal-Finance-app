import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const API_BASE = 'https://stock-backend-seven.vercel.app';
const screenWidth = Dimensions.get('window').width;
const ANIMATION_DURATION = 500;

const StockDetails = () => {
  // Regular state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState({ symbol: 'AAPL', name: 'Apple Inc' });
  const [historicalData, setHistoricalData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const chartRef = useRef();

  // Progressive animation handler
  const animateChart = useCallback((dataLength) => {
    if (dataLength === 0) return;
    const delay = ANIMATION_DURATION / dataLength;
    
    const animate = (index = 0) => {
      if (index < dataLength) {
        setCurrentIndex(index + 1);
        timeoutRef.current = setTimeout(() => animate(index + 1), delay);
      }
    };
    
    animate();
  }, []);

  // Reset animation when data changes
  useEffect(() => {
    if (historicalData.length > 0) {
      setCurrentIndex(0);
      animateChart(historicalData.length);
    }
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [historicalData]);

  // Animated chart data - WITH DATA VALIDATION AND REVERSAL
  const animatedChartData = useMemo(() => {
    // Default safe data to prevent NaN/Infinity
    if (historicalData.length === 0) {
      return {
        labels: ['0', '0', '0', '0', '0'],
        datasets: [{
          data: [0, 0, 0, 0, 0],
          color: (opacity = 1) => `rgba(0, 97, 255, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }
    
    // Get reversed subset of data (for animation)
    // and fix to ensure all numbers are valid
    const slicedData = historicalData
      .slice(0, currentIndex)
      .reverse(); // Reverse to show most recent on the right
      
    return {
      labels: slicedData.map((_, index) => 
        index % 5 === 0 ? (slicedData.length - index) : ''),
      datasets: [{
        data: slicedData.map(item => {
          // Validate to prevent NaN/Infinity
          const parsed = parseFloat(item.close);
          return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
        }),
        color: (opacity = 1) => `rgba(0, 97, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };
  }, [historicalData, currentIndex]);

  // Load default stock (AAPL) and stock list
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [stocksRes, historicalRes, predictionRes] = await Promise.all([
          axios.get(`${API_BASE}/available-stocks`),
          axios.get(`${API_BASE}/historical?symbol=AAPL`),
          axios.get(`${API_BASE}/predict?symbol=AAPL`)
        ]);
        setStocks(stocksRes.data);
        
        // Validate historical data
        const validatedData = historicalRes.data.map(item => ({
          ...item,
          close: parseFloat(item.close) || 0,
          open: parseFloat(item.open) || 0,
          high: parseFloat(item.high) || 0,
          low: parseFloat(item.low) || 0
        }));
        
        setHistoricalData(validatedData);
        setPrediction(predictionRes.data);
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Stock search and selection handlers
  const filteredStocks = useMemo(() => 
    stocks.filter(stock =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [stocks, searchQuery]);

  const fetchStockData = useCallback(async (symbol) => {
    try {
      setChartLoading(true);
      setError(null);
      const [historicalRes, predictionRes] = await Promise.all([
        axios.get(`${API_BASE}/historical?symbol=${symbol}`),
        axios.get(`${API_BASE}/predict?symbol=${symbol}`)
      ]);
      
      // Validate data immediately to prevent Infinity/NaN errors
      const validatedData = historicalRes.data.map(item => ({
        ...item,
        close: parseFloat(item.close) || 0,
        open: parseFloat(item.open) || 0,
        high: parseFloat(item.high) || 0,
        low: parseFloat(item.low) || 0
      }));
      
      setHistoricalData(validatedData);
      setPrediction(predictionRes.data);
    } catch (err) {
      setError('Failed to load stock data');
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Tooltip handling with index adjustment for reversed data
  const handleDataPointClick = useCallback(({ value, index, x, y }) => {
    // Adjust index for reversed data
    const actualIndex = historicalData.length - index - 1;
    const date = historicalData[actualIndex]?.datetime || '';
    const price = parseFloat(value).toFixed(2);
    
    // Adjust tooltip position to stay within screen bounds
    const adjustedX = x > screenWidth - 150 ? x - 150 : x;
    const adjustedY = y > 180 ? y - 80 : y + 20;
    
    setSelectedPoint({ date, price, index });
    setTooltipPosition({ x: adjustedX, y: adjustedY });
  }, [historicalData]);

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

        {/* Dropdown List */}
        {searchQuery.length > 0 && (
          <View style={styles.dropdownWrapper}>
            <FlatList
              nestedScrollEnabled={true}
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

      {/* Loading States */}
      {initialLoading ? (
        <View style={styles.fullLoading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Initial Data...</Text>
        </View>
      ) : (
        <>
          {/* Animated Chart Section */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                {selectedStock.name} ({selectedStock.symbol})
              </Text>
              {chartLoading && <ActivityIndicator size="small" color="#007AFF" />}
            </View>

            <LineChart
              ref={chartRef}
              data={animatedChartData}
              width={screenWidth - 50} // Reduced width to avoid overflow
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f8f9fa',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 97, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: { r: '3' },
                yAxisSuffix: '$',
                yAxisInterval: 1 // Optional, defaults to 1
              }}
              bezier
              withDots={currentIndex === historicalData.length}
              withShadow={false}
              withInnerLines={false}
              onDataPointClick={handleDataPointClick}
              getDotColor={(_, index) => 
                selectedPoint?.index === index ? '#FF6B6B' : '#007AFF'
              }
            />
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
                  ${parseFloat(prediction.prediction).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.predictionDate}>
                Updated: {new Date(prediction.last_refreshed || Date.now()).toLocaleDateString()}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Tooltip */}
      {selectedPoint && (
        <View style={[styles.tooltip, { left: tooltipPosition.x, top: tooltipPosition.y }]}>
          <Text style={styles.tooltipDate}>{selectedPoint.date}</Text>
          <Text style={styles.tooltipPrice}>${selectedPoint.price}</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedPoint(null)}
          >
            <Icon name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
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
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  searchContainer: { zIndex: 2, marginBottom: 20 },
  searchInput: {
    height: 50, backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 15,
    fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0',
  },
  dropdownWrapper: {
    position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: 'white',
    borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', maxHeight: 180, elevation: 3, zIndex: 3,
  },
  dropdownList: {
    maxHeight: 180,
  },
  stockItem: {
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  stockSymbol: { fontSize: 16, fontWeight: '600', color: '#007AFF', width: '25%' },
  stockName: { fontSize: 14, color: '#666', width: '70%' },
  chartContainer: {
    backgroundColor: 'white', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chartTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  placeholder: { height: 220, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#999', fontSize: 16, marginTop: 10 },
  predictionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginTop: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  predictionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  predictionTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginLeft: 8 },
  predictionContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  predictionLabel: { fontSize: 16, color: '#666' },
  predictionValue: { fontSize: 24, fontWeight: '700', color: '#4CAF50' },
  predictionDate: { fontSize: 12, color: '#999', marginTop: 8, fontStyle: 'italic' },
  fullLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 12, borderRadius: 8, marginTop: 20 },
  errorText: { color: '#FF3B30', marginLeft: 8 },
  noResults: { padding: 15, color: '#999', textAlign: 'center' },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  tooltipDate: { color: '#fff', marginRight: 8, fontSize: 12 },
  tooltipPrice: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  closeButton: { marginLeft: 8, backgroundColor: '#FF6B6B', borderRadius: 10, padding: 4 },
});

export default StockDetails;
