import { useContext, useState, FormEvent, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { Grid, TextField, Button, Typography, Link, Paper } from "@mui/material";
import { UserContext } from '../context/userContext';
import { auth, db } from '../firebaseConfig';

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

    const paperStyle = {
        padding: 20,
        height: "75vh",
        width: 280,
        margin: "20px auto",
      };
    const btnStyle = { margin: "8px 0" };

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

	return (
        <Grid>
        <Paper elevation={10} style={paperStyle}>
		<h1>Muntopia</h1>
		<h2>Sign Up</h2>
		<form onSubmit={handleSignup}>
        <TextField
            label="Email"
            placeholder="enter an email"
            variant="outlined"
            fullWidth
            required
            onChange={(e) => {setEmail(e.target.value)}}
            type="email"
            margin="normal"
        />
        <TextField
            label="Password"
            placeholder="enter a password"
            variant="outlined"
            type="password"
            fullWidth
            required
            onChange={(e) => {setPassword(e.target.value)}}
            margin="normal"
        />
        <TextField
            label="Organization Name"
            placeholder="enter an organization name"
            variant="outlined"
            fullWidth
            required
            onChange={(e) => {setOrg(e.target.value)}}
            margin="normal"
        />
        <TextField
            label="Address"
            placeholder="enter an address"
            variant="outlined"
            fullWidth
            required
            onChange={(e) => {setAddress(e.target.value)}}
            margin="normal"
        />
		{error && <p className="error-message">{error}</p>}
        <Button type="submit" variant="contained" style={btnStyle} fullWidth>
            Login
        </Button>
        </form>
        <Typography align="center" style={{ marginTop: "10px" }}>
            Already have an account?
        <Link href="/login" style={{ marginLeft: "5px" }}>
            Log In
        </Link>
        </Typography>
        </Paper>
        </Grid>
	);
};

export default Signup;
