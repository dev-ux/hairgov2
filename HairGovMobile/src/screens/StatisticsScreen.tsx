import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const StatisticsScreen = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width - 32;
  
  const servicesData = [
    {
      name: 'Coupes',
      population: 12,
      color: '#FF6384',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Coloration',
      population: 8,
      color: '#36A2EB',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Soins',
      population: 5,
      color: '#FFCE56',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  const stats = [
    { title: 'Rendez-vous ce mois', value: '8' },
    { title: 'Dépenses totales', value: '240 €' },
    { title: 'Services préférés', value: 'Coupe homme' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* En-tête personnalisé avec bouton de retour */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistiques</Text>
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Récapitulatif des services</Text>
        <PieChart
          data={servicesData}
          width={screenWidth}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default StatisticsScreen;
