import { NextResponse } from "next/server";

export async function POST(req, res) {
    try {
        const data = await req.json();
        const { origin, destination } = data;

        console.log('Received request:', { origin, destination });

        const ORS_API_KEY = process.env.ORS_API_KEY;

        if (!ORS_API_KEY) {
            return NextResponse.json(
                { success: false, error: "ORS API Key nicht gefunden" },
                { status: 500 }
            );
        }

        const geocodeLocation = async (location) => {
            const geocodeUrl = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(location)}`;

            const response = await fetch(geocodeUrl);
            const data = await response.json();

            console.log(`Geocoding result for ${location}:`, data);

            if (data.features && data.features.length > 0) {
                const coordinates = data.features[0].geometry.coordinates;
                return coordinates; // [longitude, latitude]
            } else {
                throw new Error(`Keine Koordinaten für ${location} gefunden`);
            }
        };

        // Koordinaten für beide Standorte abrufen
        const [originCoords, destinationCoords] = await Promise.all([
            geocodeLocation(origin),
            geocodeLocation(destination)
        ]);

        console.log('Coordinates:', { originCoords, destinationCoords });

        // Distance Matrix API Request
        const matrixUrl = `https://api.openrouteservice.org/v2/matrix/driving-car`;

        const matrixBody = {
            locations: [originCoords, destinationCoords],
            sources: [0],
            destinations: [1],
            metrics: ["distance", "duration"],
            units: "km"
        };

        const matrixResponse = await fetch(matrixUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(matrixBody)
        });

        if (!matrixResponse.ok) {
            const errorText = await matrixResponse.text();
            console.error('ORS API Error:', errorText);
            throw new Error(`ORS API Fehler: ${matrixResponse.status} - ${errorText}`);
        }

        const matrixData = await matrixResponse.json();
        console.log('Matrix API response:', matrixData);

        // Entfernung extrahieren (in Kilometern)
        // The response format is: distances: [ [ 31.26 ] ]
        const distanceKm = matrixData.distances[0][0]; // First element of first array
        const durationSeconds = matrixData.durations[0][0]; // First element of first array
        
        const durationMinutes = Math.round(durationSeconds / 60);
        
        console.log('Extracted values:', { distanceKm, durationSeconds, durationMinutes });

        return NextResponse.json({
            success: true,
            data: {
                distanz: `${distanceKm.toFixed(1)} km`,
                fahrtzeit: `${durationMinutes} Minuten`,
                origin: origin,
                destination: destination,
                originCoords: originCoords,
                destinationCoords: destinationCoords
            }
        });

    } catch (err) {
        console.error('Distance calculation error:', err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to calculate distance" },
            { status: 500 }
        );
    }
}