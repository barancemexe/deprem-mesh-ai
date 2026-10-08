// src/components/AcousticBeacon.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function AcousticBeacon({ isEmergencyActive }) {
  const [sound, setSound] = useState(null);
  const [isBeeping, setIsBeeping] = useState(false);

  async function playRescueFrequency() {
    setIsBeeping(true);
    // Enkaz altı dinleme cihazlarının en net yakaladığı 3.5kHz Darbeli Ses Tonu Simülasyonu
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
      { shouldPlay: true, volume: 1.0 }
    );
    setSound(sound);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsBeeping(false);
      }
    });
  }

  useEffect(() => {
    let interval;
    if (isEmergencyActive) {
      // Pil tasarrufu için her 10 saniyede bir 1 saniyelik akustik bip yayını yap
      interval = setInterval(() => {
        playRescueFrequency();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isEmergencyActive]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Akustik Radar Beacon</Text>
      <Text style={styles.status}>
        {isBeeping ? "🔊 Sinyal Yayılıyor (3.5 kHz Puls)..." : "💤 Uyku Modunda (10s Döngü)"}
      </Text>
      <TouchableOpacity style={styles.button} onPress={playRescueFrequency}>
        <Text style={styles.btnText}>Manuel Akustik Sinyal Tetikle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#222', borderRadius: 8, marginTop: 10 },
  title: { color: '#ff4757', fontWeight: 'bold', fontSize: 16 },
  status: { color: '#aaa', marginVertical: 8 },
  button: { backgroundColor: '#333', padding: 10, borderRadius: 5, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 12 }
});