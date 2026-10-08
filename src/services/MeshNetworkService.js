// src/services/MeshNetworkService.js
import { BleManager } from 'react-native-ble-plx';
import Buffer from 'buffer';

class MeshNetworkService {
  constructor() {
    this.manager = new BleManager();
    this.SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb'; // DepremMesh Özel Servis UUID
    this.CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
    this.connectedPeers = new Map();
    this.seenPacketIds = new Set();
  }

  // BLE Taramasını ve Yayınını Başlat
  startMeshNode(nodeId, onPacketReceived) {
    console.log(`[MeshNode ${nodeId}] Başlatılıyor...`);

    // 1. Etraftaki Diğer Düğümleri (Peers) Tara
    this.manager.startDeviceScan([this.SERVICE_UUID], null, (error, device) => {
      if (error) {
        console.error('BLE Tarama Hatası:', error);
        return;
      }

      if (device && !this.connectedPeers.has(device.id)) {
        this.connectedPeers.set(device.id, device);
        console.log(`[Mesh] Yeni Düğüm Bulundu: ${device.name || device.id}`);
      }
    });

    // 2. Dinleyici Kur (Gelen Paketleri İşle)
    this.onPacketReceivedCallback = onPacketReceived;
  }

  // Paketi Ağda Yayımla / Sıçrat (Relay / Multi-Hop Flood)
  broadcastPacket(packet) {
    if (this.seenPacketIds.has(packet.id)) {
      // Paket zaten bu cihazdan geçti, döngüyü önlemek için iptal et
      return;
    }

    this.seenPacketIds.add(packet.id);
    packet.hopCount = (packet.hopCount || 0) + 1;

    console.log(`[Mesh Relay] Paket Sıçratılıyor (Hop ${packet.hopCount}):`, packet.id);

    // Tüm bağlı komşu cihazlara paketi ilet
    this.connectedPeers.forEach((device) => {
      const payload = Buffer.Buffer.from(JSON.stringify(packet)).toString('base64');
      
      device.connect()
        .then((d) => d.discoverAllServicesAndCharacteristics())
        .then((d) => d.writeCharacteristicWithResponseForService(
          this.SERVICE_UUID,
          this.CHARACTERISTIC_UUID,
          payload
        ))
        .catch((err) => console.log(`[Mesh Transmission Error] ${device.id}:`, err.message));
    });

    if (this.onPacketReceivedCallback) {
      this.onPacketReceivedCallback(packet);
    }
  }

  stopMesh() {
    this.manager.stopDeviceScan();
    this.manager.destroy();
  }
}

export default new MeshNetworkService();