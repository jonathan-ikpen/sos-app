import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonProgressBar,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonSpinner,
  IonFooter,
  IonFab,
  IonFabButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/react';
import { chevronDownCircleOutline, settingsOutline } from 'ionicons/icons';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Adjust the path as necessary
import { useHistory } from 'react-router-dom';
import { setupFCMListener } from '../lib/utils';
import { subscribeToAlerts } from '../lib/alerts';
import { useAuth } from '../context/auth_context'; // Adjust the path as necessary

import { db } from '../lib/firebase'; // Adjust the path as necessary

interface Alert {
  id: string;
  latitude: number;
  longitude: number;
  resolved: boolean;
  timestamp: { seconds: number; nanoseconds: number };
}

const Dashboard: React.FC = () => {
  // inside Dashboard component
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      history.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setLoading(false);
  };

  const fetchAlerts = async () => {
    setLoading(true);
    const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const data: Alert[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Alert[];

    setAlerts(data);
    setLoading(false);
  };

  const markAsResolved = async (id: string) => {
    const alertRef = doc(db, 'alerts', id);
    await updateDoc(alertRef, { resolved: true });
    fetchAlerts(); // refresh list
  };

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    fetchAlerts().finally(() => {
      event.detail.complete();
    });
  }

  useEffect(() => {
    if (!authLoading && user) {
      const unsubscribeFCM = setupFCMListener(history);

      const unsubscribeAlerts = subscribeToAlerts(db, (updatedAlerts) => {
        setLoading(true);
        setAlerts(updatedAlerts);
        setLoading(false);
      });

      return () => {
        unsubscribeFCM?.();
        unsubscribeAlerts();
      };
    }
  }, [user, authLoading, history]);


  return (
    <IonPage>
      <IonHeader id="header">
        <IonToolbar>
          <IonTitle>📍 Emergency Alerts</IonTitle>
          {loading ? <IonProgressBar type="indeterminate"></IonProgressBar> : alerts.length === 0 ? <IonText>No alerts found.</IonText> : null}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="circles"
            refreshingText="Refreshing..."
          ></IonRefresherContent>
        </IonRefresher>
        {!loading && (
          <IonList>
            {alerts.map((alert) => (
              <IonItem key={alert.id} color={alert.resolved ? 'light' : ''}>
                <IonLabel>
                  <p>
                    <strong>Time:</strong>{' '}
                    {new Date(alert.timestamp.seconds * 1000).toLocaleString()}
                  </p>
                  <p>
                    <strong>Location:</strong>{' '}
                    <a
                      href={`http://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Maps
                    </a>
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {alert.resolved ? '✅ Resolved' : '🚨 Unresolved'}
                  </p>

                  {!alert.resolved && (
                    <IonButton
                      size="small"
                      color="success"
                      onClick={() => markAsResolved(alert.id)}
                    >
                      {loading ? <IonSpinner color="light" /> : 'Mark as Resolved'}
                    </IonButton>
                  )}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
        <IonFab slot="fixed" vertical="center" horizontal="end">
          <IonFabButton color="primary" onClick={() => history.push('/settings')}>
            <IonIcon icon={settingsOutline}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
      <IonFooter translucent={true} collapse="fade" className='ion-padding'>
        <IonToolbar>
          <IonButton expand="block" onClick={fetchAlerts}>
            {loading ? <IonSpinner color="light" /> : 'Refresh'}
          </IonButton>
          <IonButton color="medium" expand="block" onClick={handleLogout} style={{ marginTop: '15px' }}>
            {loading ? <IonSpinner color="light" /> : 'Logout'}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Dashboard;
