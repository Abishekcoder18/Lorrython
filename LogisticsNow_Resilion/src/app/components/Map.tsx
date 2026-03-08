import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 }, // India center
      zoom: 5,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControl: true,
      gestureHandling: "greedy",
    });

    const stored = sessionStorage.getItem("laneAnalysisResults");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    console.log("✅ Map loading lanes from:", parsed);

    const lanes = parsed?.lane_intelligence?.lane_summary || [];

    if (lanes.length === 0) {
      console.log("⚠️ No lanes found in backend data");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();
    const cityCache: Record<string, any> = {};

    // Helper function to geocode city names
    const getLatLng = async (city: string): Promise<any> => {
      return new Promise((resolve) => {
        if (cityCache[city]) {
          resolve(cityCache[city]);
          return;
        }

        geocoder.geocode({ address: city + ", India" }, (results: any, status: string) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            cityCache[city] = location;
            resolve(location);
          } else {
            console.warn(`Geocoding failed for ${city}: ${status}`);
            resolve(null);
          }
        });
      });
    };

    // Process all lanes
    const processLanes = async () => {
      for (const lane of lanes) {
        const [origin, destination] = lane.lane_id.split("_");
        if (!origin || !destination) continue;

        const originLatLng = await getLatLng(origin);
        const destLatLng = await getLatLng(destination);

        if (!originLatLng || !destLatLng) continue;

        const volume = lane.lane_volume || 1;
        const savings = lane.savings_percentage || 0;

        // Draw polyline between cities
        const polyline = new window.google.maps.Polyline({
          path: [originLatLng, destLatLng],
          geodesic: true,
          strokeColor: savings > 0 ? "#16a34a" : "#dc2626",
          strokeOpacity: 0.9,
          strokeWeight: Math.max(2, Math.min(8, volume / 5)),
        });

        polyline.setMap(map);

        // Add origin marker
        new window.google.maps.Marker({
          position: originLatLng,
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: origin,
        });

        // Add destination marker
        new window.google.maps.Marker({
          position: destLatLng,
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#dc2626",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: destination,
        });

        // Extend bounds
        bounds.extend(originLatLng);
        bounds.extend(destLatLng);

        // Create info window for hover
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-size:14px; padding:8px;">
              <strong style="color:#333;">${origin} → ${destination}</strong><br/>
              <div style="margin-top:4px;">
                <span style="color:#666;">Volume:</span> 
                <span style="font-weight:500; color:#2563eb;">${volume.toLocaleString()}</span><br/>
                <span style="color:#666;">Savings:</span> 
                <span style="font-weight:500; ${savings > 0 ? 'color:#16a34a;' : 'color:#dc2626;'}">
                  ${savings > 0 ? '+' : ''}${savings.toFixed(2)}%
                </span>
              </div>
            </div>
          `,
        });

        // Add hover listeners
        polyline.addListener("mouseover", () => {
          infoWindow.setPosition(originLatLng);
          infoWindow.open(map);
        });

        polyline.addListener("mouseout", () => {
          infoWindow.close();
        });
      }

      // Fit bounds after all geocoding is done
      setTimeout(() => {
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
        } else {
          map.setCenter({ lat: 20.5937, lng: 78.9629 });
          map.setZoom(5);
        }
      }, 1000);
    };

    processLanes();

    // ❌ Cleanup removed - Google Maps handles it automatically

  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    />
  );
}