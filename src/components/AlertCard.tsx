import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { checkmarkDoneOutline } from 'ionicons/icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { playClickSound } from '../lib/utils';
import './AlertCard.css';

interface Alert {
  id: string;
  latitude: number;
  longitude: number;
  resolved: boolean;
  timestamp: { seconds: number; nanoseconds: number };
}

const AlertCard: React.FC<{ alert: Alert; onResolve: () => void }> = ({ alert, onResolve }) => {
  const history = useHistory();

  const markAsResolved = async () => {
    playClickSound('pop').then(async () => {
      await updateDoc(doc(db, 'alerts', alert.id), { resolved: true });
      onResolve();
    }).finally(async () => {
      await updateDoc(doc(db, 'alerts', alert.id), { resolved: true });
      onResolve();
    });
    
  };

  const handleMap = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    e.preventDefault();
    await playClickSound('apple');

    history.push({
      pathname: `/map/${alert.latitude}/${alert.longitude}`,
      state: {
        latitude: alert.latitude,
        longitude: alert.longitude,
        resolved: alert.resolved,
        timestamp: alert.timestamp,
      }
    })
  };

  return (
    <IonCard style={{ borderLeft: alert.resolved ? '5px solid var(--ion-color-success)' : '5px solid var(--ion-color-danger)' }} color={alert.resolved ? 'light' : ''}>
      <IonCardHeader>
        <IonCardTitle>
          {alert.resolved ? '✅ Resolved Alert' : '🚨 Unresolved Alert'}
        </IonCardTitle>
        <IonCardSubtitle>
          {new Date(alert.timestamp.seconds * 1000).toLocaleString()}
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <p>
          <strong>Location: </strong>
          <a
            href={`/map/${alert.latitude}/${alert.longitude}`}
            onClick={(alert) => handleMap(alert)}
          >
            Open in Maps
          </a>
        </p>
        {!alert.resolved && (
          <IonButton color="success" onClick={markAsResolved} expand="block">
            <IonIcon icon={checkmarkDoneOutline} slot="start" />
            Mark as Resolved
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default AlertCard;
