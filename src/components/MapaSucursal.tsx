import { Platform } from "react-native";
import MapaSucursalWeb from "./MapaSucursal.web";
import MapaSucursalNative from "./MapaSucursal.native";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
};

export type MapaSucursalProps = {
  region?: Region;
  coordenada?: {
    latitude: number;
    longitude: number;
  };
  onRegionChange?: (region: any) => void;
  onSeleccionar?: (latitude: number, longitude: number) => void;
  soloLectura?: boolean;
  altura?: number;
};

export default function MapaSucursal(props: MapaSucursalProps) {
  if (Platform.OS === "web") {
    return <MapaSucursalWeb {...props} />;
  }

  return <MapaSucursalNative {...props} />;
}
