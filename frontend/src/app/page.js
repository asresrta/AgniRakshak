'use client'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { CiTempHigh } from "react-icons/ci";
import { FaFire } from "react-icons/fa";
import { WiHumidity } from "react-icons/wi";
import Temp from './Components/Temp';

export default function Home() {
  const [temps, setTemps] = useState([]);
  const [humidity, setHumidity] = useState([]);
  const [gas, setGas] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/temp');
        const { temperature, timestamp, humidity: hum, mq2 } = res.data;

        setLabels((prev) => [...prev.slice(-19), new Date(timestamp * 1000).toLocaleTimeString()]);
        setTemps((prev) => [...prev.slice(-19), temperature]);
        setHumidity((prev) => [...prev.slice(-19), hum]);
        setGas((prev) => [...prev.slice(-19), mq2]);
      } catch (error) {
        console.error('Error fetching temperature:', error);
      }
    };

    fetchData(); // fetch immediately on mount

    const interval = setInterval(fetchData, 1000);
    // then every second
      const latestTemp = temps.length ? temps[temps.length - 1] : null;
  const latestHumidity = humidity.length ? humidity[humidity.length - 1] : null;
  const latestGas = gas.length ? gas[gas.length - 1] : null;

   let fireRisk = 'Low';
  if (latestGas !== null && latestHumidity !== null && latestTemp !== null) {
    if (latestGas > 100 || latestHumidity < 10 || latestTemp > 35) {
      fireRisk = 'High';
    }
  }

    return () => clearInterval(interval);
    
  }, []);

  const latestTemp = temps.length ? temps[temps.length - 1] : '-';
  const latestHumidity = humidity.length ? humidity[humidity.length - 1] : '-';
  const latestGas = gas.length ? gas[gas.length - 1] : '-';

  let fireRisk = 'Low';
  if (latestGas !== null && latestHumidity !== null && latestTemp !== null) {
    if (latestGas > 100 || latestHumidity < 10 || latestTemp > 35) {
      fireRisk = 'High';
    }
  }

  return (
    <>
      <div className="py-5 w-[90%] mx-auto">
        <div className="flex justify-between">
          {/* Temperature Card */}
          <div className="w-[22%] rounded-xl bg-white p-3">
            <div className="flex gap-2 items-center">
              <CiTempHigh size={25} />
              <div>Temperature</div>
            </div>
            <div className="font-bold text-[#715AB8] text-[30px]">{latestTemp} °C</div>
            <div className="text-[13px] text-[#706d6d]">Zone A - Living Room</div>
          </div>

          {/* Humidity Card */}
          <div className="w-[22%] rounded-xl bg-white p-3">
            <div className="flex gap-2 items-center">
              <WiHumidity size={25} />
              <div>Humidity</div>
            </div>
            <div className="font-bold text-[#715AB8] text-[30px]">{latestHumidity} %</div>
            <div className="text-[13px] text-[#706d6d]">Zone A - Living Room</div>
          </div>

          {/* Gas Level Card */}
          <div className="w-[22%] rounded-xl bg-white p-3">
            <div className="flex gap-2 items-center">
              <CiTempHigh size={25} />
              <div>Gas Level</div>
            </div>
            <div className="font-bold text-[#715AB8] text-[30px]">{latestGas}</div>
            <div className="text-[13px] text-[#706d6d]">Zone A - Living Room</div>
          </div>

          {/* Fire Risk Card */}
          <div className="w-[22%] rounded-xl bg-white p-3">
            <div className="flex gap-2 items-center">
              <FaFire size={25} />
              <div>Fire Risk</div>
            </div>
            <div className="font-bold text-[#715AB8] text-[30px]">{fireRisk}</div>
            <div className="text-[13px] text-[#706d6d]">Zone A - Living Room</div>
          </div>
        </div>
      </div>

      <div className="py-3 w-[90%] mx-auto">
        {/* Pass data arrays and labels to your Temp graph component */}
        <Temp temps={temps} humidity={humidity} gas={gas} labels={labels} />
      </div>
    </>
  );
}
