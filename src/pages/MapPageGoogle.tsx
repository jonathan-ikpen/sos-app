// pages/MapPage.tsx
import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/react';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { logOutOutline } from 'ionicons/icons';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import './map.css';
import { MuteButton } from '../components/MuteButton';
import { playClickSound } from '../lib/utils';

// Get params from URL
interface RouteParams {
  lat: string;
  lng: string;
}

interface LocationTypes {
    latitude: string;
    longitude: string;
    resolved: string;
    timestamp: { seconds: number; nanoseconds: number };
}

const MapPageGoogle: React.FC = () => {
  const { lat, lng } = useParams<RouteParams>();
  const location = useLocation<LocationTypes>();
  const history = useHistory();

  const latitude = parseFloat(lat || location?.state?.latitude);
  const longitude = parseFloat(lng || location?.state?.longitude);
  const timestamp = location?.state?.timestamp;

  console.log(timestamp);

  const isValidCoords = !isNaN(latitude) && !isNaN(longitude);

  const handleLogout = async () => {
      await playClickSound('apple');
      await signOut(auth);
      history.replace('/login');
  };

  const handleRouteBack = async () => {
    await playClickSound('apple');
    history.goBack();
  }

  if (!isValidCoords) {
    return (
      <IonPage id="main">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Invalid Location</IonTitle>
            <IonButtons slot="end">
                <MuteButton />
                <IonButton onClick={handleLogout} color="white">
                    <IonIcon icon={logOutOutline} slot="icon-only" />
                </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
            <div className='map-container'>
                <p>⚠️ No valid coordinates provided.</p>
                <IonButton expand="block" onClick={() => handleRouteBack()}>
                    Go Back
                </IonButton>
            </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>📍 Alert Location</IonTitle>
          <IonButtons slot="end">
            <MuteButton />
            <IonButton onClick={handleLogout} color="white">
                <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className='map-container'>
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
          ></iframe>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MapPageGoogle;
