import "./style.css";
import * as d3 from "d3";

import { lineChart } from "./line-chart";
import { Int32, Table, Utf8 } from "apache-arrow";
import { db } from "./duckdb";
import parquet from "./pittsburgh-air-quality.parquet?url";

const app = document.querySelector("#app")!;

// Create the chart. The specific code here makes some assumptions that may not hold for you.
const chart = lineChart();

async function update(City: string) {
  // Query DuckDB for the data we want to visualize.
  let daily_aqi_data: Table<{ day_of_week: Utf8; 
                              day_aqi: Int32  }>; 
  if(City == "All")
  {
    daily_aqi_data = await conn.query(`                           
    SELECT strftime("Timestamp(UTC)", '%Y-%m-%d') as day_of_week, "US AQI" as day_aqi
    FROM pittsburgh-air-quality.parquet'`);
  }
  else { //City != "All" aka city is selected
    daily_aqi_data = await conn.query(`                           
    SELECT strftime("Timestamp(UTC)", '%Y-%m-%d') as day_of_week, "US AQI" as day_aqi
    FROM pittsburgh-air-quality.parquet
    WHERE City = '${City}'`);
  }

  let data: Table<{ date: Utf8; 
                    AQILo: Int32; 
                    AQIHi: Int32; 
                    avg_AQI: Int32 }>;
  if (City == "All") //no city selected
  {
    data = await conn.query(`
    SELECT strftime(date_trunc('month', "Timestamp(UTC)")+15, '%Y-%m') as date, quantile_cont("US AQI", 0.1) as AQILo, quantile_cont("US AQI", 0.9) as AQIHi, avg("US AQI") as avg_AQI
    FROM pittsburgh-air-quality.parquet
    GROUP BY date
    ORDER BY date ASC`); 
  }
  else
  { //City != "All" aka city is selected
    data = await conn.query(`
    SELECT strftime(date_trunc('month', "Timestamp(UTC)")+15, '%Y-%m') as date, quantile_cont("US AQI", 0.1) as AQILo, quantile_cont("US AQI", 0.9) as AQIHi, avg("US AQI") as avg_AQI
    FROM pittsburgh-air-quality.parquet
    WHERE City = '${City}'
    GROUP BY date
    ORDER BY date ASC`); 
  }

  // Get the X and Y columns for the chart. Instead of using Parquet, DuckDB, and Arrow, we could also load data from CSV or JSON directly.
  //help
  const Y = data.getChild("avg_AQI")!.toArray();
  const Y_aqi_low = data.getChild("AQILo")!.toArray();
  const Y_aqi_hi = data.getChild("AQIHi")!.toArray();
  const X = data.getChild("date")!.toJSON().map((d) => `${d}`);
  const day = daily_aqi_data.getChild("day_of_week")!.toArray();
  const d_aqi = daily_aqi_data.getChild("day_aqi")!.toArray();
  chart.update(X, Y, Y_aqi_low, Y_aqi_hi, day, d_aqi);
}

// Load a Parquet file and register it with DuckDB. We could request the data from a URL instead.
const res = await fetch(parquet);
await db.registerFileBuffer(
  "pittsburgh-air-quality.parquet",
  new Uint8Array(await res.arrayBuffer())
);

// Query DuckDB for the locations.
const conn = await db.connect();

const locations: Table<{ cnt : Int32 ; city: Utf8 }> = await conn.query(`
  SELECT count(City) as cnts, DISTINCT City
  FROM pittsburgh-air-quality.parquet
  GROUP by City`);

// Create a select element for the locations.
const select = d3.select(app).append("select");
for (const location of locations) {
  select.append("option").text(location.City + " (" +location.cnts+ ")")
}

select.on("change",  () => {
  const location = select.property("value");
  update(location.split(" ")[0]);
});

// Update the chart with the first location.
update("Lawrenceville");

// Add the chart to the DOM.
app.appendChild(chart.element);

