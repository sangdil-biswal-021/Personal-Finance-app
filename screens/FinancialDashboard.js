import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Keyboard } from 'react-native';


const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState(null);
  const [toCurrency, setToCurrency] = useState(null);
  const [convertedData, setConvertedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [forexPairs, setForexPairs] = useState([]);

  // Fetch available forex pairs
  useEffect(() => {
    const fetchForexPairs = async () => {
      try {
        const response = await axios.get('https://stock-backend-seven.vercel.app/available-forex');
        const pairs = response.data.map(item => item.symbol);
        setForexPairs(pairs);
        
        // Extract unique currencies
        const allCurrencies = new Set();
        pairs.forEach(pair => {
          const [from, to] = pair.split('/');
          allCurrencies.add(from);
          allCurrencies.add(to);
        });
        setCurrencies(Array.from(allCurrencies).map(c => ({ label: c, value: c })));
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };
    
    fetchForexPairs();
  }, []);

  const handleConvert = async () => {
    Keyboard.dismiss();
    if (!amount || !fromCurrency || !toCurrency) return;
    if (fromCurrency === toCurrency) {
      alert('Please select different currencies');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://stock-backend-seven.vercel.app/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );
      setConvertedData(response.data);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Converter</Text>
      
      <View style={styles.converterCard}>
        {/* From Section */}
        <View style={styles.currencySection}>
          <Text style={styles.sectionLabel}>From</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={currencies}
            labelField="label"
            valueField="value"
            placeholder="Select currency"
            value={fromCurrency}
            onChange={item => setFromCurrency(item.value)}
            renderLeftIcon={() => (
              <Icon name="monetization-on" size={20} color="#666" style={styles.icon} />
            )}
          />
        </View>

        {/* To Section */}
        <View style={styles.currencySection}>
          <Text style={styles.sectionLabel}>To</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={currencies}
            labelField="label"
            valueField="value"
            placeholder="Select currency"
            value={toCurrency}
            onChange={item => setToCurrency(item.value)}
            renderLeftIcon={() => (
              <Icon name="monetization-on" size={20} color="#666" style={styles.icon} />
            )}
          />
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor="#999"
          />
        </View>

        {/* Convert Button */}
        <TouchableOpacity 
          style={styles.convertButton} 
          onPress={handleConvert}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Convert</Text>
          )}
        </TouchableOpacity>

        {/* Conversion Result */}
        {convertedData && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              {amount} {convertedData.from} = 
            </Text>
            <Text style={styles.resultAmount}>
              {convertedData.converted.toFixed(2)} {convertedData.to}
            </Text>
            <View style={styles.rateContainer}>
              <Text style={styles.rateText}>
                1 {convertedData.from} = {convertedData.rate.toFixed(4)} {convertedData.to}
              </Text>
              <Text style={styles.timestamp}>
                {/* Last updated: {new Date(convertedData.timestamp).toLocaleString()}|| {"api to be added"} */}
                Last updated: {convertedData.timestamp ? new Date(convertedData.timestamp).toLocaleString() : 'api to be added'}

              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  converterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currencySection: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dropdown: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginRight: 10,
  },
  amountSection: {
    marginVertical: 15,
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  convertButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  resultText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 15,
  },
  rateContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  rateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CurrencyConverter;
