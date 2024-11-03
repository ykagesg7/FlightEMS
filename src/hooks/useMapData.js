import { useState, useEffect } from 'react';

const useMapData = () => {
  const [airbases, setAirbases] = useState([]);
  const [navaids, setNavaids] = useState([]);
  const [navaidsData, setNavaidsData] = useState(null);
  const [airportsData, setAirportsData] = useState(null);
  const [accSectorHighData, setAccSectorHighData] = useState(null);
  const [accSectorLowData, setAccSectorLowData] = useState(null);
  const [trainingAreaHigh, setTrainingAreaHigh] = useState(null);
  const [trainingAreaLow, setTrainingAreaLow] = useState(null);
  const [trainingAreaCivil, setTrainingAreaCivil] = useState(null);
  const [restrictedArea, setRestrictedArea] = useState(null);
  const [RAPCON, setRAPCON] = useState(null);

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
    
    // Fetch TrainingAreaHigh data
    fetch('/geojson/TrainingAreaHigh.geojson')
    .then(response => response.json())
    .then(data => {
      setTrainingAreaHigh(data);
    })
    .catch(error => console.error('Error loading TrainingAreaHigh data:', error));

    // Fetch TrainingAreaLow data
    fetch('/geojson/TrainingAreaLow.geojson')
    .then(response => response.json())
    .then(data => {
      setTrainingAreaLow(data);
    })
    .catch(error => console.error('Error loading TrainingAreaLow data:', error));

    // Fetch TrainingAreaCivil data
    fetch('/geojson/TrainingAreaCivil.geojson')
    .then(response => response.json())
    .then(data => {
      setTrainingAreaCivil(data);
    })
    .catch(error => console.error('Error loading TrainingAreaCivil data:', error));

    // Fetch RestrictedArea data
    fetch('/geojson/RestrictedAirspace.geojson')
    .then(response => response.json())
    .then(data => {
      setRestrictedArea(data);
    })
    .catch(error => console.error('Error loading RestrictedAirspace data:', error));

    // Fetch RAPCON data
    fetch('/geojson/RAPCON.geojson')
    .then(response => response.json())
    .then(data => {
      setRAPCON(data);
    })
    .catch(error => console.error('Error loading RAPCON data:', error));

  }, []);

  return { airbases, navaids, navaidsData, airportsData, accSectorHighData, accSectorLowData, trainingAreaHigh, trainingAreaLow, trainingAreaCivil, restrictedArea, RAPCON};
};

export default useMapData;