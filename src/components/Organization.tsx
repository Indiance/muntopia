import React, { useContext, useEffect, useState, ChangeEvent, MouseEvent, FC } from "react";
import { collection, query, where, getDocs, updateDoc, DocumentReference } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Navbar from "./Navbar";
import { UserContext } from "../context/userContext";
import '../css/Organization.css'; // Import the CSS file for styling

// Define the types for organization data
interface OrgData {
	name: string;
	attendingConference: string;
	hostingConference: string;
	conferenceWebsite: string;
	address: string;
}

const Organization: FC = () => {
	const { contextOrgName } = useContext(UserContext) || {}; // Use default values if context is undefined
	const [orgName, setOrgName] = useState<string>('');
	const [attendingConf, setAttendingConf] = useState<string>('');
	const [hostingConf, setHostingConf] = useState<string>('');
	const [website, setWebsite] = useState<string>('');
	const [address, setAddress] = useState<string>('');
	const [successMessage, setSuccessMessage] = useState<string>('');

	const handleAttending = (event: ChangeEvent<HTMLSelectElement>) => {
		setAttendingConf(event.target.value);
	};

	const handleHosting = (event: ChangeEvent<HTMLSelectElement>) => {
		setHostingConf(event.target.value);
	};

	const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault(); // Prevent default button behavior
		if (contextOrgName) {
			const orgQuery = query(collection(db, "organization"), where("name", "==", contextOrgName));
			const orgSnapshot = await getDocs(orgQuery);
			if (!orgSnapshot.empty) {
				const orgRef: DocumentReference = orgSnapshot.docs[0].ref;
				await updateDoc(orgRef, {
					attendingConference: attendingConf,
					hostingConference: hostingConf,
					conferenceWebsite: website,
					address: address
				});
				setSuccessMessage('Information updated successfully!');
				setTimeout(() => {
					setSuccessMessage('');
				}, 3000);
			}
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			if (contextOrgName) {
				const orgQuery = query(collection(db, "organization"), where("name", "==", contextOrgName));
				const orgSnapshot = await getDocs(orgQuery);
				if (!orgSnapshot.empty) {
					const orgData: OrgData = orgSnapshot.docs[0].data() as OrgData;
					setOrgName(orgData.name);
					setAttendingConf(orgData.attendingConference || '');
					setHostingConf(orgData.hostingConference || '');
					setWebsite(orgData.conferenceWebsite || '');
					setAddress(orgData.address || ''); // Fixed to address field
				}
			}
		};
		fetchData();
	}, [contextOrgName]);

	return (
		<div>
		<Navbar />
		<h1>Edit Info for {orgName}</h1>
		<div className="form-group">
		<label htmlFor="attendingConf">Attending Conference: </label>
		<select id="attendingConf" value={attendingConf} onChange={handleAttending}>
		<option value="">Select</option>
		<option value="Y">Y</option>
		<option value="N">N</option>
		</select>
		</div>
		<div className="form-group">
		<label htmlFor="hostingConf">Hosting Conference: </label>
		<select id="hostingConf" value={hostingConf} onChange={handleHosting}>
		<option value="">Select</option>
		<option value="Y">Y</option>
		<option value="N">N</option>
		</select>
		</div>
		<div className="form-group">
		<label htmlFor="confWebsite">Conference Website: </label>
		<input
		type="text"
		id="confWebsite"
		name="confWebsite"
		value={website}
		onChange={(e: ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value)}
		className="small-textbox"
		/>
		</div>
		<div className="form-group">
		<label htmlFor="confAddress">Conference Address: </label>
		<input
		type="text"
		id="confAddress"
		name="confAddress"
		value={address}
		onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
		className="small-textbox"
		/>
		</div>
		<button onClick={handleSubmit}>Submit</button>
		{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default Organization;
