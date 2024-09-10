import { FC, useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { db } from '../firebaseConfig'
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData, GeoPoint } from 'firebase/firestore'
import Navbar from './Navbar';

const center = {
	lat: 22.54992,
	lng: 0,
};

interface MarkerData {
	id: number;
	position: google.maps.LatLngLiteral;
}

const MapPage: FC = () => {
	const [markers, setMarkers] = useState<MarkerData[]>([]);
	useEffect(() => {
		const fetchAddresses = async () => {
			const addressQuery = query(collection(db, "organization"), where("hostingConference", "==", "Yes"));
			const unsubscribe = onSnapshot(addressQuery, (querySnapshot: QuerySnapshot<DocumentData>) => {
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
                    });
                  }
				});
                setMarkers(geocodedMarkers);
			});
			return () => unsubscribe();
		};

		fetchAddresses();
	}, []);
	return (
		<div>
		<Navbar />
		<APIProvider apiKey={process.env.REACT_APP_MAPS_API_KEY || ''}>
		<Map
		style={{width: '100vw', height: '100vh'}}
		defaultCenter={center}
		defaultZoom={3}
		gestureHandling={'greedy'}
		disableDefaultUI={true}
		mapId='LAPTOP'
		/>
		{markers.map((marker) => (
		<AdvancedMarker key={marker.id} position={marker.position} />
		))}

		</APIProvider>
		</div>
	)
}

export default MapPage;
