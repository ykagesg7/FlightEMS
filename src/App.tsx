import React from 'react';
import TabsComponent from './components/Tabs';
import './index.css';
import { WeatherCacheProvider } from './contexts/WeatherCacheContext';

function App() {
  return (
    <React.StrictMode>
      <WeatherCacheProvider>
        <TabsComponent />
      </WeatherCacheProvider>
    </React.StrictMode>
  );
}

export default App;