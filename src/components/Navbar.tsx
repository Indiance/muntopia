import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import { FC } from "react";

const Navbar: FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* Box ensures left alignment */}
        <Box sx={{ flexGrow: 1, display: "flex" }}>
          <Button
            color="inherit"
            component={Link}
            to="/title"
            sx={{ textTransform: "none" }}
          >
            <Typography variant="h6" component="div">
              Muntopia
            </Typography>
          </Button>
        </Box>
        <Button color="inherit" component={Link} to="/hosting">
          Conferences
        </Button>
        <Button color="inherit" component={Link} to="/delegations">
          Delegations
        </Button>
        <Button color="inherit" component={Link} to="/map">
          Map
        </Button>
        <Button color="inherit" component={Link} to="/organization">
          Organization
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
