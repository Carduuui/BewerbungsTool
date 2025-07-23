import { NextResponse } from "next/server";

// Function to decode polyline geometry to coordinates
function decodePolyline(encoded) {
    const coords = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b;
        let shift = 0;
        let result = 0;
        
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        
        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        
        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        coords.push([lng / 1e5, lat / 1e5]); // [longitude, latitude]
    }

    return coords;
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { start, end } = data;

        console.log('Route request received:', { start, end });

        const ORS_API_KEY = process.env.ORS_API_KEY;

        if (!ORS_API_KEY) {
            return NextResponse.json(
                { success: false, error: "ORS API Key nicht gefunden" },
                { status: 500 }
            );
        }

        // Validate coordinates
        if (!start || !end || !Array.isArray(start) || !Array.isArray(end)) {
            return NextResponse.json(
                { success: false, error: "Ungültige Koordinaten. Start und End müssen Arrays sein." },
                { status: 400 }
            );
        }

        if (start.length !== 2 || end.length !== 2) {
            return NextResponse.json(
                { success: false, error: "Koordinaten müssen [longitude, latitude] Format haben." },
                { status: 400 }
            );
        }

        console.log('Using coordinates:', { start, end });
        console.log('Start coordinate type:', typeof start, 'values:', start);
        console.log('End coordinate type:', typeof end, 'values:', end);

        // Directions API für detaillierte Route
        const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?format=geojson`;

        const directionsBody = {
            coordinates: [start, end], // [longitude, latitude] für Start und Ende
            instructions: true,
            geometry: true
        };

        console.log('Sending request to ORS:', JSON.stringify(directionsBody, null, 2));

        const directionsResponse = await fetch(directionsUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, application/geo+json',
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(directionsBody)
        });

        if (!directionsResponse.ok) {
            const errorText = await directionsResponse.text();
            console.error('ORS Directions API Error:', {
                status: directionsResponse.status,
                statusText: directionsResponse.statusText,
                error: errorText
            });
            return NextResponse.json(
                { success: false, error: `ORS API Fehler: ${directionsResponse.status} - ${errorText}` },
                { status: directionsResponse.status }
            );
        }

        const directionsData = await directionsResponse.json();
        console.log('Full Directions API response:', JSON.stringify(directionsData, null, 2));
        
        // Handle both GeoJSON and JSON formats
        let routeCoordinates, routeInstructions, summary;
        
        if (directionsData.features && directionsData.features.length > 0) {
            // GeoJSON format
            console.log('Processing GeoJSON format response');
            const feature = directionsData.features[0];
            
            if (!feature.geometry || !feature.geometry.coordinates) {
                console.error('Missing geometry in GeoJSON response:', feature);
                return NextResponse.json(
                    { success: false, error: "Route-Geometrie nicht verfügbar." },
                    { status: 500 }
                );
            }
            
            routeCoordinates = feature.geometry.coordinates;
            routeInstructions = feature.properties.segments?.[0]?.steps || [];
            summary = feature.properties.summary;
            
        } else if (directionsData.routes && directionsData.routes.length > 0) {
            // JSON format
            console.log('Processing JSON format response');
            const route = directionsData.routes[0];
            
            if (!route.geometry) {
                console.error('Missing geometry in JSON response:', route);
                return NextResponse.json(
                    { success: false, error: "Route-Geometrie nicht verfügbar." },
                    { status: 500 }
                );
            }
            
            // Decode the encoded geometry string to coordinates
            const decodedGeometry = decodePolyline(route.geometry);
            routeCoordinates = decodedGeometry;
            routeInstructions = route.segments?.[0]?.steps || [];
            summary = route.summary;
            
        } else {
            console.error('Invalid response structure - no features or routes:', directionsData);
            return NextResponse.json(
                { success: false, error: "Keine Route gefunden. Überprüfen Sie die Koordinaten." },
                { status: 404 }
            );
        }

        console.log('Successfully extracted route data:', {
            coordinatesCount: routeCoordinates.length,
            instructionsCount: routeInstructions.length,
            distance: summary?.distance,
            duration: summary?.duration
        });

        return NextResponse.json({
            success: true,
            data: {
                coordinates: routeCoordinates,
                instructions: routeInstructions,
                distance: summary?.distance || 0,
                duration: summary?.duration || 0,
                summary: summary
            }
        });

    } catch (err) {
        console.error('Route loading error:', err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to load route" },
            { status: 500 }
        );
    }
}