import { useState, useEffect } from 'react';

const useMapData = () => {
  const [airbases, setAirbases] = useState([]);
  const [navaids, setNavaids] = useState([]);
  const [navaidsData, setNavaidsData] = useState(null);
  const [airportsData, setAirportsData] = useState(null);
  const [accSectorHighData, setAccSectorHighData] = useState(null);
  const [accSectorLowData, setAccSectorLowData] = useState(null);

  useEffect(() => {
    // Fetch airbase data
    fetch('/geojson/Airports.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const processedAirbases = data.features.map(feature => ({
          id: feature.properties.id,
          name: `${feature.properties.name1} (${feature.properties.name2})`,
          lat: feature.properties["ARP.N(DD)"],
          lng: feature.properties["ARP.E(DD)"]
        }));
        setAirbases(processedAirbases);
        setAirportsData(data);
      })
      .catch(error => {
        console.error('Error loading airbase data:', error);
      });

    // Fetch Navaids data
    fetch('/geojson/Navaids.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setNavaidsData(data);
        const processedNavaids = data.features.map(feature => ({
          id: feature.properties.id,
          name: feature.properties.name,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        }));
        setNavaids(processedNavaids);
      })
      .catch(error => {
        console.error('Error loading navaids data:', error);
      });

    // Fetch ACC Sector High data
    fetch('/geojson/ACC_Sector_High.geojson')
      .then(response => response.json())
      .then(data => {
        setAccSectorHighData(data);
      })
      .catch(error => console.error('Error loading ACC_Sector_High data:', error));

    // Fetch ACC Sector Low data
    fetch('/geojson/ACC_Sector_Low.geojson')
      .then(response => response.json())
      .then(data => {
        setAccSectorLowData(data);
      })
      .catch(error => console.error('Error loading ACC_Sector_Low data:', error));
  }, []);

  return { airbases, navaids, navaidsData, airportsData, accSectorHighData, accSectorLowData };
};

export default useMapData;