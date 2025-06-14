'use client'
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Temp() {
  const [labels, setLabels] = useState([]);
  const [temps, setTemps] = useState([]);
  const [humidity,setHumidity]=useState([])
  const [gas,setGas]=useState([])
  const chartRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/temp');
        const { temperature, timestamp, humidity: hum, mq2} = res.data;

        setLabels((prev) => [...prev.slice(-19), new Date(timestamp * 1000).toLocaleTimeString()]);
        setTemps((prev) => [...prev.slice(-19), temperature]);
        setHumidity((prev) => [...prev.slice(-19), hum]);
        setGas((prev) => [...prev.slice(-19), mq2]);
      } catch (error) {
        console.error('Error fetching temperature:', error);
      }
    }, 1000); // every second

    return () => clearInterval(interval);
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temps,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        min: 15,
        max: 40,
        title: { display: true, text: 'Temperature (°C)' }
      },
    },
  };

  return (
    <div style={{ padding: '2rem' }} className='h-[600px] w-[1200px] bg-white rounded-2xl'>
      <h1 className='font-semibold text-[20px]'>🌡️ Live Temperature Monitoring</h1>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
