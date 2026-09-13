import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

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
  region = { latitude: -17.7833, longitude: -63.1821, latitudeDelta: 0.01, longitudeDelta: 0.01 },
  coordenada,
  onSeleccionar,
  soloLectura = false,
  altura = 220,
}: Props) {
  const html = useMemo(() => {
    const latitude = coordenada?.latitude ?? region.latitude;
    const longitude = coordenada?.longitude ?? region.longitude;

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />

          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />

          <style>
            html, body, #map {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }

            .leaflet-control-attribution {
              font-size: 10px;
            }
          </style>
        </head>

        <body>
          <div id="map"></div>

          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

          <script>
            const map = L.map("map").setView(
              [${latitude}, ${longitude}],
              16
            );

            L.tileLayer(
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              {
                maxZoom: 19,
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }
            ).addTo(map);

            const marker = L.marker(
              [${latitude}, ${longitude}],
              {
                draggable: true
              }
            ).addTo(map);

            function enviarCoordenadas(lat, lng) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  latitude: lat,
                  longitude: lng
                })
              );
            }

            map.on("click", function(evento) {
              const lat = evento.latlng.lat;
              const lng = evento.latlng.lng;

              marker.setLatLng([lat, lng]);
              enviarCoordenadas(lat, lng);
            });

            marker.on("dragend", function() {
              const posicion = marker.getLatLng();

              enviarCoordenadas(
                posicion.lat,
                posicion.lng
              );
            });

            setTimeout(function() {
              map.invalidateSize();
            }, 300);
          </script>
        </body>
      </html>
    `;
  }, [
    region.latitude,
    region.longitude,
    coordenada?.latitude,
    coordenada?.longitude,
  ]);

  return (
    <View style={[styles.container, { height: altura }]}>
      <WebView
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(evento) => {
          try {
            const datos = JSON.parse(evento.nativeEvent.data);

            onSeleccionar?.(
              Number(datos.latitude),
              Number(datos.longitude)
            );
          } catch (error) {
            console.error(
              "No se pudieron obtener las coordenadas:",
              error
            );
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    overflow: "hidden",
    borderRadius: 17,
    backgroundColor: "#EDEDED",
  },
});