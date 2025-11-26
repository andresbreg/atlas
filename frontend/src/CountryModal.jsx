import React from 'react';

const CountryModal = ({ country, onClose }) => {
    if (!country) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white truncate">{country.name}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center space-y-6">
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden shadow-md flex items-center justify-center">
                        {country.flag ? (
                            <img
                                src={country.flag}
                                alt={`Flag of ${country.name}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-400">No Flag Available</span>
                        )}
                    </div>

                    <div className="w-full text-center space-y-2">
                        <p className="text-gray-600 text-lg">
                            <span className="font-semibold text-gray-800">Capital:</span> {country.capital || 'N/A'}
                        </p>
                        {/* Placeholder for future stats */}
                        <div className="pt-4 grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <span className="block text-xs text-blue-500 font-bold uppercase">Population</span>
                                <span className="text-gray-700 font-medium">{country.population ? country.population.toLocaleString() : 'N/A'}</span>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <span className="block text-xs text-green-500 font-bold uppercase">Region</span>
                                <span className="text-gray-700 font-medium">{country.region || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder Actions */}
                    <div className="w-full pt-2">
                        <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-colors">
                            More Actions Coming Soon...
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountryModal;
