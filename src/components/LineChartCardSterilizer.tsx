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
  ChartAnnotation,
} from "@syncfusion/ej2-react-charts";
import wsManager from "../context/WebSocketManager";
import { roundToNearest, getStatusColor } from "../utils";
import { getApiBaseUrl } from "../config";

interface Props {
  title: string;
  tagName: string;
  tagStatus: string;
  tagHA: string;
  tagTHA: string;
  historyMode?: boolean;
  startDate?: string;
  endDate?: string;
}

type ChartPoint = { x: Date; y: number };

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ✅ Inject static styles once
if (!document.getElementById("afblast-style")) {
  const style = document.createElement("style");
  style.id = "afblast-style";
  style.innerHTML = `
    .afblast-text {
      font-size: 16px;
      font-weight: bold;
      color: #e91e63;
    }
    .holding-text {
      font-size: 16px;
      font-weight: bold;
      color: #0000FF;
    }
  `;
  document.head.appendChild(style);
}

export const LineChartCardSterilizer: React.FC<Props> = ({
  title,
  tagName,
  tagStatus,
  tagHA,
  tagTHA,
  historyMode,
  startDate,
  endDate,
}) => {
  const [status, setStatus] = useState("Unknown");
  const [isAfblast, setIsAfblast] = useState(false);
  const [afblastInfo, setAfblastInfo] = useState<{
    timestamp: string;
    pressure: number;
    description: string;
    status: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(0.0);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const chartRef = useRef<ChartComponent | null>(null);
  const pointsRef = useRef<ChartPoint[]>([]);
  const maxPoints = 3 * 60 * 60; // 3 hours worth of seconds

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

  const mapHA = (v: number) => {
    switch (v) {
      case 1:
        return "Holding";
      case 2:
        return "AFBLAST";
      default:
        return "";
    }
  };

  const handleMessage = (msg: { tag: string; value: string; ts: string }) => {
    const { tag, value, ts } = msg;
    const time = new Date(ts);
    const val = parseFloat(value);

    if (tag === tagName) {
      const newPoint: ChartPoint = { x: time, y: val };
      pointsRef.current.push(newPoint);
      if (pointsRef.current.length > maxPoints) pointsRef.current.shift();
    }

    if (tag === tagStatus) {
      setStatus(mapStatus(parseInt(value)));
    } else if (tag === tagHA) {
      const active = val === 2 || val === 1;
      setIsAfblast(active);
      const last = pointsRef.current[pointsRef.current.length - 1];
      if (active && last) {
        setAfblastInfo({
          timestamp: time.toLocaleTimeString(),
          pressure: last.y,
          description: mapHA(val),
          status,
        });
      } else {
        setAfblastInfo(null);
      }
    } else if (tag === tagTHA) {
      setCountdown(parseFloat(value));
    }
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
        const parsed: ChartPoint[] = values.map((v: any) => ({
          x: new Date(v.ts),
          y: v.value,
        }));
        pointsRef.current = parsed;
        setChartData([...pointsRef.current]);
      })
      .catch(console.error);

    const interval = setInterval(() => {
      setChartData([...pointsRef.current]);
    }, 1000); // ⏱️ Update chart every second

  if (!(historyMode && startDate && endDate)) {
    wsManager.subscribe(tagName, handleMessage);
    wsManager.subscribe(tagStatus, handleMessage);
    wsManager.subscribe(tagHA, handleMessage);
    wsManager.subscribe(tagTHA, handleMessage);
  }

    return () => {
      clearInterval(interval);
      if (!(historyMode && startDate && endDate)) {
        wsManager.unsubscribe(tagName, handleMessage);
        wsManager.unsubscribe(tagStatus, handleMessage);
        wsManager.unsubscribe(tagHA, handleMessage);
        wsManager.unsubscribe(tagTHA, handleMessage);
      }
    };
  }, [tagName]);

  const last = pointsRef.current[pointsRef.current.length - 1];
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

  const chartBorderColor =
    isAfblast && afblastInfo !== null
      ? afblastInfo.description === "Holding"
        ? "#0000FF"
        : "#e91e63"
      : "#333";

  const annotationText =
    isAfblast && afblastInfo !== null
      ? `<div class="${
          afblastInfo.description === "Holding"
            ? "holding-text"
            : "afblast-text"
        }">[${afblastInfo.description} - ${formatSeconds(countdown)}]</div>`
      : "<div></div>";

  return (
    <div
      className="chart-card"
      style={{
        paddingTop: "32px",
        border: `3px solid ${chartBorderColor}`,
        padding: "16px",
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
              border: `2px solid ${getStatusColor(status)}`,
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
        tooltip={{ enable: true }}
        enableAnimation={false}
        annotations={[
          {
            content: annotationText,
            coordinateUnits: "Pixel",
            x: "50%",
            y: 20,
            horizontalAlignment: "Center",
            verticalAlignment: "Top",
          },
        ]}
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
          maximum: 2.5,
          interval: 0.5,
          stripLines: [
            {
              start: 2.5,
              end: 1000,
              text: "Over",
              color: "#ff0000",
              opacity: 0.3,
              visible: true,
            },
            {
              start: 1.5,
              end: 2.5,
              text: "Cooking Area",
              color: "#00ff00",
              opacity: 0.3,
              visible: true,
            },
            {
              start: -10,
              end: 0.5,
              text: "Blowdown",
              color: "#ffff00",
              opacity: 0.3,
              visible: true,
            },
          ],
        }}
      >
        <Inject
          services={[
            LineSeries,
            DateTime,
            Legend,
            Tooltip,
            StripLine,
            ChartAnnotation,
          ]}
        />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={chartData}
            xName="x"
            yName="y"
            type="Line"
            width={2}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
};
