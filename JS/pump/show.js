const Chart = require('chart.js');
require("chartjs-chart-radial-gauge");
var headCalc = require('../../JS/pump/headCalculation');
require('../../JS/sensorData.service.js');

Chart.defaults.global.defaultFontFamily = 'Lato';


var urlParams = new URLSearchParams(window.location.search);
var deviceId = urlParams.get('id');
var pumpData = JSON.parse(localStorage.getItem(deviceId));

document.getElementById("title").innerHTML = "Mimir - " + pumpData["device_name"]
document.getElementById("tip-text").innerHTML = "Your device's id: " + deviceId +
  "<br><br>If you're not seeing data, make sure your sensors are uploading data to your server"
// Graph stuff
var ctx = document.getElementById("myChart").getContext('2d');
var efficiencyChart = new Chart(ctx, {
    type: 'line',
    data:  {
      datasets: [
        {
          label: 'Current',
          fill: false,
          borderColor: 'blue',
          data: []
        },

        {
          label: 'Optimal',
          fill: false,
          borderColor: 'green',
          data: []
        }
      ]
    },
    options: {
      responice: false,
      scales: {
          xAxes: [{
              display: true,
              type: 'time'
          }]
      }
    }
});

var cty = document.getElementById("mySecondChart").getContext('2d');
var flowChart = new Chart(cty, {
  type: 'line',
  data:  {
    datasets: [
      {
        label: 'Flow',
        fill: false,
        borderColor: 'blue',
        data: []
      },
      {
        label: 'Power',
        fill: false,
        borderColor: 'purple',
        data: []
      },
      {
        label: 'Head',
        fill: false,
        borderColor: 'green',
        data: []
      }
    ]
  },
  options: {
    responice: false,
    scales: {
        xAxes: [{
            display: true,
            type: 'time'
        }]
    }
  }
});

var ctz = document.getElementById("myThirdChart").getContext('2d');
var blue_green_gradient = ctz.createLinearGradient(0, 0, 0, 900);
blue_green_gradient.addColorStop(0, 'green');
blue_green_gradient.addColorStop(.2, 'blue');

var instantEfficiencyChart = new Chart(ctz, {
  type: 'radialGauge',
    data: {
        // labels: 'Speed',
        datasets: [{
            data: [0],
            backgroundColor: blue_green_gradient,
            borderColor: blue_green_gradient
        }]
    },
    options: {
        rotation: -Math.PI / 2,
        trackColor: 'rgba(255, 63, 168,.03)',
        centerPercentage: 80,
        roundedCorners: true,
        domain: [0, 103],
        centerArea: {
          displayText: true,
          text: function(value, options) {
            return value + '%';
          }
        }
    }
});

function roundVal(val, digits) {
  return Number(val.toFixed(digits))
}

mostRecentTimestamp = new Date(new Date() - (3600*24000));

