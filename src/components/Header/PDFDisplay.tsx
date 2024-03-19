import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
// Import styles for the viewer and the default layout
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// Import the default layout plugin to provide additional UI elements and controls
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

const PDFDisplay: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
	// Instantiate the default layout plugin
	const defaultLayoutPluginInstance = defaultLayoutPlugin();

	return (
		<div style={{ height: '100vh' }}>
			{/* Specify the workerUrl for the Worker component */}
			<Worker workerUrl="https://unpkg.com/pdfjs-dist@2.11.338/build/pdf.worker.min.js">
				<Viewer
					fileUrl={fileUrl}
					plugins={[defaultLayoutPluginInstance]}
				/>
			</Worker>
		</div>
	);
};

export default PDFDisplay;
