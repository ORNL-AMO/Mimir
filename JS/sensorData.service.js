function getSensorData(sensorType, since, deviceId){
  baseUrl = localStorage.getItem("server_url")
  url = baseUrl + "/sensors/" + sensorType

  params = {id: deviceId, since: since.toUTCString()}
  return jQuery.get(url, params)
}

function getPumpSensorData(pumpId, since){
  pumpSensors = ["flow_rate", "discharge_elevation", "discharge_pressure", "suction_pressure", "tank_fluid_surface_elevation",
                "tank_gas_overpressure", "motor_power"]
  data = []
  rawData = []

  //TODO flip or flop on which data to get for head calculation
  pumpSensors.forEach((sensor) => {
    rawData.push(getSensorData(sensor, since, pumpId))
  });

  return Promise.all(rawData).then((values) => {
    min = Number.MAX_SAFE_INTEGER;
    minIndex = 0;

    // find the smallest sensor dataset
    values.forEach((value, index) => {
      if (value.length < min){
        min = value.length
        minIndex = index
      }
    })

    // combine sensor datasets into one package
    values[minIndex].forEach((sensorReading) => {

      keyTimestamp = new Date(sensorReading["timestamp"])
      // find timestamps close to sensorReading
      packagedSensorData = {timestamp: keyTimestamp, sensor_readings: {}}

      packagedSensorData["sensor_readings"][pumpSensors[minIndex]] = sensorReading["sensor_reading"]

      // loop through all sensors
      values.forEach((sensorDataset, i) => {
        // skip the sensor data that we are using as our keyTimestamp
        if(i == minIndex) {
          return
        }

        // if packagedSensorData is set to null there was an incomplete dataset
        if(packagedSensorData == null){
          return
        }


        possibleMatches = []
        // find sensor reading with timestamps similar to keyTimestamp
        sensorDataset.forEach((sensorData, j) => {
          currentTimestamp = new Date(sensorData["timestamp"])

          // if currentTimestamp is within 500ms of keyTimestamp consider them part of the same group
          if (Math.abs(currentTimestamp.getTime() - keyTimestamp.getTime()) <= 1000){
              possibleMatches.push(j)
          }
        })

        match = null
        // if no possible matches make null
        if (possibleMatches.length == 0){
          packagedSensorData = null
          return
        // if more than one match, find closest match
        } else if (possibleMatches.length > 1){
          // find possible match that abs(time - keyTimestamp) == min value
          min = Number.MAX_SAFE_INTEGER
          possibleMatches.forEach((indexToCheck) => {
            timestamp = new Date(sensorDataset[indexToCheck]["timestamp"])
            timeDifference = Math.abs(timestamp.getTime() - keyTimestamp.getTime())
            if(min > timeDifference){
              min = timeDifference
              match = indexToCheck
            }
          })
        } else {
          match = possibleMatches[0]
        }


        // add match to packagedSensorData
        packagedSensorData["sensor_readings"][pumpSensors[i]] = sensorDataset[match]["sensor_reading"]

        // remove match from sensorDataset
        sensorDataset.splice(match, 1)
      })

      if (packagedSensorData != null){
        data.push(packagedSensorData)
      }
    })

    return data
  })
}

/*

Using Sensor Conversion Method
1st Parameter - sensorSpecs
  sensorSpecs Dictionary Format (MUST BE IN THIS ORDER) - Comes from the user-inputed specifications on the form
      1. output_min (Minimum output voltage)
      2. output_max (Maximum output voltage)
      3. measured_min (Minimum measured value range)
      4. measured_max (Maximum measured value range)

2nd Parameter - measuredVoltage (Comes directly from the sensor)

RETURNS: Actual Scaled Output To Use For Calculations Or Display to User on Graph

*/

function sensorConversion(sensorSpecs, measuredVoltage){
  var output = Object.keys(sensorSpecs).map(function(key) {
    return {ranges: key, value: sensorSpecs[key]};
  });

  var out_min = output[0].value; //Output Min
  var out_max = output[1].value; //Output Max
  var range_min = output[2].value; //Measured Min
  var range_max = output[3].value; //Measured Max

  //Calculate Offset
  var offset = out_max - ((out_max - out_min)/(range_max - range_min)) * range_max;

  //Calculate Scaled Output
  var scaled_output = (measuredVoltage*(range_max - range_min) - offset*(range_max - range_min))/(out_max - out_min);

  //Return Scaled Output
  return scaled_output;
}


module.exports = {
  sensorConversion: sensorConversion,
  getPumpSensorData: getPumpSensorData
};
