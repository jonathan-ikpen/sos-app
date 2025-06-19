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
  // IonItem,
} from '@ionic/react';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import './settings.css';

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>📞 Emergency Contact Settings</IonTitle>
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
          <IonButton color="medium" expand="block" onClick={() => history.push('/dashboard')} className="ion-margin-top">
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
