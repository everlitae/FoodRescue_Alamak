/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

if (
  typeof document !== "undefined" &&
  !document.getElementById("frs-map-style")
) {
  const s = document.createElement("style");
  s.id = "frs-map-style";
  s.textContent = `@keyframes frs-pulse{0%{transform:scale(0.5);opacity:.9}100%{transform:scale(2.4);opacity:0}}`;
  document.head.appendChild(s);
}

const pickupPinHTML = `
  <div style="position:relative;width:32px;height:40px;display:flex;justify-content:center">
    <div style="width:32px;height:32px;border-radius:50% 50% 50% 4px;transform:rotate(45deg);background:#5f8b4c;border:2.5px solid #3d5e2e;box-shadow:0 4px 12px rgba(95,139,76,0.45)"></div>
    <div style="position:absolute;top:6px;left:6px;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;font-size:11px">📦</div>
  </div>
`;

const btnBase = {
  width: 34,
  height: 34,
  borderRadius: 9,
  background: "white",
  border: "1px solid #dde8d4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  transition: "all 0.15s",
};

function MapBtn({ onClick, children, disabled, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        ...btnBase,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "#eef7e6";
          e.currentTarget.style.borderColor = "#7aaf60";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "white";
        e.currentTarget.style.borderColor = "#dde8d4";
      }}
    >
      {children}
    </button>
  );
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "id" } },
    );
    const data = await res.json();
    const addr = data.address;
    const road = addr.road || addr.pedestrian || addr.footway || "";
    const house = addr.house_number || "";
    const suburb = addr.suburb || addr.village || addr.neighbourhood || "";
    const city = addr.city || addr.town || addr.county || addr.regency || "";
    let address_line = road;
    if (house) address_line += ` No. ${house}`;
    if (suburb) address_line += address_line ? `, ${suburb}` : suburb;
    return { address_line: address_line.trim(), city };
  } catch {
    return null;
  }
}

