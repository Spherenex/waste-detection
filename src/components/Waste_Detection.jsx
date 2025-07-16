import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

export default function WasteDetectionDashboard() {
  const [wasteData, setWasteData] = useState({ DRY: 0, WET: 0 });
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [totalCounts, setTotalCounts] = useState({ DRY: 0, WET: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const firebaseConfig = {
       databaseURL: "https://waterdtection-default-rtdb.firebaseio.com/",
      };

      const app = initializeApp(firebaseConfig);
      const database = getDatabase(app);
      const wasteDetectionRef = ref(database, 'Waste_Detection');

      let prevDry = 0;
      let prevWet = 0;

      const unsubscribe = onValue(
        wasteDetectionRef,
        (snapshot) => {
          const data = snapshot.val();
          console.log('Firebase data:', data);
          if (data) {
            const formattedData = {
              DRY: Number(data.DRY),
              WET: Number(data.WET)
            };
            console.log('Setting wasteData:', formattedData);
            setWasteData(formattedData);

            if (prevDry === 0 && formattedData.DRY === 1) {
              setTotalCounts((prev) => ({
                ...prev,
                DRY: prev.DRY + 1
              }));
            }
            if (prevWet === 0 && formattedData.WET === 1) {
              setTotalCounts((prev) => ({
                ...prev,
                WET: prev.WET + 1
              }));
            }

            prevDry = formattedData.DRY;
            prevWet = formattedData.WET;
            setConnectionStatus('Connected');
          } else {
            console.log('No data received from Firebase');
            setConnectionStatus('No data available');
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Firebase data fetch error:', error);
          setConnectionStatus(`Error: ${error.message}`);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setConnectionStatus(`Error: ${error.message}`);
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="dashboard-container">
      {isLoading ? (
        <div>Loading data...</div>
      ) : (
        <>
          <div className="header">
            <h1>Waste Detection Dashboard</h1>
            <div className={`status-indicator ${connectionStatus === 'Connected' ? 'connected' : 'disconnected'}`}>
              {connectionStatus}
            </div>
          </div>

          <div className="stats-container">
            <div className="stat-card">
              <h2>Dry Waste</h2>
              <div className="stat-value">{wasteData.DRY}</div>
              {wasteData.DRY === 1 && (
                <>
                  {console.log('Dry alert rendering')}
                  <div className="alert-message">Dry detected</div>
                </>
              )}
              <div className="total-count">Total Count: {totalCounts.DRY}</div>
            </div>

            <div className="stat-card">
              <h2>Wet Waste</h2>
              <div className="stat-value">{wasteData.WET}</div>
              {wasteData.WET === 1 && (
                <>
                  {console.log('Wet alert rendering')}
                  <div className="alert-message">Wet detected</div>
                </>
              )}
              <div className="total-count">Total Count: {totalCounts.WET}</div>
            </div>
          </div>

          <div className="total-card">
            <h2>Total Detections</h2>
            <div className="stat-value">{totalCounts.DRY + totalCounts.WET}</div>
          </div>

          {wasteData.DRY === 1 && wasteData.WET === 1 && (
            <>
              {console.log('Combined alert rendering')}
              <div className="combined-alert">Both Dry and Wet waste detected!</div>
            </>
          )}
        </>
      )}
      
      <style jsx>{`
        .dashboard-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }
        
        .header h1 {
          margin: 0;
          color: #333;
        }
        
        .status-indicator {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }
        
        .connected {
          background-color: #d4edda;
          color: #155724;
        }
        
        .disconnected {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .total-card {
          background-color: #e6f7ff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          margin-bottom: 20px;
        }
        
        h2 {
          margin-top: 0;
          color: #555;
          font-size: 18px;
        }
        
        .stat-value {
          font-size: 36px;
          font-weight: bold;
          color: #333;
          margin: 10px 0;
        }
        
        .alert-message {
          margin: 10px auto;
          padding: 8px;
          background-color: #ffebee;
          color: #f44336;
          border-radius: 4px;
          font-weight: bold;
          max-width: 80%;
        }
        
        .combined-alert {
          margin: 0 auto 20px;
          padding: 12px;
          background-color: #ffebee;
          color: #f44336;
          border-radius: 4px;
          font-weight: bold;
          text-align: center;
          font-size: 16px;
          border: 2px solid #f44336;
        }
        
        .total-count {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </div>
  );
}