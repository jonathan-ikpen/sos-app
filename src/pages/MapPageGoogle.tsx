// ...existing code...
import React, { useEffect, useState } from 'react';
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

// Capacitor Geolocation
import { Geolocation } from '@capacitor/geolocation';

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

  const parsedLat = parseFloat(lat || location?.state?.latitude);
  const parsedLng = parseFloat(lng || location?.state?.longitude);
  // const timestamp = location?.state?.timestamp;

  const passedCoordsValid = !isNaN(parsedLat) && !isNaN(parsedLng);

  const [currentLat, setCurrentLat] = useState<number | null>(passedCoordsValid ? parsedLat : null);
  const [currentLng, setCurrentLng] = useState<number | null>(passedCoordsValid ? parsedLng : null);
  const [geoLoading, setGeoLoading] = useState(!passedCoordsValid);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    // if valid coords were passed, nothing to do
    if (passedCoordsValid) return;

    let mounted = true;

    const getDeviceLocation = async () => {
      setGeoLoading(true);
      setGeoError(null);

      // Try Capacitor Geolocation first (native/hybrid)
      try {
        // optional: request permissions on some platforms
        try {
          await Geolocation.requestPermissions();
        } catch (err) {
          // ignore if not needed or already granted
          console.warn('Geolocation permission request failed or not needed:', err);
        }

        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        if (!mounted) return;
        setCurrentLat(pos.coords.latitude);
        setCurrentLng(pos.coords.longitude);
        setGeoLoading(false);
        return;
      } catch (err) {
        console.warn('Capacitor Geolocation failed, falling back to navigator:', err);
      }

      // Fallback to browser geolocation
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (p) => {
            if (!mounted) return;
            setCurrentLat(p.coords.latitude);
            setCurrentLng(p.coords.longitude);
            setGeoLoading(false);
          },
          (err) => {
            if (!mounted) return;
            console.warn('Browser geolocation error:', err);
            setGeoError(err.message || 'Failed to get location');
            setGeoLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setGeoError('Geolocation not available');
        setGeoLoading(false);
      }
    };

    getDeviceLocation();

    return () => {
      mounted = false;
    };
  }, [passedCoordsValid, lat, lng, location?.state]);

  const isValidCoords = currentLat !== null && currentLng !== null && !isNaN(currentLat) && !isNaN(currentLng);

  const handleLogout = async () => {
      await playClickSound('apple');
      await signOut(auth);
      history.replace('/login');
  };

  const handleRouteBack = async () => {
    await playClickSound('apple');
    history.goBack();
  }

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{isValidCoords ? '📍 Alert Location' : 'Invalid Location'}</IonTitle>
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
          {geoLoading ? (
            <div style={{ padding: 16 }}>
              <p>Getting current location…</p>
            </div>
          ) : isValidCoords ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${currentLat},${currentLng}&z=15&output=embed`}
            ></iframe>
          ) : (
            <div style={{ padding: 16 }}>
              <p>⚠️ Could not get valid coordinates: {geoError ?? 'No coordinates provided.'}</p>
              <IonButton expand="block" onClick={handleRouteBack}>
                  Go Back
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MapPageGoogle;