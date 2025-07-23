"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, X, MapPin, Navigation } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function CompanyPopup({ isOpen, onClose, data, onAddToTable, onDontAdd }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [showMap, setShowMap] = useState(false)
  const [routeData, setRouteData] = useState(null)
  const [mapError, setMapError] = useState(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // Debug logging
  console.log('CompanyPopup rendered with data:', data);
  console.log('showMap:', showMap);
  console.log('routeData:', routeData);

  // Lade die Route für die Kartenanzeige
  const loadRoute = async () => {
    console.log('loadRoute called');
    console.log('originCoords:', data?.originCoords);
    console.log('destinationCoords:', data?.destinationCoords);
    
    if (!data?.originCoords || !data?.destinationCoords) {
      console.log('Missing coordinates, skipping route loading');
      setMapError('Koordinaten nicht verfügbar');
      return;
    }

    try {
      const response = await fetch('/api/get_route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: data.originCoords,
          end: data.destinationCoords
        })
      })

      const result = await response.json()
      console.log('Route API response:', result);
      
      if (result.success) {
        setRouteData(result.data)
        setMapError(null) // Clear any previous errors
      } else {
        console.error('Route API error:', result.error);
        setMapError(`Route Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Route:', error)
      setMapError(`Network Error: ${error.message}`);
    }
  }

  // Initialisiere die Karte mit Leaflet
  useEffect(() => {
    console.log('Map useEffect triggered:', { 
      showMap, 
      mapRefCurrent: !!mapRef.current, 
      mapInstanceCurrent: !!mapInstanceRef.current,
      hasData: !!data,
      hasCoords: !!(data?.originCoords && data?.destinationCoords)
    });
    
    if (!showMap || !mapRef.current) return
    
    // Clean up existing map instance before creating new one
    if (mapInstanceRef.current) {
      console.log('Cleaning up existing map instance');
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Error cleaning up existing map:', e);
      }
      mapInstanceRef.current = null
    }

    // Additional cleanup of DOM element
    if (mapRef.current) {
      // Clear any Leaflet-specific properties
      if (mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id;
      }
      // Clear HTML content
      mapRef.current.innerHTML = '';
    }

    const initMap = async () => {
      try {
        console.log('Starting map initialization...');
        
        // Validate data first
        if (!data || !data.originCoords || !data.destinationCoords) {
          console.log('No valid data or coordinates available for map');
          setMapError('Keine gültigen Koordinaten verfügbar');
          return;
        }

        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if mapRef is still valid
        if (!mapRef.current) {
          console.log('Map ref became null during initialization');
          return;
        }
        
        // Load Leaflet CSS if not already loaded
        if (!leafletLoaded) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
          document.head.appendChild(link);
          setLeafletLoaded(true);
          
          // Wait for CSS to load
          await new Promise(resolve => {
            link.onload = resolve;
            setTimeout(resolve, 1000); // Fallback
          });
        }
        
        // Dynamisch Leaflet laden (nur im Browser)
        const L = (await import('leaflet')).default
        console.log('Leaflet loaded successfully');

        // Complete cleanup of map container
        if (mapRef.current) {
          // Remove any existing Leaflet map data
          mapRef.current.innerHTML = '';
          mapRef.current._leaflet_id = null;
          // Remove any data attributes
          const attrs = mapRef.current.attributes;
          for (let i = attrs.length - 1; i >= 0; i--) {
            if (attrs[i].name.startsWith('data-')) {
              mapRef.current.removeAttribute(attrs[i].name);
            }
          }
        }

        // Fix für Standard-Marker-Icons in Leaflet
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        // Validate coordinates are arrays with correct length
        if (!Array.isArray(data.originCoords) || data.originCoords.length !== 2 ||
            !Array.isArray(data.destinationCoords) || data.destinationCoords.length !== 2) {
          console.error('Invalid coordinate format:', { 
            origin: data.originCoords, 
            destination: data.destinationCoords 
          });
          setMapError('Ungültiges Koordinatenformat');
          return;
        }

        const [originLng, originLat] = data.originCoords
        const [destLng, destLat] = data.destinationCoords

        // Validate coordinate values
        if (typeof originLat !== 'number' || typeof originLng !== 'number' ||
            typeof destLat !== 'number' || typeof destLng !== 'number' ||
            isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
          console.error('Invalid coordinate values:', { originLat, originLng, destLat, destLng });
          setMapError('Ungültige Koordinatenwerte');
          return;
        }

        console.log('Creating map with coordinates:', { originLat, originLng, destLat, destLng });

        // Karte initialisieren - use a center point between the two coordinates
        const centerLat = (originLat + destLat) / 2;
        const centerLng = (originLng + destLng) / 2;
        
        // Create map with error handling
        let map;
        try {
          map = L.map(mapRef.current, {
            center: [centerLat, centerLng],
            zoom: 10,
            zoomControl: true,
            attributionControl: true,
            preferCanvas: false,
            fadeAnimation: false,
            zoomAnimation: false,
            markerZoomAnimation: false
          });
        } catch (mapError) {
          console.error('Error creating Leaflet map:', mapError);
          setMapError(`Karte konnte nicht erstellt werden: ${mapError.message}`);
          return;
        }

        // OpenStreetMap Tiles hinzufügen
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 1,
          detectRetina: true,
          crossOrigin: true
        });
        
        tileLayer.addTo(map);
        
        // Wait for tiles to load before proceeding
        await new Promise(resolve => {
          tileLayer.on('load', resolve);
          // Fallback timeout
          setTimeout(resolve, 2000);
        });

        // Benutzerdefinierte Icons erstellen
        const createCustomIcon = (color, label) => {
          return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background: ${color}; 
              color: white; 
              border-radius: 50%; 
              width: 30px; 
              height: 30px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              border: 2px solid white; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              font-size: 12px;
            ">${label}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        }

        const startIcon = createCustomIcon('#22c55e', 'U')
        const endIcon = createCustomIcon('#ef4444', 'S')

        // Marker hinzufügen
        const startMarker = L.marker([originLat, originLng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`
            <div style="color: #374151;">
              <strong style="color: #22c55e;">🏢 Unternehmen</strong><br/>
              <strong>${data.unternehmen || 'Unbekannt'}</strong><br/>
              ${data.unternehmensStandort || 'Unbekannt'}
            </div>
          `)

        const endMarker = L.marker([destLat, destLng], { icon: endIcon })
          .addTo(map)
          .bindPopup(`
            <div style="color: #374151;">
              <strong style="color: #ef4444;">🎓 Partnerschule</strong><br/>
              <strong>${data.partnerschule || 'Unbekannt'}</strong><br/>
              ${data.partnerschuleStandort || 'Unbekannt'}
            </div>
          `)

        // Route anzeigen, falls verfügbar
        let routeLayer = null;
        if (routeData && routeData.coordinates && Array.isArray(routeData.coordinates)) {
          console.log('Adding route to map, coordinates count:', routeData.coordinates.length);
          
          // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
          const routeCoords = routeData.coordinates.map(coord => {
            if (Array.isArray(coord) && coord.length >= 2) {
              return [coord[1], coord[0]]; // Convert [lng, lat] to [lat, lng]
            }
            return null;
          }).filter(coord => coord !== null);

          if (routeCoords.length > 0) {
            routeLayer = L.polyline(routeCoords, {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
              dashArray: '5, 10'
            }).addTo(map);

            routeLayer.bindPopup(`
              <div style="color: #374151;">
                <strong>🚗 Route</strong><br/>
                Distanz: <strong>${data.distanz || (routeData.distance ? (routeData.distance/1000).toFixed(1) + ' km' : 'Unbekannt')}</strong><br/>
                Fahrtzeit: <strong>${data.fahrtzeit || (routeData.duration ? Math.round(routeData.duration/60) + ' Minuten' : 'Wird berechnet...')}</strong>
              </div>
            `);
          }
        }

        // Create bounds that include both markers and route
        const bounds = L.latLngBounds([
          [originLat, originLng],
          [destLat, destLng]
        ]);

        // If route exists, extend bounds to include all route points
        if (routeLayer) {
          bounds.extend(routeLayer.getBounds());
        }

        // Force map to invalidate size after container is ready
        setTimeout(() => {
          if (map && mapRef.current) {
            map.invalidateSize();
          }
        }, 100);

        // Fit map to bounds with padding
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 15 
        });

        // Another size invalidation after fitting bounds
        setTimeout(() => {
          if (map && mapRef.current) {
            map.invalidateSize();
          }
        }, 300);

        mapInstanceRef.current = map
        console.log('Map initialized successfully');
        setMapError(null); // Clear any errors
        
      } catch (error) {
        console.error('Map initialization error:', error);
        setMapError(`Map Init Error: ${error.message}`);
      }
    }

    initMap()

    return () => {
      console.log('Map useEffect cleanup');
      if (mapInstanceRef.current) {
        console.log('Cleaning up map instance');
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error cleaning up map:', e);
        }
        mapInstanceRef.current = null;
      }
      // Clean DOM element
      if (mapRef.current) {
        if (mapRef.current._leaflet_id) {
          delete mapRef.current._leaflet_id;
        }
        mapRef.current.innerHTML = '';
      }
    }
  }, [showMap, routeData, data])

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      console.log('Dialog closed, cleaning up map');
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Error cleaning up map on dialog close:', e);
      }
      mapInstanceRef.current = null;
      setShowMap(false);
      setRouteData(null);
      setMapError(null);
    }
  }, [isOpen])

  const handleToggleMap = () => {
    console.log('handleToggleMap called, current showMap:', showMap);
    setShowMap(prev => !prev)
    if (!showMap && data?.originCoords && data?.destinationCoords) {
      loadRoute()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Neues Unternehmen gefunden
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-4 py-4">
            {/* Unternehmensdaten */}
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded-lg border-l-4 border-blue-500">
                <label className="text-sm font-medium text-gray-300">Unternehmen</label>
                <p className="text-white font-semibold">{data?.unternehmen || 'Nicht gefunden'}</p>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-300">Unternehmen Standort</label>
                <p className="text-white font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  {data?.unternehmensStandort || 'Nicht gefunden'}
                </p>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-300">Partnerschule</label>
                <p className="text-white font-semibold">{data?.partnerschule || 'Nicht gefunden'}</p>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-300">Partnerschule Standort</label>
                <p className="text-white font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {data?.partnerschuleStandort || 'Nicht gefunden'}
                </p>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-300">Kernkompetenz</label>
                <p className="text-white font-semibold">{data?.kernkompetenz || "Wird ermittelt..."}</p>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg border-l-4 border-yellow-500">
                <label className="text-sm font-medium text-gray-300">Distanz & Fahrtzeit</label>
                <p className="text-white font-semibold flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  {data?.distanz || 'Wird berechnet...'} • {data?.fahrtzeit || 'Wird berechnet...'}
                </p>
              </div>

              {mapError && (
                <div className="bg-red-600 p-3 rounded-lg">
                  <label className="text-sm font-medium text-white">Map Error</label>
                  <p className="text-white text-sm">{mapError}</p>
                </div>
              )}

              <Button 
                onClick={handleToggleMap}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                disabled={!data?.originCoords || !data?.destinationCoords}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {showMap ? 'Karte ausblenden' : 'Route auf Karte anzeigen'}
              </Button>
            </div>

            {/* Karte - wird unter den Daten angezeigt */}
            {showMap && (
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-300">Routenkarte</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Unternehmen</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Schule</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1 bg-blue-500"></div>
                        <span>Route</span>
                      </div>
                    </div>
                  </div>
                  <div 
                    ref={mapRef} 
                    className="w-full h-96 rounded border border-gray-600 bg-gray-600"
                    style={{ 
                      minHeight: '384px',
                      height: '384px',
                      width: '100%',
                      position: 'relative',
                      zIndex: 0
                    }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={onAddToTable} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Zur Tabelle hinzufügen
              </Button>

              <Button
                onClick={onDontAdd}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Nicht hinzufügen
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}