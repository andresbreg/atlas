import React from 'react';

const ZoomControls = ({ onZoomIn, onZoomOut }) => {
    return (
        <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-md flex flex-col divide-y divide-gray-100 overflow-hidden border border-gray-100">
            <button
                onClick={onZoomIn}
                className="p-2 hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-600 w-10 h-10 flex items-center justify-center"
                aria-label="Zoom In"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <button
                onClick={onZoomOut}
                className="p-2 hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-600 w-10 h-10 flex items-center justify-center"
                aria-label="Zoom Out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
    );
};

export default ZoomControls;
