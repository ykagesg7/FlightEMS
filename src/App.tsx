import React, { useState } from 'react';
import TabsComponent from './components/Tabs';
import './index.css';
import { WeatherCacheProvider } from './contexts/WeatherCacheContext';
import MDXTester from './components/MDXTester';

function App() {
  const [showMDXTester, setShowMDXTester] = useState(false);
  
  return (
    <div className="App">
      <div className="mx-auto max-w-screen-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-indigo-900">Flight Academy</h1>
          <button 
            onClick={() => setShowMDXTester(!showMDXTester)}
            className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 transition"
          >
            {showMDXTester ? 'メインアプリに戻る' : 'MDXテスターを表示'}
          </button>
        </div>
        
        {showMDXTester ? (
          <MDXTester />
        ) : (
          <React.StrictMode>
            <WeatherCacheProvider>
              <TabsComponent />
            </WeatherCacheProvider>
          </React.StrictMode>
        )}
      </div>
    </div>
  );
}

export default App;