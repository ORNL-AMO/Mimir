var psatAddon = require('../../node_modules/amo-tools-suite/build/Release/psat.node');
var convert = require('convert-units');

function roundVal(val, digits) {
  return Number(val.toFixed(digits))
}

function getPumpEfficiency (flowRate, pumpData) {
  //flow rate = 'gpm'
  if (pumpData['flow_measurement_unit'] != 'gpm') {
    //TODO add convertUnitsService
    // flowRate = convert(flowRate).from(settings.flowMeasurement).to('gpm');
  }
  // TODO make pumpData['pump_type'] be pumpData['pumpStyle']
  var inputs = {
      pump_style: pumpData['pump_type'],
      flow_rate: flowRate
  };

  var tmpResults = psatAddon.pumpEfficiency(inputs);
  var results = {
      average: this.roundVal(tmpResults.average, 2),
      max: this.roundVal(tmpResults.max, 2),
      current: this.roundVal((tmpResults.average)/1.05, 2)
  };
  return results;
}

module.exports = getPumpEfficiency;
