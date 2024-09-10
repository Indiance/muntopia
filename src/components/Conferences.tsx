import React, { useState, useEffect, FC } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import Navbar from './Navbar';
import '../css/Conferences.css';

interface ConferenceData {
	id: string;
	name: string;
	address: string;
	conferenceWebsite: string;
}

const Conferences: FC = () => {
	const [data, setData] = useState<ConferenceData[]>([]);

	useEffect(() => {
		const hostingQuery = query(collection(db, "organization"), where("hostingConference", "==", "Yes"));

		const unsubscribe = onSnapshot(hostingQuery, (querySnapshot: QuerySnapshot<DocumentData>) => {
			const results: ConferenceData[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				results.push({
					id: doc.id,
					name: data.name,
					address: data.address,
					conferenceWebsite: data.conferenceWebsite
				});
			});
			setData(results);
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, []);

	return (
		<div>
		<Navbar />
		<table>
		<thead>
		<tr>
		<th>University</th>
		<th>Address</th>
		<th>Conference Website</th>
		</tr>
		</thead>
		<tbody>
		{data.map(item => (
			<tr key={item.id}>
			<td>{item.name}</td>
			<td>{item.address}</td>
			<td><a href={item.conferenceWebsite} target="_blank" rel="noopener noreferrer">Conference Link</a></td>
			</tr>
		))}
		</tbody>
		</table>
		</div>
	);
};

export default Conferences;
