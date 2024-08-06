import { FC } from 'react';
import Navbar from './Navbar';

const TitlePage: FC = () => {
	return (
		<div>
		<Navbar />
		<h1>Welcome to MUNTopia</h1>
		<p>Created by Tharun Viswanathan, Matthew Haimowitz and Jerry Yang</p>
		</div>
	);
};

export default TitlePage;
