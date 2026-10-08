// src/App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import MeshNetworkService from './services/MeshNetworkService';
import EdgeAIService from './services/EdgeAIService';
import AcousticBeacon from './components/AcousticBeacon';

export default function App() {
  const [nodeId] = useState(`NODE_${Math.floor(Math.random() * 8999 + 1000)}`);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [logs, setLogs] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    // 1. Sensör Dinlemesini ve BLE Mesh Ağını Başlat
    EdgeAIService.startSensorMonitoring();
    MeshNetworkService.startMeshNode(nodeId, (incomingPacket) => {
      addLog(`[AĞ] Paket Alındı/İletildi: ID ${incomingPacket.id} | Öncelik: ${incomingPacket.priority}`);
    });

    addLog(`Düğüm Başlatıldı: ${nodeId}`);

    return () => {
      EdgeAIService.stopMonitoring();
      MeshNetworkService.stopMesh();
    };
  }, []);

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 20)]);
  };

  const handleSOS = () => {
    const newState = !isSOSActive;
    setIsSOSActive(newState);

    if (newState) {
      // Edge AI ile durum değerlendirmesi yap (%80 pil varsayımıyla)
      const evaluation = EdgeAIService.evaluateVictimStatus(0.80);
      setAiStatus(evaluation);

      const sosPacket = {
        id: `PKT_${Date.now()}`,
        sender: nodeId,
        priority: evaluation.priorityScore,
        status: evaluation.statusMessage,
        gps: { lat: 41.0082, lng: 28.9784 }, // Offline saklanan son bilinen konum
        hopCount: 0
      };

      addLog(`🚨 SOS Tetiklendi! Öncelik Skoru: ${evaluation.priorityScore}/5`);
      MeshNetworkService.broadcastPacket(sosPacket);
    } else {
      addLog("SOS Durduruldu.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DepremMesh AI</Text>
        <Text style={styles.subtitle}>ID: {nodeId} | Mesh Status: OK</Text>
      </View>

      <TouchableOpacity 
        style={[styles.sosButton, isSOSActive && styles.sosActive]} 
        onPress={handleSOS}
      >
        <Text style={styles.sosText}>{isSOSActive ? "SOS YAYINLANIYOR" : "SOS TETİKLE"}</Text>
      </TouchableOpacity>

      {aiStatus && (
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>On-Device AI Analiz Sonucu:</Text>
          <Text style={styles.aiText}>{aiStatus.statusMessage}</Text>
        </View>
      )}

      <AcousticBeacon isEmergencyActive={isSOSActive} />

      <Text style={styles.logTitle}>Ağ & Protokol İletim Logları</Text>
      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 15 },
  header: { marginBottom: 15, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ff4757' },
  subtitle: { color: '#888', fontSize: 12 },
  sosButton: { backgroundColor: '#ff4757', padding: 25, borderRadius: 12, alignItems: 'center', marginVertical: 10 },
  sosActive: { backgroundColor: '#2ed573' },
  sosText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  aiCard: { backgroundColor: '#1e272e', padding: 12, borderRadius: 8, marginVertical: 5 },
  aiTitle: { color: '#eccc68', fontWeight: 'bold', fontSize: 12 },
  aiText: { color: '#fff', fontSize: 13, marginTop: 4 },
  logTitle: { color: '#fff', marginTop: 15, fontWeight: 'bold' },
  logContainer: { flex: 1, backgroundColor: '#000', borderRadius: 8, padding: 10, marginTop: 5 },
  logText: { color: '#00ff00', fontSize: 11, fontFamily: 'monospace', marginBottom: 4 }
});