import { FC, useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  GeoPoint,
} from "firebase/firestore";
import Navbar from "./Navbar";

const center = {
  lat: 22.54992,
  lng: 0,
};

interface MarkerData {
  id: number;
  position: google.maps.LatLngLiteral;
  label: string;
  address: string; // Add address field
}

const MapPage: FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      const addressQuery = query(
        collection(db, "organization"),
        where("hostingConference", "==", "Yes"),
      );
      const unsubscribe = onSnapshot(
        addressQuery,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const geocodedMarkers: MarkerData[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.coordinates && data.coordinates instanceof GeoPoint) {
              const geoPoint = data.coordinates as GeoPoint;
              geocodedMarkers.push({
                id: Date.now() + Math.random(),
                position: {
                  lat: geoPoint.latitude,
                  lng: geoPoint.longitude,
                },
                label: data.name || "Unknown Organization",
                address: data.address || "No address available", // Fetch address
              });
            }
          });
          setMarkers(geocodedMarkers);
        },
      );
      return () => unsubscribe();
    };

    fetchAddresses();
  }, []);

  return (
    <div>
      <Navbar />
      <APIProvider apiKey={process.env.REACT_APP_MAPS_API_KEY || ""}>
        <Map
          style={{ width: "100vw", height: "100vh" }}
          defaultCenter={center}
          defaultZoom={3}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          mapId="LAPTOP"
        />
        {markers.map((marker) => (
          <AdvancedMarker
            key={marker.id}
            position={marker.position}
            title={marker.label}
            onClick={() => setSelectedMarker(marker)} // Set marker as selected when clicked
          />
        ))}

        {/* Display InfoWindow when a marker is selected */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div
              style={{
                width: "150px", // Set desired width
                padding: "8px",
                textAlign: "center",
                whiteSpace: "normal",
              }}
            >
              <h4 style={{ margin: "0", fontSize: "14px" }}>
                {selectedMarker.label}
              </h4>
              <p style={{ fontSize: "12px", margin: "8px 0 0" }}>
                {selectedMarker.address} {/* Display address here */}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedMarker.position.lat},${selectedMarker.position.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  color: "blue",
                  textDecoration: "underline",
                }}
              >
                View on Google Maps
              </a>
            </div>
          </InfoWindow>
        )}
      </APIProvider>
    </div>
  );
};

export default MapPage;
