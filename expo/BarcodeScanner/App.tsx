import { View, Text, StyleSheet, Vibration, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://10.164.60.99:5000/api/scan';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to Scan...');

  const handleBarcodeScanned = async (result: any) => {
    if (scanned) return;

    setScanned(true);
    Vibration.vibrate(100);
    setStatusMessage('Processing...');

    const enrollmentNumber = result.data;

    try {
      const response = await axios.post(API_URL, {
        enrollmentNumber: enrollmentNumber,
      }, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      });


      if (response.data.success) {
        setScanResult({
          name: response.data.data.student.name,
          enrollmentNumber: response.data.data.student.enrollmentNumber,
          action: response.data.data.action
        });
        setStatusMessage('Success!');
        Vibration.vibrate([0, 100, 50, 100]);
      } else {
        setError(response.data.message || 'Scan failed');
        setStatusMessage('Scan Failed');
        Vibration.vibrate(500);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 429) {
        setError('⏳ Cooldown Active (Wait 5s)');
        setStatusMessage('Ignored (Cooldown)');
        Vibration.vibrate(200);
      } else {
        setError('Network/Server Error');
        setStatusMessage('Error');
        Vibration.vibrate(500);
      }
    } finally {
      setTimeout(() => {
        setScanned(false);
        setScanResult(null);
        setError(null);
        setStatusMessage('Ready to Scan...');
      }, 3000);
    }
  };

  if (!permission) return <View style={styles.center}><Text>Requesting permissions...</Text></View>;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white', marginBottom: 20 }}>Camera permission is required</Text>
        <Text style={{ color: 'cyan' }} onPress={requestPermission}>Grant Permission</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'code128', 'code39'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        <View style={styles.scanFrame} />
      </View>

      <View style={styles.statusContainer}>
        {!scanResult && !error && (
          <Text style={styles.statusTextLarge}>{statusMessage}</Text>
        )}

        {/* Success State */}
        {scanResult && (
          <View style={styles.resultBox}>
            <Text style={styles.studentName}>{scanResult.name}</Text>

            <Text style={styles.paramLabel}>ID</Text>
            <Text style={styles.idText}>{scanResult.enrollmentNumber}</Text>

            <View style={styles.actionBadge}>
              <Text style={styles.actionText}>{scanResult.action}</Text>
            </View>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.resultBox}>
            <Text style={styles.errorTextLarge}>❌</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  cameraContainer: {
    height: '50%',
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 4,
    borderColor: '#333'
  },
  scanFrame: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: '60%',
    height: '50%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12
  },
  statusContainer: {
    height: '50%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  statusTextLarge: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 1
  },
  resultBox: {
    alignItems: 'center',
    width: '100%'
  },
  paramLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 15,
    fontWeight: '700',
    letterSpacing: 1
  },
  studentName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  idText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20
  },
  actionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 50
  },
  actionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2
  },
  errorTextLarge: {
    fontSize: 50,
    marginBottom: 10
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600'
  }
});
