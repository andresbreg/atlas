import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import CountryModal from './CountryModal';
import ZoomControls from './components/ZoomControls';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MapComponent = () => {
    const [tooltipContent, setTooltipContent] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState({ coordinates: [0, 44], zoom: 1 });
    const [isDragging, setIsDragging] = useState(false);

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.2, 4) }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.2, 1) }));
    };

    const handleMove = (position) => {
        setPosition(position);
    };

    const cursorClass = position.zoom === 1
        ? 'cursor-default'
        : isDragging
            ? 'cursor-grabbing'
            : 'cursor-grab';

    const handleCountryClick = async (geo) => {
        const countryName = geo.properties.name;
        setIsLoading(true);

        // Open modal immediately with basic info or loading state
        setSelectedCountry({
            name: countryName,
            flag: null,
            capital: "Loading...",
            population: null,
            region: null
        });

        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);

            // Fallback search if fullText fails (common issue with names)
            let data = null;
            if (response.ok) {
                const result = await response.json();
                data = result[0];
            } else {
                const looseResponse = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
                if (looseResponse.ok) {
                    const result = await looseResponse.json();
                    data = result[0];
                }
            }

            if (data) {
                setSelectedCountry({
                    name: data.name.common,
                    flag: data.flags.svg,
                    capital: data.capital ? data.capital[0] : 'N/A',
                    population: data.population,
                    region: data.region
                });
            } else {
                setSelectedCountry(prev => ({ ...prev, capital: "Data not found" }));
            }
        } catch (error) {
            console.error("Error fetching country data:", error);
            setSelectedCountry(prev => ({ ...prev, capital: "Error loading data" }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`h-screen w-screen bg-[#aad3df] flex items-center justify-center overflow-hidden ${cursorClass}`}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 160,
                    center: [0, 44],
                    rotate: [-11, 0, 0]
                }}
                width={800}
                height={600}
                style={{ width: "100%", height: "100%" }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMove={handleMove}
                    onMoveStart={() => setIsDragging(true)}
                    onMoveEnd={() => setIsDragging(false)}
                    translateExtent={[[0, 0], [800, 600]]}
                    disablePanning={position.zoom === 1}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    data-tooltip-id="my-tooltip"
                                    data-tooltip-content={geo.properties.name}
                                    onMouseEnter={() => {
                                        setTooltipContent(geo.properties.name);
                                    }}
                                    onMouseLeave={() => {
                                        setTooltipContent("");
                                    }}
                                    onClick={() => handleCountryClick(geo)}
                                    style={{
                                        default: {
                                            fill: "#D6D6DA",
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.5
                                        },
                                        hover: {
                                            fill: "#F53",
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.5,
                                            cursor: "pointer"
                                        },
                                        pressed: {
                                            fill: "#E42",
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.5
                                        }
                                    }}
                                />
                            ))
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

            <Tooltip id="my-tooltip" float style={{ zIndex: 100 }} />

            {selectedCountry && (
                <CountryModal
                    country={selectedCountry}
                    onClose={() => setSelectedCountry(null)}
                />
            )}
        </div>
    );
};

export default MapComponent;
