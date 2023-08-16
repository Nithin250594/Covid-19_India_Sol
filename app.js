const express = require("express");
const app = express();
module.exports = app;

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "covid19India.db");

app.use(express.json());
let db = null;

const initializingDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3003);
  } catch (e) {
    console.log(`DB-error:${e.message}`);
    process.exit(1);
  }
};

initializingDBAndServer();

// API 1

app.get("/states/", async (request, response) => {
  const statesListQuery = `
    SELECT * FROM state;`;

  const statesList = await db.all(statesListQuery);
  const modifiedStatesList = (statesList) => {
    return {
      stateId: statesList.state_id,
      stateName: statesList.state_name,
      population: statesList.population,
    };
  };

  response.send(statesList.map((eachState) => modifiedStatesList(eachState)));
});

// API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT * FROM state
    WHERE state_id=${stateId};`;

  const getState = await db.get(getStateQuery);
  const modifiedGetState = () => {
    return {
      stateId: getState.state_id,
      stateName: getState.state_name,
      population: getState.population,
    };
  };

  response.send(modifiedGetState());
});

//API 3

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const postDistrictQuery = `
    INSERT INTO 
    district (district_name,state_id,cases,cured,active,deaths)
    VALUES
    (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
    );`;

  const postDistrictDetails = await db.run(postDistrictQuery);
  response.send("District Successfully Added");
});

//API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT * FROM district
    WHERE district_id=${districtId};`;

  const getDistrict = await db.get(getDistrictQuery);

  const modifiedGetDistrict = () => {
    return {
      districtId: getDistrict.district_id,
      districtName: getDistrict.district_name,
      stateId: getDistrict.state_id,
      cases: getDistrict.cases,
      cured: getDistrict.cured,
      active: getDistrict.active,
      deaths: getDistrict.deaths,
    };
  };
  response.send(modifiedGetDistrict());
});

//API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM district
    WHERE district_id=${districtId};`;

  const deleteDistrict = await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;

  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const putDistrictQuery = `
    UPDATE district
    SET 
    district_name='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    
    WHERE district_id=${districtId};`;

  const putDistrict = await db.run(putDistrictQuery);
  response.send("District Details Updated");
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `
    SELECT SUM(cases),SUM(cured),SUM(active),SUM(deaths) FROM district
    WHERE state_id=${stateId};`;

  const getStats = await db.get(getStatsQuery);

  const modifiedGetStats = () => {
    return {
      totalCases: getStats["SUM(cases)"],
      totalCured: getStats["SUM(cured)"],
      totalActive: getStats["SUM(active)"],
      totalDeaths: getStats["SUM(deaths)"],
    };
  };

  response.send(modifiedGetStats());
});

//API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const stateQuery = `
    SELECT state.state_name FROM state
    NATURAL JOIN district
    WHERE district_id=${districtId};`;

  const stateDetails = await db.get(stateQuery);

  const modifiedStateDetails = () => {
    return {
      stateName: stateDetails.state_name,
    };
  };

  response.send(modifiedStateDetails());
});
