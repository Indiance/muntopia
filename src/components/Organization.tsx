import React, {
  useContext,
  useEffect,
  useState,
  ChangeEvent,
  MouseEvent,
  FC,
} from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  DocumentReference,
  GeoPoint,
} from "firebase/firestore";
import {
  TextField,
  Select,
  Button,
  MenuItem,
  SelectChangeEvent,
  InputLabel,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { db, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { UserContext } from "../context/userContext";
import "../css/Organization.css"; // Import the CSS file for styling

// Define the types for organization data
interface OrgData {
  name: string;
  attendingConference: string;
  hostingConference: string;
  conferenceWebsite: string;
  address: string;
}

const Organization: FC = () => {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  const { contextOrgName, setContextOrgName } = context || {};
  const [attendingConf, setAttendingConf] = useState<string>("");
  const [hostingConf, setHostingConf] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [originalAddress, setOriginalAddress] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleAttending = (event: SelectChangeEvent<string>) => {
    setAttendingConf(event.target.value);
  };

  const handleHosting = (event: SelectChangeEvent<string>) => {
    setHostingConf(event.target.value);
  };

  const geocodeAddress = async (address: string): Promise<GeoPoint | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_MAPS_API_KEY}`,
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return new GeoPoint(location.lat, location.lng);
      } else {
        console.error("Geocoding failed: No results found");
        return null;
      }
    } catch (error) {
      console.error("Error in geocoding:", error);
      return null;
    }
  };

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent default button behavior
    if (contextOrgName) {
      const orgQuery = query(
        collection(db, "organization"),
        where("name", "==", contextOrgName),
      );
      const orgSnapshot = await getDocs(orgQuery);
      if (!orgSnapshot.empty) {
        const orgRef: DocumentReference = orgSnapshot.docs[0].ref;

        // Prepare data for update
        const updateData: any = {
          attendingConference: attendingConf,
          hostingConference: hostingConf,
          conferenceWebsite: website,
          address: address,
        };

        // Check if address has changed
        if (address !== originalAddress) {
          const geoPoint = await geocodeAddress(address);
          if (geoPoint) {
            updateData.coordinates = geoPoint;
          }
        }

        try {
          // Update the document in Firebase
          await updateDoc(orgRef, updateData);
          
          setSnackbarMessage("Information updated successfully!");
          setSnackbarSeverity("success");
          setShowSnackbar(true);
          
          setSuccessMessage("Information updated successfully!");
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        } catch (error) {
          setSnackbarMessage("Failed to update information. Please try again.");
          setSnackbarSeverity("error");
          setShowSnackbar(true);
          console.error("Error updating document:", error);
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear any user context
      if (setContextOrgName) {
        setContextOrgName("");
      }
      // Navigate to login page
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setSnackbarMessage("Failed to log out. Please try again.");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (contextOrgName) {
        const orgQuery = query(
          collection(db, "organization"),
          where("name", "==", contextOrgName),
        );
        const orgSnapshot = await getDocs(orgQuery);
        if (!orgSnapshot.empty) {
          const orgData: OrgData = orgSnapshot.docs[0].data() as OrgData;
          setAttendingConf(orgData.attendingConference || "");
          setHostingConf(orgData.hostingConference || "");
          setWebsite(orgData.conferenceWebsite || "");
          setAddress(orgData.address || "");
          setOriginalAddress(orgData.address || ""); // Set the original address
        }
      }
    };
    fetchData();
  }, [contextOrgName]);

  return (
    <div>
      <Navbar />
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0 20px'
        }}
      >
        <h2>Account Settings</h2>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleLogout}
          sx={{ marginLeft: 'auto' }}
        >
          Logout
        </Button>
      </Box>
      
      <div className="container">
        <div className="form-group">
          <InputLabel htmlFor="attendingConf" className="input-label">
            Attending Conference:{" "}
          </InputLabel>
          <Select
            id="attendingConf"
            value={attendingConf}
            onChange={handleAttending}
            style={{ width: "25%" }}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </div>
        <div className="form-group">
          <InputLabel htmlFor="hostingConf" className="input-label">
            Hosting Conference:{" "}
          </InputLabel>
          <Select
            id="hostingConf"
            value={hostingConf}
            onChange={handleHosting}
            style={{ width: "25%" }}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </div>
        <div className="form-group">
          <InputLabel htmlFor="confWebsite" className="input-label">
            Conference Website:{" "}
          </InputLabel>
          <TextField
            type="text"
            id="confWebsite"
            name="confWebsite"
            value={website}
            style={{ width: "40%" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWebsite(e.target.value)
            }
            className="small-textbox"
          />
        </div>
        <div className="form-group">
          <InputLabel htmlFor="confAddress" className="input-label">
            Conference Address:{" "}
          </InputLabel>
          <TextField
            type="text"
            id="confAddress"
            name="confAddress"
            value={address}
            style={{ width: "50%" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAddress(e.target.value)
            }
            className="small-textbox"
          />
        </div>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
      
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Organization;