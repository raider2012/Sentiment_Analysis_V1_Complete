import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
);

function App() {
  const [text, setText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [flashClass, setFlashClass] = useState('');

  const navigate = useNavigate();
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/history', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleViewHistory = async () => {
    await fetchHistory();
    setShowHistoryModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',  
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      setAnalysisResult(data);
      setHistory(prevHistory => [data, ...prevHistory]);
      setText('');
      console.log(data);
      if (data.HUGGING_FACE_Analysis==='Positive' || data.TEXTBLOB_Analysis === 'Positive' ) {
        setFlashClass('positive-flash');
      } else if (data.HUGGING_FACE_Analysis==='Negative' || data.TEXTBLOB_Analysis === 'Negative' ) {
        setFlashClass('negative-flash');
      } else {
        setFlashClass('');
      }
      setTimeout(() => setFlashClass(''), 2000);

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate('/login');
  };

  const getTextBlobPieData = () => {
    let negativeCount = 0;
    let neutralCount = 0;
    let positiveCount = 0;

    for (let entry of history) {
      if (entry.TEXTBLOB_Analysis === 'Negative') negativeCount++;
      else if (entry.TEXTBLOB_Analysis === 'Positive') positiveCount++;
      else neutralCount++;
    }

    return {
      labels: ['Negative', 'Neutral', 'Positive'],
      datasets: [
        {
          label: 'TextBlob Distribution',
          data: [negativeCount, neutralCount, positiveCount],
          backgroundColor: ['#ff6384', '#c9cbcf', '#36a2eb']
        }
      ]
    };
  };

  const getHuggingFacePieData = () => {
    let negativeCount = 0;
    let neutralCount = 0;
    let positiveCount = 0;

    for (let entry of history) {
      if (entry.HUGGING_FACE_Analysis === 'Negative') negativeCount++;
      else if (entry.HUGGING_FACE_Analysis === 'Positive') positiveCount++;
      else neutralCount++;
    }

    return {
      labels: ['Negative', 'Neutral', 'Positive'],
      datasets: [
        {
          label: 'Hugging Face Distribution',
          data: [negativeCount, neutralCount, positiveCount],
          backgroundColor: ['#ff6384', '#c9cbcf', '#36a2eb']
        }
      ]
    };
  };

  const getTextBlobLineData = () => {
    // Sort from oldest to newest
    const sortedHistory = [...history].reverse();
    const dataPoints = sortedHistory.map((entry, i) => ({
      x: i + 1,
      y: entry.TEXTBLOB_Analysis 
    }));

    return {
      datasets: [
        {
          label: 'TextBlob Over Time',
          data: dataPoints,
          borderColor: 'blue',
          backgroundColor: 'blue',
          tension: 0.2
        }
      ]
    };
  };

  const getHuggingFaceLineData = () => {
    const sortedHistory = [...history].reverse();
    const dataPoints = sortedHistory.map((entry, i) => ({
      x: i + 1,
      y: entry.HUGGING_FACE_Analysis
    }));

    return {
      datasets: [
        {
          label: 'Hugging Face Over Time',
          data: dataPoints,
          borderColor: 'orange',
          backgroundColor: 'orange',
          tension: 0.2
        }
      ]
    };
  };

  const lineChartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Time Step (Oldest → Newest)'
        },
        ticks: {
          stepSize: 1
        }
      },
      y: {
        type: 'category',
        labels: ['Positive', 'Neutral','Negative' ],
        title: {
          display: true,
          text: 'Sentiment'
        }
      }
    }
  };

  return (
    <div>
      {/* Background element */}
      <div className="background"></div>
      
      {/* Main container*/}
      <div className={`container ${flashClass}`}>
        <h1>Sentiment Analysis Dashboard</h1>

        {/*Text input and analysis button */}
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here..."
            rows="4"
            cols="50"
          />
          <br />
          <button type="submit">Analyze Sentiment</button>
        </form>

        {/* Latest analysis result */}
        {analysisResult && (
          <div className="result">
            <h2>Latest Analysis Result</h2>
            <div className="analysis-results">
              <div className="result-column">
                <h3>TextBlob</h3>
                <p>{analysisResult.TEXTBLOB_Analysis}</p>
              </div>
              <div className="result-column">
                <h3>Hugging Face</h3>
                <p>{analysisResult.HUGGING_FACE_Analysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* History Modal Button */}
        <button 
          className="history-button" 
          onClick={handleViewHistory}
        >
          View All Statements
        </button>

        {/* Log out button*/}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>

        <div className="charts-section">
        <div className="charts-row">
          <div className="chart-wrapper">
            <h3>Overall Sentiment (TextBlob)</h3>
            <Pie key={JSON.stringify(getTextBlobPieData())} data={getTextBlobPieData()} />
          </div>
          <div className="chart-wrapper">
            <h3>Overall Sentiment (Hugging Face)</h3>
            <Pie key={JSON.stringify(getHuggingFacePieData())} data={getHuggingFacePieData()} />
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-wrapper">
            <h3>Trend Over Time (TextBlob)</h3>
            <Line key={JSON.stringify(getTextBlobLineData())} data={getTextBlobLineData()} options={lineChartOptions} />
          </div>
          <div className="chart-wrapper">
            <h3>Trend Over Time (Hugging Face)</h3>
            <Line key={JSON.stringify(getHuggingFaceLineData())} data={getHuggingFaceLineData()} options={lineChartOptions} />
          </div>
        </div>
        </div>
      </div>

      {/* History Modal Structure */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close button */}
            <button 
              className="close-modal" 
              onClick={() => setShowHistoryModal(false)}
            >
              X
            </button>
            <h2>Analysis History</h2>
            <div className="scrollable-history">
              {history.length > 0 ? (
                <table className="history-table">
                <thead>
                  <tr>
                    <th>Text</th>
                    <th>TextBlob</th>
                    <th>Hugging Face</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.text}</td>
                      <td>{entry.TEXTBLOB_Analysis}</td>
                      <td>{entry.HUGGING_FACE_Analysis}</td>
                      <td>{entry.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              ) : (
                <p>No analysis history available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
