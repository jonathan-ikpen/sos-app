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
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { logOutOutline } from 'ionicons/icons';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import './map.css';
import { playClickSound } from '../lib/utils';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

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

const MapPageLeaflet: React.FC = () => {
  const { lat, lng } = useParams<RouteParams>();
  const location = useLocation<LocationTypes>();
  const history = useHistory();

  const latitude = parseFloat(lat || location?.state?.latitude);
  const longitude = parseFloat(lng || location?.state?.longitude);
  const resolved = location?.state?.resolved;
  const timestamp = location?.state?.timestamp;

  console.log(timestamp);

  const isValidCoords = !isNaN(latitude) && !isNaN(longitude);

  const handleLogout = async () => {
      await playClickSound('apple');
      await signOut(auth);
      history.replace('/login');
  };

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
                <IonButton onClick={handleLogout} color="white">
                    <IonIcon icon={logOutOutline} slot="icon-only" />
                </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
            <div className='map-container'>
                <p>⚠️ No valid coordinates provided.</p>
                <IonButton expand="block" onClick={() => history.goBack()}>
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
            <IonButton onClick={handleLogout} color="white">
                <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className='map-container'>
            <MapContainer
                center={[latitude, longitude]}
                zoom={16}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} icon={customIcon}>
                <Popup>
                <strong>{resolved ? '✅ Resolved' : '🚨 Unresolved'}</strong><br />
                {timestamp ? new Date(timestamp.seconds).toLocaleString() : ''}
                </Popup>
            </Marker>
            </MapContainer>
        </div>
            
      </IonContent>
    </IonPage>
  );
};

export default MapPageLeaflet;
