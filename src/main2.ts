import "./style.css";
import * as d3 from "d3";

import { barChart } from "./bar-chart";
import { Int32, Table, Utf8 } from "apache-arrow";
import { db } from "./duckdb";
import parquet from "./pittsburgh-air-quality.parquet?url";

const app = document.querySelector("#app")!;

// Create the chart. The specific code here makes some assumptions that may not hold for you.
const chart = barChart();

//update the code to sql that get the polluten
async function update(location: string) {
  // Query DuckDB for the data we want to visualize.
  await conn.query(
    `CREATE OR REPLACE VIEW pol AS
    SELECT * FROM "pittsburgh-air-quality.parquet" WHERE "City" = '${location}'`
  )

  await conn.query(
    `CREATE OR REPLACE VIEW PM2p5_table AS
    SELECT "PM2.5" from pol where "PM2.5" < 10`
  )

  await conn.query(
    `CREATE OR REPLACE VIEW PM10_table AS
    SELECT PM10 from pol where PM10 > 0`
  )

  await conn.query(
    `CREATE OR REPLACE VIEW Ozone_table AS
    SELECT Ozone from pol where Ozone > 0`
  )


  const data: Table<{ pollutant: Utf8; cnt: Int32 }> = await conn.query(`
  SELECT 'US AQI' as pollutant, count()::INT as cnt from pol
  UNION ALL
  SELECT 'PM2.5', count()::INT from PM2p5_table
  UNION ALL
  SELECT 'PM10', count()::INT from PM10_table
  UNION ALL
  SELECT 'Ozone', count()::INT from Ozone_table
  `);

  // Get the X and Y columns for the chart. Instead of using Parquet, DuckDB, and Arrow, we could also load data from CSV or JSON directly.
  const X = data.getChild("cnt")!.toArray();
  const Y = data
    .getChild("pollutant")!
    .toJSON()
    .map((d) => `${d}`);

  chart.update(X, Y);
}

// Load a Parquet file and register it with DuckDB. We could request the data from a URL instead.
const res = await fetch(parquet);
await db.registerFileBuffer(
  "pittsburgh-air-quality.parquet", //replace with my file
  new Uint8Array(await res.arrayBuffer())
);

// Query DuckDB for the locations.
const conn = await db.connect();

console.log("Running here");
//replace location with city and the data
const locations: Table<{ location: Utf8 }> = await conn.query(`
SELECT DISTINCT City
FROM "pittsburgh-air-quality.parquet"`);

console.log(locations);

// Create a select element for the locations.
const select = d3.select(app).append("select");
for (const location of locations) {
  select.append("option").text(location.City);
}

select.on("change", async () => {
  const location = select.property("value");
  update(location);
});

// Update the chart with the first location.
update("Avalon");

// Add the chart to the DOM.
app.appendChild(chart.element);
