'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function ServiceWorkerRegistrar() {
  const { status } = useSession();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && status === 'authenticated') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (reg) => {
          console.log('[SW] Registered:', reg.scope);
          
          // Request notification permission and subscribe
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!VAPID_KEY) return;

            const subscription = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
            });

            // Send to backend
            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription }),
            });
          }
        })
        .catch((err) => console.warn('[SW] Registration failed:', err));
    } else if ('serviceWorker' in navigator && status !== 'authenticated') {
      // Just register without push if not logged in
      navigator.serviceWorker.register('/sw.js').catch(console.warn);
    }
  }, [status]);

  return null;
}
