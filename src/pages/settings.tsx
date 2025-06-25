import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonButtons,
  IonMenuButton,
  IonIcon,
  // IonItem,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import './settings.css';
import { playClickSound } from '../lib/utils';
import { MuteButton } from '../components/MuteButton';

const SETTINGS_DOC_ID = 'emergencyContacts';

const Settings: React.FC = () => {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [toast, setToast] = useState(false);

  // Load existing emergency contacts
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      const ref = doc(db, 'settings', SETTINGS_DOC_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setPhone1(data.phone1 || '');
        setPhone2(data.phone2 || '');
        setPhone3(data.phone3 || '');
      }
      setLoading(false);
    };

    fetchContacts();
  }, []);

  // Save contacts globally
  const saveContacts = async () => {
    await playClickSound('apple');
    setLoading(true);
    const ref = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(ref, {
      phone1,
      phone2,
      phone3
    });
    setToast(true);
    setLoading(false);
  };

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
          <IonTitle>📞 Emergency Contact Settings</IonTitle>
          <IonButtons slot="end">
            <MuteButton />
            <IonButton onClick={handleLogout} color="white">
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className='settings-container'>
          <IonInput
            label="Emergency Phone Number 1"
            labelPlacement="floating"
            fill="solid"
            value={phone1}
            onIonInput={(e) => setPhone1(e.detail.value!)}
            type="tel"
          />
          <IonInput
            label="Emergency Phone Number 2"
            labelPlacement="floating"
            fill="solid"
            value={phone2}
            onIonInput={(e) => setPhone2(e.detail.value!)}
            type="tel"
          />
          <IonInput
            label="Emergency Phone Number 3"
            labelPlacement="floating"
            fill="solid"
            value={phone3}
            onIonInput={(e) => setPhone3(e.detail.value!)}
            type="tel"
          />
          <IonButton disabled={loading} expand="block" onClick={saveContacts} className="ion-margin-top">
            {loading ? <IonSpinner color="light" /> : 'Save Contact'}
          </IonButton>
          <IonButton color="medium" expand="block" onClick={() => handleRouteBack()} className="ion-margin-top">
            Go Back
          </IonButton>
        </div>

        <IonToast
          isOpen={toast}
          message="Contacts saved successfully"
          duration={2000}
          onDidDismiss={() => setToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;
