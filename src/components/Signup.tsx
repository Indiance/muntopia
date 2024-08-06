import { useContext, useState, FormEvent, ChangeEvent, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
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
	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [error, setError] = useState<string>('');
	const navigate = useNavigate();
	const context = useContext(UserContext);

	if (!context) {
		throw new Error('UserContext must be used within a UserProvider');
	}

	const { setContextEmail, setContextOrgName } = context;

	const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			console.log('User signed up:', userCredential.user);

			// Add user to Firestore
			const userRef = await addDoc(collection(db, "users"), {
				email: email,
				firstName: firstName,
				lastName: lastName,
				org: org
			});
			console.log('User added to db:', userRef.id);

			// Check if organization exists and add it if not
			const orgQuery = query(collection(db, "organization"), where("name", "==", org));
			const orgSnapshot = await getDocs(orgQuery);
			if (orgSnapshot.empty) {
				const orgRef = await addDoc(collection(db, "organization"), {
					name: org,
					attendingConference: " ",
					hostingConference: " ",
					conferenceWebsite: " ",
					address: " "
				});
				console.log('Org added to db:', orgRef.id);
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
		<div className='form-group'>
		<label>First Name</label>
		<input
		type="text"
		value={firstName}
		onChange={handleChange(setFirstName)}
		placeholder="Enter your first name"
		required
		/>
		</div>
		<div className='form-group'>
		<label>Last Name</label>
		<input
		type="text"
		value={lastName}
		onChange={handleChange(setLastName)}
		placeholder="Enter your last name"
		required
		/>
		</div>
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
		{error && <p className="error-message">{error}</p>}
		<button type="submit" className="btn">Sign Up</button>
		</form>
		</div>
	);
};

export default Signup;
