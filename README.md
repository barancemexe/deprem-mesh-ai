# 🚨 DepremMesh AI (QuakeGrid AI)

> **Motto:** İnternetsiz, GSM'siz, Yapay Zekâ Destekli Afet İletişim ve Otonom Kurtarma Ağı

[![React Native](https://img.shields.io/badge/React_Native-Expo-blue.svg)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![YC RFS 2026+](https://img.shields.io/badge/YC_RFS-Local--First_AI-orange.svg)](https://www.ycombinator.com/rfs)

## 📌 Proje Hakkında (Problem & Çözüm)
Mevcut afet uygulamaları internet ve GSM baz istasyonları çöktüğünde tamamen işlevsiz kalmaktadır. **DepremMesh AI**, Y Combinator'ın *Local-First Software* ve *Edge AI* vizyonundan ilham alınarak geliştirilmiş; internet olmadan cihazlar arası **BLE (Bluetooth Low Energy) Mesh Ağı** kuran yerelleştirilmiş bir afet iletişim mimarisidir.

---

## 🔥 İnovatif Özellikler (Key Features)

* **🌐 Offline P2P Multi-Hop Routing:** İnternet olmadan verileri cihazdan cihaza sıçratarak (relay) arama-kurtarma dronelarında/ekiplerinde toplar.
* **🧠 On-Device Edge AI Analizi:** Cihazın ivmeölçer ve batarya verilerini analiz ederek enkaz altındaki zedenin durumunu (hareketsizlik/bilinç kapalı) tespit eder ve öncelik skorlar.
* **🔊 Akustik Radar Beacon:** Enkaz dinleme cihazlarına (sismik sensörler) yanıt vermek için pil tasarruflu 3.5kHz akustik ses sinyalleri yayınlar.

---

## 🛠 Proje Mimarisi

```text
[ Enkaz Altı Cihaz ] --(BLE Mesh / Offline)--> [ Komşu Cihazlar ] --(Multi-Hop)--> [ Kurtarma Ekibi / Drone ]
         |
    (Edge AI)
  * Durum Analizi (Hareketsizlik)
  * Pil Optimizasyonu
  * Akıllı Sinyal Darbesi