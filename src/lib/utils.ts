import { History } from 'history';
import { SMS } from '@awesome-cordova-plugins/sms';
import { db } from '../lib/firebase'; // Adjust the path as necessary
import { collection, addDoc, Timestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { FirebaseX } from '@awesome-cordova-plugins/firebase-x';
import { addNotificationToast } from './toast';
// import { showIonAlert } from './alerts';

export async function sendNotifications(locationLink: string) {

    // Fetch all admin FCM tokens from Firestore
    const snapshot = await getDocs(collection(db, 'admin_tokens'));
    const tokens = snapshot.docs.map(doc => doc.data().token);

    fetch("https://sos-backend-tau.vercel.app/api/notification", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tokens,
            locationLink
        })
        })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
            console.log("Notification sent!", data);
            } else {
            console.error("Failed to send notification:", data);
            }
        })
        .catch((err) => {
            console.error("Error:", err);
        });
}

export async function sendSMS(locationLink: string) {
    const message = `HELP ME!! IT'S AN EMERGENCY!!\n\nPlease reach ASAP to the location below:\n${locationLink}`;

    const contacts = await getEmergencyContacts();

    if (!contacts) {
      console.warn('⚠️ No emergency contacts found in Firestore.');
      return;
    }

    const numbers = [contacts.phone1, contacts.phone2, contacts.phone3]
      .filter((num) => !!num);

    if (numbers.length === 0) {
      console.warn('⚠️ All emergency contact numbers are empty.');
      return;
    }
    
    const phoneNumber = localStorage.getItem('emergency_contact') || '08127964509';
    
    
    // 2. Send SMS (only works on real device with SIM)
    if (Capacitor.isNativePlatform()) {
        await SMS.send(phoneNumber, message);
    }

    // 2. Send SMS to each contact
    if (Capacitor.isNativePlatform()) {
      for (const number of numbers) {
        try {
          await SMS.send(number, message);
          console.log(`✅ SMS sent to ${number}`);
        } catch (err) {
          console.error(`❌ Failed to send SMS to ${number}`, err);
        }
      }
    } else {
      console.log('🧪 SMS skipped (not running on native device)');
    }

}

export async function saveToDatabase(latitude: number, longitude: number) {
    // 1. Save to Firestore
    await addDoc(collection(db, 'alerts'), {
        latitude,
        longitude,
        timestamp: Timestamp.now(),
        resolved: false,
    });
}


export async function getGeoLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = coordinates.coords;

    console.log('Current Location:', latitude, longitude);

    const locationLink = `http://maps.google.com/?q=${latitude},${longitude}`;

    return {locationLink, latitude, longitude};
}

export async function playClickSound(choice: 'apple' | 'pop') {

  // 🔊 Play click sound
  if (choice === 'apple') {
    // Use Apple click sound
    const audio = new Audio('/sounds/apple-mouse-click.mp3');
    audio.volume = 1.0;
    await audio.play().catch((err) => console.warn('Audio play failed', err));
    return;
  } else if (choice === 'pop') {
    // Use Pop click sound
    const audio = new Audio('/sounds/suction-pop.mp3');
    audio.volume = 1.0;
    await audio.play().catch((err) => console.warn('Audio play failed', err));
    return;
  }

}


export const setupFCMListener = (history: History) => {
  const sub = FirebaseX.onMessageReceived().subscribe((data) => {
    console.log('FCM Message received:', data);

    // 🔊 Create and play the audio
    const audio = new Audio('/sounds/sos.mp3');
    audio.volume = 1.0;
    audio.loop = true;
    audio.play().catch((err) => console.warn('Audio play failed', err));

    const stopSound = () => {
      audio.pause();
      audio.currentTime = 0; // reset
    };

    if (data.tap) {
      // ✅ Stop sound when notification is tapped
      stopSound();

      if (data.location) {
        window.open(data.location, '_blank');
      } else {
        history.push('/dashboard');
      }

    } else {
      // 🟢 In-app notification while open
      //   alert(`${data.title}\n\n${data.body}`);
      //   if (data.location) {
      //     const confirmOpen = window.confirm('Open location in Google Maps?');
      //     if (confirmOpen) {
      //       stopSound(); // ✅ Stop sound if confirmed
      //       window.open(data.location, '_blank');
      //     }
      //   }

      // showIonAlert({
      //   isOpen: true,
      //   title: data.title,
      //   subheader: data.body,
      //   message: data.location ? `Location: ${data.location}` : '',
      //   buttonText: 'OK',
      //   buttonFunc: () => {
      //     stopSound();
      //     if (data.location) {
      //       showIonAlert({
      //         isOpen: true,
      //         title: 'Open Location',
      //         subheader: 'Do you want to open this location in Google Maps?',
      //         message: data.location,
      //         buttonText: 'Open',
      //         buttonFunc: () => {
      //           window.open(data.location, '_blank');
      //         },
      //       });
      //     }
      //   },
      // });      

     // 🔁 Show toast instead of alert
      addNotificationToast({
        title: data.title,
        message: data.body,
        location: data.location,
        stopSound,
      });
    }
  });

  return () => {
    sub.unsubscribe();
  };
};

export const getEmergencyContacts = async () => {
  const ref = doc(db, 'settings', 'emergencyContacts');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export function muteAllAudio() {
  const mediaElements = Array.from(
    document.querySelectorAll<HTMLMediaElement>('audio, video')
  );

  mediaElements.forEach((el) => {
    try {
      el.muted = true;
      el.volume = 0;
      el.pause();
    } catch (err) {
      console.warn('Failed to mute media element:', err);
    }
  });

  console.log(`[Audio] Muted ${mediaElements.length} media element(s)`);
}

export function unmuteAllAudio() {
  const mediaElements = Array.from(
    document.querySelectorAll<HTMLMediaElement>('audio, video')
  );

  mediaElements.forEach((el) => {
    try {
      el.muted = false;
      el.volume = 1.0;
      // el.play(); // Optional: autoplay if needed
    } catch (err) {
      console.warn('Failed to unmute media element:', err);
    }
  });

  console.log(`[Audio] Unmuted ${mediaElements.length} media element(s)`);
}

