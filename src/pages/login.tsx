import React, { useState } from 'react';
// import { Capacitor } from '@capacitor/core';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  // IonItem,
  IonSpinner,
  // IonLabel,
  IonToast,
} from '@ionic/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase'; // Adjust the path as necessary
import { useHistory } from 'react-router-dom';
import { FirebaseX } from '@awesome-cordova-plugins/firebase-x';
import { setDoc, doc } from 'firebase/firestore';
import "./login.css"

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const history = useHistory();

  const saveFCMToken = async (user: import('firebase/auth').User) => {
    let token: string | null = '';
    try {
        token = await FirebaseX.getToken();
      } catch (err) {
        console.warn(`FirebaseX not available, using mock token in browser: ${err}`);
        token = 'mock-browser-token';
      }
      await setDoc(doc(db, 'admin_tokens', user.uid), {
        token: token,
        email: user.email || '',
        timestamp: new Date(),
      });
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setToastMsg('Login successful!');

      // ✅ Get FCM token and store it in Firestore
      saveFCMToken(user);
      
      history.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
      setToastMsg('Login failed. Check credentials.');
    }
    setLoading(false);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding login-page" fullscreen>
        <div className='login-container'>
          <h2>SOS SECURITY LOGIN</h2>
            <IonInput
              label="Email"
              labelPlacement="floating"
              fill="solid"
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
            <IonInput
              label="password"
              labelPlacement="floating"
              fill="solid"
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          <IonButton expand="block" onClick={handleLogin} className="ion-margin-top">
            {loading ? <IonSpinner color="light" /> : 'Login'}
          </IonButton>
        </div>

        <IonToast
          isOpen={toastMsg !== ''}
          message={toastMsg}
          duration={3000}
          onDidDismiss={() => setToastMsg('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
