import { FC } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import MapPage from './components/MapPage';
import Login from './components/Login';
import Signup from './components/Signup';
import TitlePage from './components/Title';
import { UserProvider } from './context/userContext';
import Organization from './components/Organization';
import Conferences from './components/Conferences';
import Delegations from './components/Delegations';

const App: FC = () => {
	return (
		<UserProvider>
		<Router>
		<Routes>
		<Route path="/" element={<Navigate to="/login" />} />
		<Route path="/title" element={<TitlePage />} />
		<Route path="/signup" element={<Signup />} />
		<Route path="/login" element={<Login />} />
		<Route path="/map" element={<MapPage />} />
		<Route path="/organization" element={<Organization />} />
		<Route path="/hosting" element={<Conferences />} />
        <Route path="/delegations" element={<Delegations />} />
		</Routes>
		</Router>
		</UserProvider>
	);
};

export default App;
