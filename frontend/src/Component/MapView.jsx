import { useEffect, useRef } from "react";
import L from "leaflet";

function MapView({ donations, userPos }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // 🔥 INIT MAP (cukup 1 invalidate)
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(containerRef.current).setView([3.5952, 98.6722], 12);
    mapRef.current = map;

    // ✅ cukup ini saja
    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 🔥 ResizeObserver (paling penting)
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // 🔥 Update posisi user
  useEffect(() => {
    if (!mapRef.current || !userPos) return;

    try {
      if (userMarkerRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
      }

      const userLatLng = [userPos.lat, userPos.lng];
      mapRef.current.setView(userLatLng, 13);

      userMarkerRef.current = L.marker(userLatLng, {
        icon: L.divIcon({
          html: "📍",
          className: "",
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      })
        .addTo(mapRef.current)
        .bindTooltip("Lokasi Kamu", {
          permanent: false,
          direction: "top",
          offset: [-5, -25],
          opacity: 0.9,
          className: "custom-tooltip"
        });
    } catch (e) {}
  }, [userPos]);

  // 🔥 Update marker donasi
  useEffect(() => {
    if (!mapRef.current) return;

    // hapus marker lama
    markersRef.current.forEach((m) => {
      try {
        mapRef.current.removeLayer(m);
      } catch (e) {}
    });
    markersRef.current = [];

    // tambah marker baru
    donations.forEach((d) => {
      const coords = d.pickup_location?.coordinates;
      if (!coords || (coords[0] === 0 && coords[1] === 0)) return;

      try {
        const marker = L.marker([coords[1], coords[0]])
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="min-width:150px">
              <strong>${d.category_id?.icon_emoji || "🍱"} ${d.title}</strong><br/>
              <small>${d.pickup_city}</small><br/>
              <small>${d.quantity_remaining} ${d.quantity_unit} tersisa</small><br/>
              <a href="/donations/${d._id}" style="color:#0d6efd">Lihat Detail →</a>
            </div>
          `);

        markersRef.current.push(marker);
      } catch (e) {}
    });
  }, [donations]);

  const focusToUser = () => {
    if (!mapRef.current || !userPos) return;

    const currentZoom = mapRef.current.getZoom();

    const targetZoom = currentZoom < 15 ? 15 : currentZoom;

    mapRef.current.flyTo([userPos.lat, userPos.lng], targetZoom, {
      duration: 0.5,
    });
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
    <div
      ref={containerRef}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "8px",
        
      }}
    />
        <button
      onClick={focusToUser} 
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px 10px",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      📍
    </button>
  </div>
  );
}

export default MapView;