import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { FC } from 'react';

const Navbar: FC = () => {
	return (
		<AppBar position="static">
		<Toolbar>
		<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
		Muntopia
		</Typography>
		<Button color="inherit" component={Link} to="/title">Home</Button>
		<Button color="inherit" component={Link} to="/list">Conferences</Button>
		<Button color="inherit" component={Link} to="/map">Map</Button>
		<Button color="inherit" component={Link} to="/organization">Organization</Button>
		<Button color="inherit" component={Link} to="/account">My Account</Button>
		</Toolbar>
		</AppBar>
	);
};

export default Navbar;
