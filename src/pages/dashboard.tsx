import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonProgressBar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  IonText,
  IonButton,
  IonIcon,
  IonFooter
} from '@ionic/react';
import { refreshOutline, logOutOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/auth_context';
import { playClickSound, setupFCMListener } from '../lib/utils';
import { subscribeToAlerts } from '../lib/alerts';
import AlertCard from '../components/AlertCard';
import './dashboard.css';
import { Loader } from '../components/Loader';
import { MuteButton } from '../components/MuteButton';

interface Alert {
  id: string;
  latitude: number;
  longitude: number;
  resolved: boolean;
  timestamp: { seconds: number; nanoseconds: number };
}

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const history = useHistory();

  const fetchAlerts = async () => {
    await playClickSound('apple');
    setLoading(true);
    const data = await subscribeToAlerts(db, (updatedAlerts) => {
      setAlerts(updatedAlerts);
      setLoading(false);
    });
    return data;
  };

  const handleRefresh = async (event: CustomEvent) => {
    await playClickSound('pop');
    fetchAlerts().finally(() => event.detail.complete());
  };

  const handleLogout = async () => {
    await playClickSound('apple');
    await signOut(auth);
    history.replace('/login');
  };

  useEffect(() => {
    if (!authLoading && user) {
      const unsubscribeFCM = setupFCMListener(history);
      const unsubscribeAlerts = subscribeToAlerts(db, (updatedAlerts) => {
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
    <IonPage id="main">
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>📍 Emergency Alerts</IonTitle>
          <IonButtons slot="end">
            <MuteButton />
            <IonButton className="hide-on-mobile" onClick={fetchAlerts} color="white">
              <IonIcon icon={refreshOutline} slot="icon-only" />
            </IonButton>
            <IonButton onClick={handleLogout} color="white">
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          {loading && <IonProgressBar type="indeterminate"></IonProgressBar>}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="dashboard-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? <Loader /> : !loading && alerts.length === 0 ? (
          <IonText>No alerts found.</IonText>
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={() => setToastMsg('Alert marked as resolved.')}
            />
          ))
        )}

        <IonToast
          isOpen={toastMsg !== ''}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setToastMsg('')}
        />
      </IonContent>
      <IonFooter translucent={true} collapse="fade" className='hide-on-desktop ion-padding'>
          <IonToolbar>
            <IonButton expand="block" color="primary" onClick={fetchAlerts}>
              <IonIcon icon={refreshOutline} slot="start" />
              Refresh
            </IonButton>
          </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Dashboard;