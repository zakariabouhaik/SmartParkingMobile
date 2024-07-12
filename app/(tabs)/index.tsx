import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Modal, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface Transaction {
  id: string;
  Mantant: number;
  transactiontype: string;
  paymentStatus: string;
  client: { id: string };
  codeCard: { id: string };
}

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [barcodeData, setBarcodeData] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setBarcodeData(data);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const createTransaction = async () => {
    try {
      const [barCodeCardId, porte, heureEntree] = barcodeData.split(',');
      const clientId = '83a72242-aa44-47ec-8067-73c39eddcb1c'; 

      const response = await fetch(`http://16.171.20.170:8080/Transaction/${clientId}/${barCodeCardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          porte: porte,
          heureEntree: heureEntree
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const createdTransaction = await response.json();
      setTransaction(createdTransaction);
      setShowModal(true);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <View>
          <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
          <Button title={'Create Transaction'} onPress={createTransaction} />
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Transaction Details</Text>
            {transaction && (
              <>
                <Text>ID: {transaction.id}</Text>
                <Text>Amount: {transaction.Mantant}</Text>
                <Text>Type: {transaction.transactiontype}</Text>
                <Text>Status: {transaction.paymentStatus}</Text>
                <Text>Client ID: {transaction.client.id}</Text>
                <Text>Bar Code ID: {transaction.codeCard.id}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});