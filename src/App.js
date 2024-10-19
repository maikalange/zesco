// App.js
import React, { useState, useEffect } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { geoJSON } from 'leaflet';
import axios from 'axios';
import logo from './zesco.png'

// Custom marker icons for "hot" and "not hot" locations
const blueIcon = new L.Icon({
  iconUrl: './images/red-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'blue-marker',
});

const redIcon = new L.Icon({
  iconUrl: './images/green-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'red-marker',
});

const center = [51.5072178, -0.1275862]; // Centering map at London

export default function App() {
  const [markers, setMarkers] = useState([]);

  // Fetch all saved locations when the app loads
  useEffect(() => {
    axios.get('http://localhost:5000/locations')
      .then((res) => {
        setMarkers(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Handle user response (Yes/No)
  const handleResponse = (isHot) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newMarker = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          isHot,date:Date.now()
        };

        //point in GeoJSON
        //let geojson = `{"type":"point",location:[${newMarker.lat},${newMarker.lng}],"date": ${Date.now()}}`;

        console.log(newMarker);
        // Save the new marker to the backend
        axios.post('http://localhost:5000/locations', newMarker)
          .then((res) => {
            setMarkers([...markers, newMarker]);
          })
          .catch((err) => console.error(err));
      });
    }
  };

  return (
    <Box sx={{ padding: 1, textAlign: 'center' }}>
      <img src={logo} alt="ZESCO Load Shedding Tracker" width="60px"/>
      <Typography variant="h3" fontFamily="Courier, San Serif">ZESCO Tracker</Typography>
      <Box mt={2}>
        <MapContainer center={center} zoom={13} style={{ height: '600px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={[marker.lat, marker.lng]}
              icon={marker.isHot ? redIcon : blueIcon}
            >
              <Popup>
                {marker.isHot ? 'Power' : 'No Power'} at this location.
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
      
      <Typography variant="h6" mt={4}>
        Do you have ZESCO Power at your location?
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleResponse(true)}
          sx={{ marginRight: 2 }}
        >
          Yes
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleResponse(false)}
        >
          No
        </Button>
      </Box>
    </Box>
  );
}

//export default App;
