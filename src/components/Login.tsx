import { useContext, useState, FormEvent, ChangeEvent, FC } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { UserContext } from "../context/userContext";
import {
  Grid,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Alert,
  Collapse,
} from "@mui/material";

const Login: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const navigate = useNavigate();
  const context = useContext(UserContext);
  
  const paperStyle = {
    padding: 20,
    height: "auto", // Changed from fixed height to auto
    width: 280,
    margin: "20px auto",
  };
  
  const btnStyle = { margin: "8px 0" };
  
  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  
  const { setContextOrgName } = context;
  
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowError(false);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userQuery = query(
        collection(db, "organization"),
        where("email", "==", email),
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setContextOrgName(userData.name);
      }
      navigate("/title");
    } catch (error) {
      console.error(
        "Error logging in:",
        (error as any).code,
        (error as any).message,
      );
      
      // Set appropriate error message based on the error code
      if ((error as any).code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if ((error as any).code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else if ((error as any).code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Login failed. Please try again later.");
      }
      
      setShowError(true);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      setShowError(true);
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent!");
      setShowError(true);
    } catch (error) {
      console.error(
        "Error sending password reset email:",
        (error as any).message,
      );
      setError("Failed to send password reset email.");
      setShowError(true);
    }
  };
  
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setShowError(false); // Hide error when user starts typing
  };
  
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setShowError(false); // Hide error when user starts typing
  };
  
  return (
    <Grid>
      <Paper elevation={10} style={paperStyle}>
        <h1>Muntopia</h1>
        <h2>Login</h2>
        
        <Collapse in={showError}>
          <Alert 
            severity={error.includes("sent") ? "success" : "error"} 
            sx={{ mb: 2 }}
            onClose={() => setShowError(false)}
          >
            {error}
          </Alert>
        </Collapse>
        
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            placeholder="enter an email"
            variant="outlined"
            fullWidth
            required
            onChange={handleEmailChange}
            type="email"
            margin="normal"
            error={showError && error.includes("email")}
          />
          <TextField
            label="Password"
            placeholder="enter a password"
            variant="outlined"
            type="password"
            fullWidth
            required
            onChange={handlePasswordChange}
            error={showError && error.includes("password")}
            margin="normal"
          />
          <Button 
            type="submit" 
            variant="contained" 
            style={btnStyle} 
            fullWidth
          >
            Login
          </Button>
        </form>
        
        <Typography align="center" style={{ marginTop: "10px" }}>
          <Link href="#" onClick={handleForgotPassword}>
            Forgot Password?
          </Link>
        </Typography>
        
        <Typography align="center" style={{ marginTop: "10px" }}>
          Don't have an account?
          <Link href="/signup" style={{ marginLeft: "5px" }}>
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Grid>
  );
};

export default Login;