function updateGraph(){
  var serverData = getPumpSensorData(deviceId, mostRecentTimestamp);

  serverData.then((values) => {
    values.forEach((value) => {
      timestamp = new Date(value["timestamp"])
      if (timestamp > mostRecentTimestamp){
        mostRecentTimestamp = timestamp
      }

      temp_flow = value.sensor_readings["flow_rate"];
      temp_motor = value.sensor_readings["motor_power"];

      var flowRateSensorSpec = [pumpData["flow_rate_output_min"], pumpData["flow_rate_output_max"], pumpData["flow_rate_measure_min"], pumpData["flow_rate_measure_max"]];
      var motorSensorSpec = [pumpData["motor_power_output_min"], pumpData["motor_power_output_max"], pumpData["motor_power_measured-min"], pumpData["motor_power_measured-max"]];

      var flowRate = sensorConversion(flowRateSensorSpec,temp_flow);
      var motor_power = sensorConversion(motorSensorSpec,temp_motor); //RANDOM NUMBER FOR NOW

      //Pump Style - (Index Based) from Form
      var pump_style = 0;
      var pump_style_name = pumpData["pump_type"];
      if (pump_style_name == "slurry") pump_style = 0;
      else if (pump_style_name == "sewage") pump_style = 1;
      else if (pump_style_name == "stock") pump_style = 2;
      else if (pump_style_name == "submersible") pump_style = 3;
      else if (pump_style_name == "api") pump_style = 4;
      else if (pump_style_name == "boiler") pump_style = 5;
      else if (pump_style_name == "ANSI/API") pump_style = 6;
      else if (pump_style_name == "axial") pump_style = 7;
      else if (pump_style_name == "double") pump_style = 8;
      else if (pump_style_name == "vertical") pump_style = 9;
      else if (pump_style_name == "end") pump_style = 10;
      else pump_style = 0; //Fail-Safe

      //Drive - (Index Based) from Form
      pump_drive_name = pumpData["pump_drive"];
      if (pump_drive_name == "direct") pump_drive = 0;
      else if (pump_drive_name == "v-belt") pump_drive = 1;
      else if (pump_drive_name == "notched") pump_drive = 2;
      else if (pump_drive_name == "sync") pump_drive = 3;
      else if (pump_drive_name == "efficiency") pump_drive = 4;
      else pump_drive = 0; //Fail-Safe

      pump_linefrequency_name = pumpData["line_frequency"];
      if (pump_linefrequency_name == "50 Hz") pump_line_frequency = 0;
      else if (pump_linefrequency_name == "60 Hz") pump_line_frequency = 1;
      else pump_line_frequency = 0; //Fail-Safe

      // ** Efficiency * (If efficiency class above is equivalent to "specified", user needs to input efficiency)
      pump_efficiency_name = pumpData["efficiency_class"];
      if (pump_efficiency_name == "Standard Efficiency") pump_efficiency_class = 0;
      else if (pump_efficiency_name == "Energy Efficient") pump_efficiency_class = 1;
      else if (pump_efficiency_name == "Premium Efficient") pump_efficiency_class = 2;
      //TODO not yet implemented, if "Specified" is selected, new input needs to be added for the user to manual input the efficiency
      else if (pump_efficiency_name == "Specified") pump_efficiency_class = 3;
      else pump_efficiency_class = 0 //Fail-Safe

      // ** Margin **

      //Field Data

      //Load Estimation Method - (Index Based) from Form
      pump_lem_name = pumpData["load_estimation_method"];
      if (pump_lem_name == "Power") pump_lem = 0;
      else if (pump_lem_name == "Current") pump_lem = 1;
      else pump_lem_name = 0; //Fail-Safe

      // var inp = {
      //   'pump_style': 2, 'pump_specified': 90, 'pump_rated_speed':1780, 'drive': 4, 'kinematic_viscosity': 1.0,
      //   'specific_gravity': 1.0, 'stages': 1.0, 'fixed_speed': 0, 'line_frequency': 0, 'motor_rated_power': 300,
      //   'motor_rated_speed': 1780, 'efficiency_class': 0, 'efficiency': 95, 'motor_rated_voltage': 460,
      //   'motor_rated_fla': 337.3, 'margin': 0, 'operating_hours': 8760, 'cost_kw_hour': 0.06, 'flow_rate': flowRate,
      //   'head': 277.0, 'load_estimation_method': 0, 'motor_field_power': 150.0, 'motor_field_current': 80.5,
      //   'motor_field_voltage': 460, 'baseline_pump_efficiency': 0.69, 'specifiedDriveEfficiency': 95
      // };

      var inp = {

        //Pump & Fluid
        'pump_style': pump_style, 'pump_specified': 90, 'pump_rated_speed':pumpData["pump_speed"], 'drive': pump_drive, 'kinematic_viscosity': pumpData["kinematic_viscosity"],
        'specific_gravity': pumpData["specific_gravity"], 'stages': pumpData["number_of_stages"], 'fixed_speed': 0,

        //Motor
        'line_frequency': pump_line_frequency, 'motor_rated_power': pumpData["rated_motor_power"],
        'motor_rated_speed': pumpData["motor_rpm"], 'efficiency_class': pump_efficiency_class, 'efficiency': 95, 'motor_rated_voltage': pumpData["rated_voltage"],
        'motor_rated_fla': pumpData["full_load_amps"], 'margin': 0,

        //Field Data
        'operating_hours': pumpData["operating_fraction"], 'cost_kw_hour': pumpData["cost"], 'flow_rate': flowRate,
        'head': 277.0, 'load_estimation_method': pump_lem_name, 'motor_field_power': motor_power, 'motor_field_current': 80.5,
        'motor_field_voltage': 460,

        //Additional Items
        'baseline_pump_efficiency': 0.69, 'specifiedDriveEfficiency': 95

      };

      var psatResult = psatAddon.resultsExisting(inp);
      var psatOptimalResult = psatAddon.resultsModified(inp);

      // var head = headCalc.computeHead();

      // Data Chart
      // Update Flow
      flowChart.data.datasets[0].data.push({x: timestamp, y: flowRate});
      // Update Power
      flowChart.data.datasets[1].data.push({x: timestamp, y: motor_power});
      // Update Head
      // flowChart.data.datasets[2].data.push({x: timestamp, y: head});
      flowChart.data.datasets[2].data.push({x: timestamp, y: 277});

      // Efficiency Chart

      // var inputs = {
      //   pump_style: pumpData['pump_type'],
      //   flow_rate: flowRate
      // };

      // var temp = psatAddon.pumpEfficiency(inputs);

      var efficient =  roundVal(psatResult.pump_efficiency, 2);
      var optimal =  roundVal(psatOptimalResult.pump_efficiency, 2);

      // Update Efficient
      efficiencyChart.data.datasets[0].data.push({x: timestamp, y: efficient});
      // Update Optimal
      efficiencyChart.data.datasets[1].data.push({x: timestamp, y: optimal});
      // Update Instant Efficiency
      instantEfficiencyChart.data.datasets[0].data[0] = efficient;
    })
  })

  instantEfficiencyChart.update();
  flowChart.update();
  efficiencyChart.update();
}

updateGraph()
setInterval(updateGraph, 5000);
module.exports = updateGraph;

// TODO
function hideGraph(){
  var vis_graph = document.getElementsByName('graph-vis');

  if (vis_graph[1].checked){
    $("#efficiencyChart").hide();
  }

}
