import { FC, useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { db } from '../firebaseConfig'
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore'
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
			const addressQuery = query(collection(db, "organization"), where("hostingConference", "==", "Y"));
			const unsubscribe = onSnapshot(addressQuery, (querySnapshot: QuerySnapshot<DocumentData>) => {
				const addresses: string[] = [];
				querySnapshot.forEach((doc) => {
					addresses.push(doc.data().address as string);
				});
				geocodeAddresses(addresses);
			});
			return () => unsubscribe();
		};

		const geocodeAddresses = async (addresses: string[]) => {
			const geocodedMarkers: MarkerData[] = [];
			for (const address of addresses) {
				const response = await fetch(
					`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_MAPS_API_KEY}`
				);
				const data = await response.json();
				if (data.results && data.results.length > 0) {
					const location = data.results[0].geometry.location;
					geocodedMarkers.push({
						id: Date.now() + Math.random(),
						position: {
							lat: location.lat,
							lng: location.lng,
						},
					});
				}
			}
			setMarkers(geocodedMarkers);
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
