/* eslint-disable no-restricted-globals */
// Service Worker for FoodTrack PWA Notifications

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim()); // Take control immediately
});

// Push notification received
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  let notificationData = {
    title: 'FoodTrack',
    body: 'You have a new notification',
    icon: '/favicon-32x32.svg',
    badge: '/favicon-16x16.svg',
    tag: 'foodtrack-notification',
    requireInteraction: false,
  };

  // Parse the push data
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: data, // Store full data for click handling
        requireInteraction: false,
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();

  // Determine where to navigate
  let urlToOpen = '/';
  
  if (event.notification.data) {
    const data = event.notification.data;
    
    // Route based on notification type
    if (data.type === 'new_post' && data.postId) {
      urlToOpen = `/entry/${data.postId}`;
    } else if (data.type === 'friend_request') {
      urlToOpen = '/profile';
    } else if (data.type === 'stat_update') {
      urlToOpen = '/insights';
    } else if (data.url) {
      urlToOpen = data.url;
    }
  }

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync (optional - for future use)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event);
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Could fetch and cache new notifications here
      Promise.resolve()
    );
  }
});
