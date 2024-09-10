import { useContext, useState, FormEvent, ChangeEvent, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { UserContext } from '../context/userContext';
import '../css/Login.css';

const Login: FC = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const navigate = useNavigate();
	const context = useContext(UserContext);

	// Ensure context is not undefined - which is impossible but thanks typescript :)
	if (!context) {
		throw new Error('UserContext must be used within a UserProvider');
	}

	const { setContextOrgName } = context;

	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await signInWithEmailAndPassword(auth, email, password);
			const userQuery = query(collection(db, "organization"), where("email", "==", email));
			const userSnapshot = await getDocs(userQuery);
			if (!userSnapshot.empty) {
				const userData = userSnapshot.docs[0].data();
					setContextOrgName(userData.name);
			}
			navigate('/title');
		} catch (error) {
			console.error('Error logging in:', (error as any).code, (error as any).message);
		}
	};

	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	return (
		<div className="login-container">
		<h1>Login</h1>
		<form onSubmit={handleLogin}>
		<div className="form-group">
		<label>Email</label>
		<input
		type="email"
		value={email}
		onChange={handleEmailChange}
		placeholder="Enter your email"
		required
		/>
		</div>
		<div className="form-group">
		<label>Password</label>
		<input
		type="password"
		value={password}
		onChange={handlePasswordChange}
		placeholder="Enter your password"
		required
		/>
		</div>
		<button type="submit" className="btn">Login</button>
		</form>
		</div>
	);
};

export default Login;
