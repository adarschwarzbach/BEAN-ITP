import React from 'react';
import { DataProvider,} from './Contexts/SpeciesData';
import Entrypoint from './components/Templates/Entrypoint';

const App: React.FC = () => {
	return (
		<DataProvider>
			<Entrypoint />
		</DataProvider>
	);
};


export default App;
