self.addEventListener("push", onPush);
self.addEventListener("notificationclick", onNotificationClick);

async function onPush(event) {
  if (event.data) {
    const data = event.data.json();
    const { title, ...rest } = data;

    // Send the push data to the application
    const clients = await self.clients.matchAll();
    clients.forEach((client) => client.postMessage(data));

    await event.waitUntil(
      self.registration.showNotification(title, {
        icon: "/favicon.svg",
        ...rest,
      }),
    );
  }
}

async function onNotificationClick(event) {
  const urlToOpen = new URL(self.location.origin).href;

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      let matchingClient = null;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
}
