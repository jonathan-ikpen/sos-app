import React, { useState } from 'react';
import { useIonAlert } from '@ionic/react';
import { useHistory } from 'react-router-dom'
// import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonToast,
  IonButton,
  IonFooter,
  IonToolbar,
  IonAlert,
//   IonTitle,
  IonSpinner,
} from '@ionic/react';
import { sendNotifications, sendSMS, saveToDatabase, getGeoLocation } from '../lib/utils';

import './sos.css';

const SOS: React.FC = () => {
  const history = useHistory();
  const [showAlert] = useIonAlert();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState({ title: '', subheader: '', body: '' });

  const handleSOS = async () => {
    setLoading(true);
    try {
      // 1. Get current location
      const { locationLink, latitude, longitude } = await getGeoLocation();

      // 1. Save to Firestore
      saveToDatabase(latitude, longitude);

      // 2. Send SMS (only works on real device with SIM)
      sendSMS(locationLink);

      // 3. Send notifications to admins
      sendNotifications(locationLink);
      

      setShowToast(true);
    } catch (error) {
      console.error('Error during SOS:', error);
      setMessage({ title: 'Error', subheader: '', body: 'Something went wrong. Please check permissions and internet.' });
      setIsOpen(true);
    }
    setLoading(false);
  };

  const handleAdminRouting = () => {
    showAlert({
      header: 'Are you a Security Personnel or Admin?',
      message: 'Only Security Persons and Admins can use this',
      buttons: ['No', { text: 'Yes', handler: () => history.push('/login') }],
      onDidDismiss: () => console.log('alert dismiss'),
    });
  }

  return (
    <IonPage style={{ backgroundColor: '#000', color: '#fff' }}>
      <IonContent fullscreen className="sos-page">
        <div className="sos-container">
          <button
            className="sos-button"
            onClick={handleSOS}
            disabled={loading}
          >
            {loading ? <IonSpinner color="light" /> : 'SOS'}
          </button>
          <p className="sos-label">PRESS THE BUTTON IN CASE OF EMERGENCY</p>
        </div>
      </IonContent>

      <IonFooter className='sos-footer'>
        <IonToolbar>
          <IonButton expand="block" onClick={handleAdminRouting} shape="round" color="medium">
            ADMIN
          </IonButton>
        </IonToolbar>
      </IonFooter>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="SOS Sent Successfully!"
        duration={3000}
      />
      <IonAlert
        isOpen={isOpen}
        header={message.title}
        message={message.body}
        buttons={['Close']}
        onDidDismiss={() => setIsOpen(false)}
      ></IonAlert>
    </IonPage>
  );
};

export default SOS;
