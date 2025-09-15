import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { startEmergencyTone, stopEmergencyTone } from './utils';

interface Alert {
  id: string;
  latitude: number;
  longitude: number;
  resolved: boolean;
  timestamp: { seconds: number; nanoseconds: number };
}

/**
 * Subscribes to the real-time alert list in Firestore.
 * @param db - Your Firestore instance
 * @param callback - Function to call with updated alerts
 * @returns Function to unsubscribe
 */
export const subscribeToAlerts = (
  db: Firestore,
  callback: (alerts: Alert[]) => void
) => {
  const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));
  console.log("Subscribing to alerts & Playing tone on new alert");

  let isInitialSnapshot = true;

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const alerts: Alert[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Alert[];


    let playedForThisSnapshot = false;
    snapshot.docChanges().forEach((change) => {
      if (!isInitialSnapshot && change.type === 'added') {
        startEmergencyTone();
        playedForThisSnapshot = true;
      }
    });

    // after processing the first snapshot mark it so future snapshots trigger sounds
    if (isInitialSnapshot) {
      isInitialSnapshot = false;
    }

    // Optional: auto-stop after 20s if started
    if (playedForThisSnapshot) {
      setTimeout(() => {
        stopEmergencyTone();
      }, 60000);
    }

    callback(alerts);
  });


  return unsubscribe;
};


interface AlertData {
  isOpen: boolean;
  title?: string;
  subheader?: string;
  message?: string;
  buttonText?: string;
  buttonFunc: () => void;
}

export const showIonAlert = ({ isOpen, title, subheader, message, buttonText, buttonFunc }: AlertData) => {

  const alert = document.createElement('ion-alert');

  alert.isOpen = isOpen;
  alert.header = title;
  alert.subHeader = subheader;
  alert.message = message;
  alert.buttons = [
    {
      text: buttonText || 'OK',
      handler: () => {
        buttonFunc();
      }
    }
  ];

  document.body.appendChild(alert);
  return alert.present();
};