async function searchPlaces(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=id`,
      { headers: { "Accept-Language": "id" } },
    );
    const data = await res.json();
    return data.map((item) => ({
      display_name: item.display_name,
      short_name: item.name || item.display_name.split(",")[0],
      address: item.address,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
    }));
  } catch {
    return [];
  }
}

const placeIcons = {
  restaurant: "🍽️",
  cafe: "☕",
  fast_food: "🍔",
  hospital: "🏥",
  school: "🏫",
  university: "🎓",
  mall: "🛍️",
  supermarket: "🛒",
  hotel: "🏨",
  mosque: "🕌",
  road: "🛣️",
  residential: "🏘️",
};

function MapPicker({ lat, lng, onChange, onAddress, searchQuery }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const containerRef = useRef(null);
  const searchTimeout = useRef(null);
  const isReversingRef = useRef(false);
  const searchBoxRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [showSugg, setShowSugg] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleLocationChange = async (latlng) => {
    isReversingRef.current = true;
    onChange({ lat: latlng.lat, lng: latlng.lng });
    const result = await reverseGeocode(latlng.lat, latlng.lng);
    if (result && onAddress) {
      onAddress(result);
      setSearchText(result.address_line);
    }
    setTimeout(() => {
      isReversingRef.current = false;
    }, 1000);
  };

  useEffect(() => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([]);
      setShowSugg(false);
      return;
    }
    if (isReversingRef.current) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setSugLoading(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchPlaces(searchText);
      setSuggestions(results);
      setShowSugg(results.length > 0);
      setSugLoading(false);
    }, 500);
  }, [searchText]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 5 || isReversingRef.current)
      return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (isReversingRef.current) return;
      const results = await searchPlaces(searchQuery);
      if (results.length > 0 && mapRef.current && markerRef.current) {
        const r = results[0];
        const ll = L.latLng(r.lat, r.lng);
        markerRef.current.setLatLng(ll);
        mapRef.current.setView(ll, 16);
        onChange({ lat: r.lat, lng: r.lng });
        setTimeout(() => mapRef.current?.invalidateSize(), 200);
      }
    }, 800);
  }, [searchQuery]);

  const handleSelectSuggestion = (place) => {
    setSearchText(place.display_name.split(",").slice(0, 2).join(",").trim());
    setShowSugg(false);
    setSuggestions([]);
    if (mapRef.current && markerRef.current) {
      const ll = L.latLng(place.lat, place.lng);
      markerRef.current.setLatLng(ll);
      mapRef.current.flyTo(ll, 17, { duration: 0.7 });
      onChange({ lat: place.lat, lng: place.lng });
      if (onAddress) {
        const addr = place.address;
        const road = addr?.road || addr?.pedestrian || "";
        const house = addr?.house_number || "";
        const suburb =
          addr?.suburb || addr?.village || addr?.neighbourhood || "";
        const city =
          addr?.city || addr?.town || addr?.county || addr?.regency || "";
        let address_line = road;
        if (house) address_line += ` No. ${house}`;
        if (suburb) address_line += address_line ? `, ${suburb}` : suburb;
        onAddress({
          address_line: address_line.trim() || place.short_name,
          city,
        });
      }
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const ll = L.latLng(pos.coords.latitude, pos.coords.longitude);
        markerRef.current?.setLatLng(ll);
        mapRef.current?.flyTo(ll, 17, { duration: 0.7 });
        await handleLocationChange(ll);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target))
        setShowSugg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (mapRef.current) return;
    const init = () => {
      if (!containerRef.current) return;
      const { offsetWidth, offsetHeight } = containerRef.current;
      if (!offsetWidth || !offsetHeight) {
        requestAnimationFrame(init);
        return;
      }

      const map = L.map(containerRef.current, { zoomControl: false }).setView(
        [lat || 3.5952, lng || 98.6722],
        13,
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([lat || 3.5952, lng || 98.6722], {
        draggable: true,
        icon: L.divIcon({
          html: pickupPinHTML,
          className: "",
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        }),
      }).addTo(map);
      markerRef.current = marker;
      marker.bindPopup("📦 Lokasi pickup").openPopup();
      marker.on("dragend", () => handleLocationChange(marker.getLatLng()));
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        handleLocationChange(e.latlng);
      });
      setTimeout(() => map.invalidateSize(), 100);
    };

    requestAnimationFrame(init);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const h = () => mapRef.current?.invalidateSize();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Search box */}
      <div ref={searchBoxRef} style={{ position: "relative", marginBottom: 8 }}>
        <div style={{ position: "relative" }}>
          <i
            className="bi bi-search"
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--txt4)",
              fontSize: 12,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <input
            className="input-green"
            type="text"
            placeholder="Cari lokasi... (cth: Jl. Sudirman Medan)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: sugLoading ? 38 : 12,
              height: 36,
              borderRadius: 9,
              border: "1px solid var(--border)",
              fontSize: 12,
              fontFamily: "inherit",
              background: "var(--g5)",
              outline: "none",
              boxSizing: "border-box",
              color: "var(--txt)",
            }}
          />
          {sugLoading && (
            <div
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <div
                className="spinner-border spinner-border-sm"
                style={{
                  width: 13,
                  height: 13,
                  color: "var(--g2)",
                  borderWidth: 2,
                }}
              />
            </div>
          )}
        </div>

        {showSugg && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 9999,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              marginTop: 4,
              overflow: "hidden",
              boxShadow: "var(--shadow2)",
            }}
          >
            {suggestions.map((place, i) => (
              <div
                key={i}
                onClick={() => handleSelectSuggestion(place)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "9px 12px",
                  cursor: "pointer",
                  borderBottom:
                    i < suggestions.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--g5)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: "var(--g5)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                  }}
                >
                  {placeIcons[place.type] || "📍"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--txt)",
                      lineHeight: 1.3,
                    }}
                  >
                    {place.short_name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "var(--txt4)",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {place.display_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        <div
          ref={containerRef}
          style={{ height: 280, width: "100%", zIndex: 0 }}
        />

        {/* Zoom */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <MapBtn onClick={() => mapRef.current?.zoomIn()} title="Zoom in">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v12M1 7h12"
                stroke="#3d5e2e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </MapBtn>
          <MapBtn onClick={() => mapRef.current?.zoomOut()} title="Zoom out">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7h12"
                stroke="#3d5e2e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </MapBtn>
        </div>

        {/* Locate */}
        <div
          style={{ position: "absolute", bottom: 14, right: 10, zIndex: 1000 }}
        >
          <MapBtn
            onClick={handleLocateMe}
            disabled={locating}
            title="Lokasi saat ini"
          >
            {locating ? (
              <div
                className="spinner-border spinner-border-sm"
                style={{
                  width: 13,
                  height: 13,
                  color: "#5f8b4c",
                  borderWidth: 2,
                }}
              />
            ) : (
              <i
                className="bi bi-crosshair"
                style={{ fontSize: 15, color: "#5f8b4c" }}
              />
            )}
          </MapBtn>
        </div>
      </div>

      <small
        style={{
          fontSize: 11,
          color: "var(--txt4)",
          marginTop: 6,
          display: "block",
        }}
      >
        <i className="bi bi-info-circle me-1" />
        Cari di atas, klik/drag pin, atau tekan crosshair untuk lokasi saat ini.
      </small>
    </div>
  );
}

export default MapPicker;
