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
} from "@mui/material";

const Login: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const context = useContext(UserContext);

  const paperStyle = {
    padding: 20,
    height: "55vh",
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
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      console.error(
        "Error sending password reset email:",
        (error as any).message,
      );
      alert("Failed to send password reset email.");
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <Grid>
      <Paper elevation={10} style={paperStyle}>
        <h1>Muntopia</h1>
        <h2>Login</h2>
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
          />
          <TextField
            label="Password"
            placeholder="enter a password"
            variant="outlined"
            type="password"
            fullWidth
            required
            onChange={handlePasswordChange}
          />
          <Button type="submit" variant="contained" style={btnStyle} fullWidth>
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
