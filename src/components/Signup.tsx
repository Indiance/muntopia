import { useContext, useState, FormEvent, ChangeEvent, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { UserContext } from '../context/userContext';
import '../css/Signup.css';

// Define types for the error object
interface FirebaseError extends Error {
	code: string;
	message: string;
}

const Signup: FC = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [org, setOrg] = useState<string>('');
	const [address, setAddress] = useState<string>('');
	const [error, setError] = useState<string>('');
	const navigate = useNavigate();
	const context = useContext(UserContext);

	if (!context) {
		throw new Error('UserContext must be used within a UserProvider');
	}

	const { setContextEmail, setContextOrgName } = context;

    const geocodeAddress = async (address: string): Promise<GeoPoint | null> => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                return new GeoPoint(location.lat, location.lng);
            } else {
                console.error('Geocoding failed: No results found');
                return null;
            }
        } catch (error) {
            console.error('Error in geocoding:', error);
            return null;
        }
    };

	const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			console.log('User signed up:', userCredential.user);

            const geoPoint = await geocodeAddress(address);
			if (!geoPoint) {
				throw new Error('Failed to geocode address');
			}

			// Check if organization exists and add it if not
			const orgQuery = query(collection(db, "organization"), where("name", "==", org));
			const orgSnapshot = await getDocs(orgQuery);
			if (orgSnapshot.empty) {
				const orgRef = await addDoc(collection(db, "organization"), {
                    email: email,
					name: org,
					address: address,
                    coordinates: geoPoint,
					attendingConference: " ",
					hostingConference: " ",
					conferenceWebsite: " ",
				});
				console.log('Org added to db:', orgRef.id);
			} else {
                setError("Organization already exists");
            }

			// Update context
			setContextEmail(email);
			setContextOrgName(org);

			// Redirect to dashboard
			navigate('/title');
		} catch (error) {
			const firebaseError = error as FirebaseError;
			setError(firebaseError.message);
			console.error('Error signing up:', firebaseError.code, firebaseError.message);
		}
	};

	const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
		setter(e.target.value);
	};

	return (
		<div className="signup-container">
		<h1>Sign Up</h1>
		<form onSubmit={handleSignup}>
		<div className="form-group">
		<label>Email</label>
		<input
		type="email"
		value={email}
		onChange={handleChange(setEmail)}
		placeholder="Enter your email"
		required
		/>
		</div>
		<div className="form-group">
		<label>Password</label>
		<input
		type="password"
		value={password}
		onChange={handleChange(setPassword)}
		placeholder="Enter your password"
		required
		/>
		</div>
		<div className='form-group'>
		<label>University</label>
		<input
		type="text"
		value={org}
		onChange={handleChange(setOrg)}
		placeholder="Enter your university name"
		required
		/>
        </div>
		<div className='form-group'>
		<label>Address</label>
		<input
		type="text"
		value={address}
		onChange={handleChange(setAddress)}
		placeholder="Enter your university address"
		required
		/>
		</div>
		{error && <p className="error-message">{error}</p>}
		<button type="submit" className="btn">Sign Up</button>
		</form>
		</div>
	);
};

export default Signup;
