const socket = io();
    let myId = null;

    socket.on("connect", () => {
      myId = socket.id;
    });

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
          console.error("Location error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    const map = L.map("map").setView([0, 0], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap",
    }).addTo(map);

    const markers = {};

    socket.on("receive-location", (data) => {
      const { id, latitude, longitude } = data;

      if (id === myId) {
        map.setView([latitude, longitude], 16);
      }

      if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
      } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
      }
    });

    
    socket.on("user-disconnected", (id) => {
      if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
      }
    });