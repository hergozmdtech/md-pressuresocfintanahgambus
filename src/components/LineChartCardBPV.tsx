import React, { useEffect, useRef, useState } from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  DateTime,
  Tooltip,
  Legend,
  StripLine,
} from "@syncfusion/ej2-react-charts";
import wsManager from "../context/WebSocketManager";
import { roundToNearest, getStatusColor } from "../utils";
import { getApiBaseUrl } from "../config";

interface Props {
  title: string;
  tagName: string;
  tagStatus: string;
  historyMode?: boolean;
  startDate?: string;
  endDate?: string;
}

export const LineChartCardBPV: React.FC<Props> = ({
  title,
  tagName,
  tagStatus,
  historyMode,
  startDate,
  endDate,
}) => {
  const [dataPoints, setDataPoints] = useState<{ x: Date; y: number }[]>([]);
  const [status, setStatus] = useState("Unknown");
  const [limitUpper, setLimitUpper] = useState(3);
  const [limitLower, setLimitLower] = useState(0);
  const chartRef = useRef<ChartComponent | null>(null);

  const maxPoints = 3 * 60 * 60;
  const pointsRef = useRef<{ x: Date; y: number }[]>([]);
  const rafRef = useRef<number>();

  const updateDataPoints = () => {
    setDataPoints([...pointsRef.current]);
  };

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    let url: string;

    if (historyMode && startDate && endDate) {
      // History mode: fetch data for the selected range
      // Convert startDate and endDate to UTC ISO strings at 00:00:00 in the desired timezone (e.g., Asia/Jakarta)
      const tz = "Asia/Jakarta";
      const start = new Date(
        new Date(startDate + "T00:00:00").toLocaleString("en-US", { timeZone: tz })
      );
      const end = new Date(
        new Date(endDate + "T23:59:59").toLocaleString("en-US", { timeZone: tz })
      );
      url = `${baseUrl}/telemetry?start-at=${start.toISOString()}&end-at=${end.toISOString()}&tag=${tagName}`;
    } else {
      // Live mode: fetch recent data
      const now = new Date();
      const rounded = roundToNearest(now, 15);
      const minTime = new Date(rounded.getTime() - maxPoints * 1000);
      url = `${baseUrl}/telemetry?start-at=${minTime.toISOString()}&tag=${tagName}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then(({ values }) => {
        const parsed = values.map((v: any) => ({
          x: new Date(v.ts),
          y: v.value,
        }));
        pointsRef.current = parsed;
        updateDataPoints();
      })
      .catch(console.error);

    const handleMessage = (msg: { tag: string; value: string; ts: string }) => {
      const { tag, value, ts } = msg;

      if (tag === tagName) {
        const point = { x: new Date(ts), y: parseFloat(value) };
        const updated = [...pointsRef.current, point];
        if (updated.length > maxPoints) updated.shift();
        pointsRef.current = updated;

        cancelAnimationFrame(rafRef.current!);
        rafRef.current = requestAnimationFrame(() => updateDataPoints());
      }

      if (tag === tagStatus) {
        setStatus(mapStatus(parseInt(value)));
      }

      if (tag === "tagUL") setLimitUpper(parseFloat(value));
      if (tag === "tagLL") setLimitLower(parseFloat(value));
    };

  if (!(historyMode && startDate && endDate)) {
    wsManager.subscribe(tagName, handleMessage);
    wsManager.subscribe(tagStatus, handleMessage);
  }

    return () => {
      if (!(historyMode && startDate && endDate)) {
        wsManager.unsubscribe(tagName, handleMessage);
        wsManager.unsubscribe(tagStatus, handleMessage);
      }
    };
  }, [tagName]);

  const mapStatus = (v: number) => {
    switch (v) {
      case 0:
        return "Ok";
      case 1:
        return "Over Pressure";
      case 2:
        return "Under Pressure";
      case 3:
        return "None";
      case 4:
        return "Sensor Error";
      default:
        return "Unknown";
    }
  };

  const last = dataPoints[dataPoints.length - 1];
  let minTime: Date;
  let maxTime: Date;

  if (historyMode && startDate && endDate) {
    const tz = "Asia/Jakarta";
    minTime = new Date(
      new Date(startDate + "T00:00:00").toLocaleString("en-US", { timeZone: tz })
    );
    maxTime = new Date(
      new Date(endDate + "T23:59:59").toLocaleString("en-US", { timeZone: tz })
    );
    // Add one day to endDate to include the full day if needed
    // Optionally, if your endDate is exclusive, you can add a day:
    // maxTime.setDate(maxTime.getDate() + 1);
  } else {
    const now = last ? last.x : new Date();
    const rounded = roundToNearest(now, 15);
    minTime = new Date(rounded.getTime() - maxPoints * 1000);
    maxTime = new Date(rounded.getTime() + 15 * 60 * 1000);
  }

  return (
    <div
      className="chart-card"
      style={{
        border: "2px solid #000000", // BPV chart border color
        borderRadius: "10px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        marginBottom: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <h4>{title}</h4>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span>
            <b>{last ? `${last.y.toFixed(1)} Bar` : "No Data"}</b>
          </span>
          <span
            style={{
              color: getStatusColor(status),
              border: `1px solid ${getStatusColor(status)}`,
              padding: "2px 8px",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            {status}
          </span>
        </div>
      </div>

      <ChartComponent
        ref={chartRef}
        height="200px"
        enableCanvas={true}
        enableAnimation={false}
        tooltip={{ enable: true }}
        primaryXAxis={{
          valueType: "DateTime",
          title: "Time",
          labelFormat: "HH:mm",
          interval: 15,
          intervalType: "Minutes",
          labelRotation: -90,
          edgeLabelPlacement: "Shift",
          minimum: minTime,
          maximum: maxTime,
          // --- Add minor grid lines every 5 minutes ---
          minorTicksPerInterval: 2, // 15min interval / 3 = 5min per minor tick
          minorGridLines: {
            width: 1,
            color: "#b0b0b0",
            dashArray: "2,2",
          },
        }}
        primaryYAxis={{
          title: "Pressure (bar)",
          minimum: 0,
          maximum: 3,
          interval: 0.5,
          stripLines: [
            {
              start: limitUpper,
              end: 1000,
              text: "Over",
              color: "#ff0000",
              opacity: 0.3,
              visible: true,
            },
            {
              start: 1.5,
              end: limitUpper,
              color: "#00ff00",
              opacity: 0.3,
              visible: true,
            },
          ],
        }}
      >
        <Inject services={[LineSeries, DateTime, Legend, Tooltip, StripLine]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={dataPoints}
            xName="x"
            yName="y"
            type="Line"
            width={2}
            marker={{ visible: false }}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
};
