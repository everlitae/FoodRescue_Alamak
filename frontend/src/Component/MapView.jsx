import { useEffect, useRef } from "react";
import L from "leaflet";

// ── User location pin ──
const userPinHTML = `
<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 10px rgba(224,80,80,0.5));">
  <div style="
    width:18px;height:18px;border-radius:50%;
    background:linear-gradient(135deg,#e05050,#ff7070);
    border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(224,80,80,0.2);
  "></div>
</div>`;

const userIcon = L.divIcon({
  html: userPinHTML,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ── Donation food marker ──
function makeFoodIcon(emoji) {
  return L.divIcon({
    html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 8px rgba(95,139,76,0.45));">
      <div style="
        width:36px;height:36px;border-radius:50% 50% 0 50%;transform:rotate(-45deg);
        background:linear-gradient(135deg,#5f8b4c,#7aaf60);
        border:3px solid #fff;
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:15px;line-height:1;display:block;">${emoji || "🍱"}</span>
      </div>
    </div>`,
    className: "",
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -44],
  });
}

function injectMapStyles() {
  if (document.getElementById("fr-leaflet-styles")) return;
  const s = document.createElement("style");
  s.id = "fr-leaflet-styles";
  s.textContent = `
    .leaflet-control-zoom {
      border:none !important;
      border-radius:10px !important;
      overflow:hidden;
      box-shadow:0 2px 12px rgba(60,100,40,0.18) !important;
    }
    .leaflet-control-zoom a {
      width:34px !important; height:34px !important; line-height:34px !important;
      font-size:18px !important; font-weight:400 !important;
      color:#3b5830 !important; background:#fff !important;
      border:none !important;
      border-bottom:1px solid rgba(95,139,76,0.12) !important;
      transition:background 0.15s,color 0.15s !important;
    }
    .leaflet-control-zoom a:last-child { border-bottom:none !important; }
    .leaflet-control-zoom a:hover { background:#eef7e6 !important; color:#5f8b4c !important; }
    .leaflet-popup-content-wrapper {
      border-radius:12px !important;
      border:1px solid rgba(95,139,76,0.18) !important;
      box-shadow:0 4px 20px rgba(60,100,40,0.14) !important;
      padding:0 !important; overflow:hidden;
    }
    .leaflet-popup-content { margin:0 !important; }
    .leaflet-popup-tip { background:#fff !important; box-shadow:none !important; }
    .leaflet-popup-close-button { color:#6b8c5a !important; font-size:18px !important; padding:6px 8px !important; right:4px !important; top:4px !important; }
    .leaflet-attribution-flag { display:none !important; }
  `;
  document.head.appendChild(s);
}

function MapView({ donations, userPos }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;
    injectMapStyles();

    const init = () => {
      if (
        !containerRef.current?.offsetWidth ||
        !containerRef.current?.offsetHeight
      ) {
        requestAnimationFrame(init);
        return;
      }

      const map = L.map(containerRef.current, { zoomControl: false }).setView(
        [3.5952, 98.6722],
        12,
      );
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
    };

    requestAnimationFrame(init);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !userPos) return;
    try {
      if (userMarkerRef.current)
        mapRef.current.removeLayer(userMarkerRef.current);
      const userLatLng = [userPos.lat, userPos.lng];
      mapRef.current.setView(userLatLng, 13);
      userMarkerRef.current = L.marker(userLatLng, { icon: userIcon }).addTo(
        mapRef.current,
      ).bindPopup(`
          <div style="padding:10px 12px;font-family:inherit;">
            <p style="margin:0 0 2px;font-weight:700;font-size:13px;color:#1a2e14;">Lokasi Kamu</p>
            <p style="margin:0;font-size:11px;color:#6b8c5a;">${userPos.accuracy ? `Akurasi ±${Math.round(userPos.accuracy)}m` : "Terdeteksi"}</p>
          </div>
        `);
    } catch {}
  }, [userPos]);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => {
      try {
        mapRef.current.removeLayer(m);
      } catch {}
    });
    markersRef.current = [];

    donations.forEach((d) => {
      const coords = d.pickup_location?.coordinates;
      if (!coords || (coords[0] === 0 && coords[1] === 0)) return;
      try {
        const emoji = d.category_id?.icon_emoji || "🍱";
        const marker = L.marker([coords[1], coords[0]], {
          icon: makeFoodIcon(emoji),
        }).addTo(mapRef.current).bindPopup(`
            <div style="padding:12px 14px;font-family:inherit;min-width:160px;">
              <p style="margin:0 0 4px;font-weight:700;font-size:13px;color:#1a2e14;">${emoji} ${d.title}</p>
              <p style="margin:0 0 2px;font-size:11px;color:#6b8c5a;">📍 ${d.pickup_city}</p>
              <p style="margin:0 0 8px;font-size:11px;color:#6b8c5a;">📦 ${d.quantity_remaining} ${d.quantity_unit} tersisa</p>
              <a href="/donations/${d._id}" style="display:inline-block;padding:4px 12px;background:linear-gradient(90deg,#5f8b4c,#7aaf60);color:#fff;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;">Lihat Detail →</a>
            </div>
          `);
        markersRef.current.push(marker);
      } catch {}
    });
  }, [donations]);

  const focusToUser = () => {
    if (!mapRef.current || !userPos) return;
    mapRef.current.flyTo(
      [userPos.lat, userPos.lng],
      Math.max(mapRef.current.getZoom(), 15),
      { duration: 0.5 },
    );
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* Locate button */}
      <button
        onClick={focusToUser}
        title="Fokus ke lokasi saya"
        style={{
          position: "absolute",
          bottom: 108,
          right: 10,
          zIndex: 1000,
          width: 34,
          height: 34,
          borderRadius: 8,
          background: "#fff",
          border: "1px solid rgba(95,139,76,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: userPos ? "pointer" : "not-allowed",
          opacity: userPos ? 1 : 0.45,
          boxShadow: "0 2px 12px rgba(60,100,40,0.18)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (userPos) e.currentTarget.style.background = "#eef7e6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff";
        }}
      >
        <i
          className="bi bi-crosshair"
          style={{ fontSize: 15, color: userPos ? "#5f8b4c" : "#9ab88a" }}
        />
      </button>
    </div>
  );
}

export default MapView;
