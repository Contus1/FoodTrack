import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import supabase from "../utils/supabaseClient";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState("default");
  const [subscription, setSubscription] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  // TEMPORARILY DISABLED - Check notification permission on mount
  // useEffect(() => {
  //   if ("Notification" in window) {
  //     setPermission(Notification.permission);
  //   }
  // }, []);

  // TEMPORARILY DISABLED - Show prompt 3 seconds after user logs in (simple UX)
  // useEffect(() => {
  //   if (user && permission === "default") {
  //     const timer = setTimeout(() => {
  //       setShowPrompt(true);
  //     }, 3000); // Wait 3 seconds after login

  //     return () => clearTimeout(timer);
  //   }
  // }, [user, permission]);

  // TEMPORARILY DISABLED - Request notification permission
  const requestPermission = async () => {
    // Disabled for now
    console.log("Notifications are temporarily disabled");
    setShowPrompt(false);
    return false;
    
    /* ORIGINAL CODE - COMMENTED OUT
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return false;
    }

    if (!("serviceWorker" in navigator)) {
      alert("This browser does not support service workers");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === "granted") {
        await subscribeToPush();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
    */
  };

  // TEMPORARILY DISABLED - Subscribe to push notifications
  const subscribeToPush = async () => {
    // Disabled for now
    console.log("Push notifications are temporarily disabled");
    return;
    
    /* ORIGINAL CODE - COMMENTED OUT
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;

      // Generate VAPID keys at: https://web-push-codelab.glitch.me/
      // For now, using a placeholder - you'll need to generate your own
      const vapidPublicKey =
        process.env.REACT_APP_VAPID_PUBLIC_KEY ||
        "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to Supabase
      const { data, error } = await supabase
        .from("push_subscriptions")
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
            auth: arrayBufferToBase64(subscription.getKey("auth")),
          },
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) throw error;

      setSubscription(subscription);
      console.log("✅ Push subscription saved:", data);
    } catch (error) {
      console.error("Error subscribing to push:", error);
    }
    */
  };

  // Dismiss the permission prompt
  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  // Load notifications from Supabase
  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // TEMPORARILY DISABLED - Load notifications when user logs in
  // useEffect(() => {
  //   if (user) {
  //     loadNotifications();

  //     // Set up real-time subscription for new notifications
  //     const subscription = supabase
  //       .channel("notifications")
  //       .on(
  //         "postgres_changes",
  //         {
  //           event: "INSERT",
  //           schema: "public",
  //           table: "notifications",
  //           filter: `user_id=eq.${user.id}`,
  //         },
  //         (payload) => {
  //           console.log("New notification received:", payload.new);
  //           setNotifications((prev) => [payload.new, ...prev]);
  //           setUnreadCount((prev) => prev + 1);

  //           // Show in-app notification if browser doesn't support push
  //           if (permission !== "granted" && "Notification" in window) {
  //             // Could show a toast here
  //           }
  //         },
  //       )
  //       .subscribe();

  //     return () => {
  //       subscription.unsubscribe();
  //     };
  //   }
  // }, [user, permission]);

  const value = {
    permission,
    subscription,
    notifications,
    unreadCount,
    showPrompt,
    requestPermission,
    dismissPrompt,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Helper functions
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
