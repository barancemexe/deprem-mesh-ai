// src/services/EdgeAIService.js
import { Accelerometer } from 'expo-sensors';

class EdgeAIService {
  constructor() {
    this.accelerometerData = { x: 0, y: 0, z: 0 };
    this.motionHistory = [];
    this.isMonitoring = false;
  }

  startSensorMonitoring() {
    this.isMonitoring = true;
    Accelerometer.setUpdateInterval(1000); // 1 saniyede bir veri oku
    
    this._subscription = Accelerometer.addListener(data => {
      this.accelerometerData = data;
      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      
      this.motionHistory.push(magnitude);
      if (this.motionHistory.length > 30) {
        this.motionHistory.shift(); // Son 30 saniyelik hareket verisini tut
      }
    });
  }

  // Edge AI Önceliklendirme Algoritması
  evaluateVictimStatus(batteryLevel) {
    // Son 30 saniyedeki hareket varyansını hesapla
    const avgMagnitude = this.motionHistory.reduce((a, b) => a + b, 0) / (this.motionHistory.length || 1);
    const variance = this.motionHistory.reduce((a, b) => a + Math.pow(b - avgMagnitude, 2), 0) / (this.motionHistory.length || 1);

    const isStationary = variance < 0.02; // Hareketsizlik tespiti (Enkaz zede bilinci kapalı/sıkışmış)
    
    let priorityScore = 1; // 1: Düşük, 5: Aşırı Kritik
    let statusMessage = "Normal";

    if (isStationary && batteryLevel < 0.15) {
      priorityScore = 5;
      statusMessage = "KRİTİK: Hareketsiz Enkaz-Zede + Düşük Pil (Ultra Power Saver Active)";
    } else if (isStationary) {
      priorityScore = 4;
      statusMessage = "YÜKSEK ÖNCELİK: Hareketsiz (Enkaz Altı Potansiyel)";
    } else {
      priorityScore = 2;
      statusMessage = "ORTA: Hareket Algılandı (Mobil Enkaz-Zede)";
    }

    return {
      priorityScore,
      statusMessage,
      isStationary,
      timestamp: new Date().toISOString()
    };
  }

  stopMonitoring() {
    if (this._subscription) this._subscription.remove();
    this.isMonitoring = false;
  }
}

export default new EdgeAIService();