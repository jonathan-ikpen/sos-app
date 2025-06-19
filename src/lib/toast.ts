interface ToastData {
  title?: string;
  message?: string;
  location?: string;
  stopSound: () => void;
}

export const addNotificationToast = ({ title, message, location, stopSound }: ToastData) => {
  const toast = document.createElement('ion-toast');

  toast.header = title || '🚨 Emergency Alert';
  toast.message = message || 'New SOS alert received.';
  toast.color = 'danger';
  toast.position = 'top';

  // 🛑 Keep toast showing until user interacts
  toast.duration = 0; // No auto-dismiss
  toast.buttons = [
    {
      side: 'end',
      text: 'View',
      handler: () => {
        stopSound();
        if (location) window.open(location, '_blank');
      },
    },
    {
      text: 'Dismiss',
      role: 'cancel',
      handler: () => stopSound(),
    },
  ];

  document.body.appendChild(toast);
  return toast.present();
};
