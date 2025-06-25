// components/Menu.tsx
import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Menu.css';
import { playClickSound } from '../lib/utils';

const Menu: React.FC = () => {
  const history = useHistory();

  const handleRouting = async (route: string) => {
      await playClickSound('apple');
      history.push(route);
  }
  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem button onClick={() => handleRouting('/dashboard')}>
            <IonLabel>Alerts</IonLabel>
          </IonItem>
          <IonItem button onClick={() => handleRouting('/settings')}>
            <IonLabel>Settings</IonLabel>
          </IonItem>
          <IonItem button onClick={() => handleRouting('/map')}>
            <IonLabel>Map</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
