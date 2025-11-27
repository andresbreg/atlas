import React, { useState, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import CountryModal from './CountryModal';
import ZoomControls from './components/ZoomControls';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

const MapComponent = () => {
    const [tooltipContent, setTooltipContent] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const mapContainerRef = useRef(null);

    // Native SVG transform state
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);

    /* const handleZoomIn = () => {
        setTransform(t => ({
            ...t,
            k: Math.min(t.k * 1.2, 4)
        }));
    };

    const handleZoomOut = () => {
        setTransform(t => {
            const newK = Math.max(t.k / 1.2, 1);
            // Auto-center when zooming out to 1
            if (newK === 1) {
                return { x: 0, y: 0, k: 1 };
            }
            return { ...t, k: newK };
        });
    }; */

    const applyZoom = (factor) => {
        setTransform(t => {
            const newK = Math.max(1, Math.min(3, t.k * factor));

            // Si llegamos al límite del zoom, no hacemos nada
            if (newK === t.k) return t;

            // Calculamos cuánto creció o se achicó el zoom
            const ratio = newK / t.k;

            // Ajustamos la posición proporcionalmente para mantener el centro visual
            const newX = t.x * ratio;
            const newY = t.y * ratio;

            // Recalculamos los límites para evitar huecos en los bordes
            const limitX = (MAP_WIDTH * (newK - 1)) / 2;
            const limitY = (MAP_HEIGHT * (newK - 1)) / 2;

            return {
                x: Math.max(-limitX, Math.min(newX, limitX)),
                y: Math.max(-limitY, Math.min(newY, limitY)),
                k: newK
            };
        });
    };

    const handleZoomIn = () => applyZoom(1.2);
    const handleZoomOut = () => applyZoom(1 / 1.2);

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseDown = () => {
        setIsDragging(true);
        setTooltipContent("");
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !mapContainerRef.current) return;

        // 1. Medimos la pantalla
        const { clientWidth, clientHeight } = mapContainerRef.current;

        // 2. Calculamos el factor de escala real del navegador
        const scaleX = clientWidth / MAP_WIDTH;
        const scaleY = clientHeight / MAP_HEIGHT;
        const scaleFactor = Math.min(scaleX, scaleY);

        setTransform(t => {
            // CORRECCIÓN: Eliminamos "/ t.k". 
            // Como el translate está antes del scale en el SVG, 
            // el movimiento es absoluto, no relativo al zoom.
            const deltaX = e.movementX / scaleFactor;
            const deltaY = e.movementY / scaleFactor;

            const newX = t.x + deltaX;
            const newY = t.y + deltaY;

            // Límites (se mantienen igual)
            const limitX = (MAP_WIDTH * (t.k - 1)) / 2;
            const limitY = (MAP_HEIGHT * (t.k - 1)) / 2;

            return {
                ...t,
                x: Math.max(-limitX, Math.min(newX, limitX)),
                y: Math.max(-limitY, Math.min(newY, limitY)),
                k: t.k
            };
        });
    };

    const cursorClass = transform.k === 1
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
        <div
            ref={mapContainerRef}
            className={`h-screen w-screen bg-[#aad3df] flex items-center justify-center overflow-hidden ${cursorClass}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 142,
                    rotate: [-11, 0, 0],
                    center: [0, 44]
                }}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                style={{ width: "100%", height: "100%" }}
            >
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`} style={{ transformOrigin: '400px 300px' }}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    data-tooltip-id="my-tooltip"
                                    // Si estamos arrastrando, no le pasamos contenido al tooltip
                                    data-tooltip-content={isDragging ? "" : geo.properties.name}

                                    onMouseEnter={() => {
                                        // CONDICIÓN CLAVE: Si arrastra, no hace nada
                                        if (isDragging) return;
                                        setTooltipContent(geo.properties.name);
                                    }}
                                    onMouseLeave={() => {
                                        setTooltipContent("");
                                    }}
                                    onClick={() => {
                                        // Opcional: Evitar click accidental al terminar de arrastrar
                                        if (!isDragging) handleCountryClick(geo);
                                    }}
                                    style={{
                                        default: {
                                            fill: "#D6D6DA",
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.5
                                        },
                                        // CONDICIÓN HOVER (Ya la tenías)
                                        hover: isDragging ? {
                                            fill: "#D6D6DA", // Gris si arrastra
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.5
                                        } : {
                                            fill: "#F53", // Naranja si navega
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.5,
                                            cursor: "pointer"
                                        },
                                        // CONDICIÓN PRESSED (Esta es la nueva corrección)
                                        pressed: isDragging ? {
                                            fill: "#D6D6DA", // <--- GRIS: Si arrastra, se ve apagado aunque lo aprietes
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.5
                                        } : {
                                            fill: "#E42", // Naranja oscuro: Si es solo un click, se ilumina
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.5
                                        }
                                    }}
                                />
                            ))
                        }
                    </Geographies>
                </g>
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
