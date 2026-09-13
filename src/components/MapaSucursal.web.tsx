import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
};

type Props = {
  region?: Region;
  coordenada?: {
    latitude: number;
    longitude: number;
  };
  onRegionChange?: (region: Region) => void;
  onSeleccionar?: (latitude: number, longitude: number) => void;
  soloLectura?: boolean;
  altura?: number;
};

export default function MapaSucursal({
  region = { latitude: -17.7833, longitude: -63.1821 },
  coordenada,
  onSeleccionar,
  soloLectura = false,
  altura = 220,
}: Props) {
  const latitude = coordenada?.latitude ?? region.latitude;
  const longitude = coordenada?.longitude ?? region.longitude;

  const callbackRef = useRef(onSeleccionar);
  callbackRef.current = onSeleccionar;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "SELECCION_MAPA_SUCURSAL"
      ) {
        const lat = Number(event.data.latitude);
        const lng = Number(event.data.longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          callbackRef.current?.(lat, lng);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const srcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .leaflet-container {
      cursor: ${soloLectura ? "default" : "crosshair"};
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const lat = ${latitude};
    const lng = ${longitude};
    const soloLectura = ${Boolean(soloLectura)};

    const map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([lat, lng], 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      draggable: !soloLectura
    }).addTo(map);

    function notificarCoordenadas(nLat, nLng) {
      if (window.parent) {
        window.parent.postMessage({
          type: 'SELECCION_MAPA_SUCURSAL',
          latitude: Number(nLat.toFixed(6)),
          longitude: Number(nLng.toFixed(6))
        }, '*');
      }
    }

    if (!soloLectura) {
      map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        notificarCoordenadas(e.latlng.lat, e.latlng.lng);
      });

      marker.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        notificarCoordenadas(pos.lat, pos.lng);
      });
    }
  </script>
</body>
</html>`;
  }, [latitude, longitude, soloLectura]);

  return (
    <View style={[styles.contenedor, { height: altura }]}>
      <iframe
        title="Mapa de Sucursal"
        srcDoc={srcDoc}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: 12,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
});