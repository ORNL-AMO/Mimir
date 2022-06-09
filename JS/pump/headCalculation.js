var psatAddon = require('../../node_modules/amo-tools-suite/build/Release/psat.node');
var sensors = require('../../JS/sensorData.service.js');

  //  Functions for Form 

//Inject Modal Information Into Current Form
$('.li-modal').on('click', function(e){
    e.preventDefault();
    $('#headModal').modal('show').find('.modal-content').load($(this).attr('href'));

    //Load Values From Local Storage
    if (edit){
      $(document).ready(function(){
        console.log("Loading Modal Values from Local Storage");
        data = JSON.parse(localStorage.getItem(id));
        headData = data['head_modal'];
        $.each(headData, function(name, val) {
          var $el = $('#' + name);
          if ($el.attr("type") == "radio"){
            $el.filter('[value="' + val + '"]').attr('checked', 'checked');
          }
          else{
            $el.val(val);
          }
        });
      });
    }
});

function hideMe(id){
  //Show Element
 idm = document.getElementById(id);
 toHide = idm.parentElement.parentElement.nextElementSibling.nextElementSibling
 toHide.setAttribute("style","display: none")
}

function showMe(id){
  //Hide Element
 idm = document.getElementById(id);
 toHide = idm.parentElement.parentElement.nextElementSibling.nextElementSibling
 toHide.setAttribute("style","display: show")
}


  // Storing From Form

function storeHeadInputs(){
  var head = {}; //Store head values to structure
  var tab = $('.tab-content .active').attr('id'); //Get Last Active Tab

  //Suction-Tank-Elevation Tab (1st Tab)
  if (tab == "Suction-Tank-Elevation"){
    head["with_suction"] = true;
    $('#Suction-Tank-Elevation-Form input').each( function(){    
      var input = $(this);
      if(input.attr("type") == "radio"){ //Radio Button
          if( input.is(":checked")){
          //test[$(this).attr("name")] = $("input[type='radio']:checked").val();
          head[input.attr("name")] = input.val();
          }
      }
      else{ //Other Buttons
          head[input.attr("name")] = input.val();
      } 
    });
  }
  //Suction-Guage-Elevation Tab (2nd Tab)
  else{
    head["with_suction"] = false;
    $('#Suction-Gauge-Elevation-Form input').each( function(){    
      var input = $(this);
      if(input.attr("type") == "radio"){ //Radio Button
          if( input.is(":checked")){
          //test[$(this).attr("name")] = $("input[type='radio']:checked").val();
          head[input.attr("name")] = input.val();
          }
      }
      else{ //Other Buttons
          head[input.attr("name")] = input.val();
      } 
    });
  }
  //Return to form.js where information will be saved to database
  return head;
}

  // Calculations

 //Calculate Head -> At this point, data has been saved to localstorage and id has been saved
function computeHead(sensor_readings){ //sensor readings should contain everything for doing head calculation if function is called

  //Get Head Information from Storage
  var deviceToLoad = urlParams.get('id');
  var pumpData = JSON.parse(localStorage.getItem(deviceToLoad));
  headSpecs = pumpData['head_modal'];

  //Flow Rate and Specific Gravity are the same no matter if suction is needed or not
  var fluid_specific_gravity = headSpecs['fluid_specific_gravity']; //Specific Gravity

  //Flow Rate
  var measuredFR = sensor_readings.sensor_readings['flow_rate']; //Comes from Sensor
  var fr_specs = { ["output_min"]: pumpData["flow_rate_output_min"], ["output_max"]: pumpData["flow_rate_output_max"], ["measured_min"]: pumpData["flow_rate_measure_min"], ["measured_max"]: pumpData["flow_rate_measure_max"] }; //Get Output Min/Max, Measured Min/Max
  var flow_rate = sensors.sensorConversion(fr_specs, measuredFR);

  //Check If Suction is Needed or not
  var with_suction = headSpecs['with_suction']; //(Returns True or False)

  //Calculate Head With Suction (1st Tab of Head Modal)
  if (with_suction){
    

    //Suction

                        //From Pump Form
    var pipe_diameter = headSpecs['ste_suction_pd']; //Get Suction Pipe Diameter
    var suction_llc = headSpecs['ste_suction_llc']; //Suction Line Loss Coefficients

                        // Handle Sensors
                
    //Suction Tank Gas Overpressure (SENSOR) 
    var tgo_specs = { ["output_min"]: headSpecs["ste_suction_tgo_outmin"], ["output_max"]: headSpecs["ste_suction_tgo_outmax"], ["measured_min"]: headSpecs["ste_suction_tgo_measuremin"], ["measured_max"]: headSpecs["ste_suction_tgo_measuremax"] };
    var measuredTGO = sensor_readings.sensor_readings['tank_gas_overpressure']; //Get Value from server
    var tank_gas_overpressure = sensors.sensorConversion(tgo_specs, measuredTGO); //Convert to scaled output

    //Suction Tank Fluid Surface Elevation (SENSOR)
    var tfse_specs = { ["output_min"]: headSpecs["ste_suction_tfse_outmin"], ["output_max"]: headSpecs["ste_suction_tfse_outmax"], ["measured_min"]: headSpecs["ste_suction_tfse_measuremin"], ["measured_max"]: headSpecs["ste_suction_tfse_measuremax"] };
    var measuredTFSE = sensor_readings.sensor_readings['tank_fluid_surface_elevation']; //Get Value from server
    var tank_fluid_surface_elevation = sensors.sensorConversion(tfse_specs, measuredTFSE); //Convert to scaled output



    //Discharge

                        //From Pump Form
    var discharge_pipe_diameter = headSpecs['ste_discharge_pd']; //Discharge Pipe Diameter
    var discharge_llc = headSpecs['ste_discharge_llc']; //Discharge Line Loss Coefficients 

                        // Handle Sensors

    //Discharge Guage Pressure (SENSOR)
    var dgp_specs = { ["output_min"]: headSpecs["ste_discharge_gp_outmin"], ["output_max"]: headSpecs["ste_discharge_gp_outmax"], ["measured_min"]: headSpecs["ste_discharge_gp_measuremin"], ["measured_max"]: headSpecs["ste_discharge_gp_measuremax"] };
    var measuredDGP = sensor_readings.sensor_readings['discharge_pressure'];
    var discharge_gauge_pressure = sensors.sensorConversion(dgp_specs, measuredDGP); 

    //Discharge Guage Elevation (SENSOR)
    var dge_specs = { ["output_min"]: headSpecs["ste_discharge_ge_outmin"], ["output_max"]: headSpecs["ste_discharge_ge_outmax"], ["measured_min"]: headSpecs["ste_discharge_ge_measuremin"], ["measured_max"]: headSpecs["ste_discharge_ge_measuremax"] };
    var measuredDGE = sensor_readings.sensor_readings['discharge_elevation'];
    var discharge_gauge_elevation = sensors.sensorConversion(dge_specs, measuredDGE); 

    //Store in structure to pass to AMO Tools Suite
    var input = {
      specificGravity: fluid_specific_gravity, //Form
      flowRate: flow_rate, //Sensor
      suctionPipeDiameter: pipe_diameter, //Form
      suctionTankGasOverPressure: tank_gas_overpressure, //Sensor
      suctionTankFluidSurfaceElevation: tank_fluid_surface_elevation, //SENSOR
      suctionLineLossCoefficients: suction_llc, //Form
      dischargePipeDiameter: discharge_pipe_diameter, //Form
      dischargeGaugePressure: discharge_gauge_pressure, //Sensor
      dischargeGaugeElevation: discharge_gauge_elevation, //Sensor
      dischargeLineLossCoefficients: discharge_llc //Form
    };

    //Call AMO Tools Suite Function Calculate Head
    var headValue = psatAddon.headToolSuctionTank(input);
    return headValue.pumpHead;
    
    
  }
  //Calculate Head Without Suction (2nd Tab of Head Modal)
  else{

    //Suction
    
                              //From Pump Form

    var pipe_diameter = headSpecs['sge_suction_pd']; //Get Suction Pipe Diameter
    var suction_llc = headSpecs['suction_guage_llc']; //Suction Line Loss Coefficients 
    var suction_gauge_elevation = headSpecs['sge_suction_ge']; //Suction Gauge Elevation

                              // Handle Sensors

    //Suction Gauge Pressure (SENSOR)
    //TODO: Check if sensor conversion has already been done
    var sgp_specs = { ["output_min"]: headSpecs['sge_suction_gp_outmin'], ['output_max']: headSpecs['sge_suction_gp_outmax'], ['measured_min']: headSpecs['sge_suction_gp_measuremin'], ['measured_max']: headSpecs['sge_suction_gp_measuremax'] }; //Get Output Min/Max, Measured Min/Max
    var measuredSGP = sensor_readings.sensor_readings['suction_pressure']; //Get Value from server
    var suction_gauge_pressure = sensors.sensorConversion(sgp_specs, measuredSGP);  //Convert to scaled output


    //Discharge
    
                                //From Pump Form

    var discharge_pipe_diameter = headSpecs['sge_discharge_pd']; //Discharge Pipe Diameter
    var discharge_llc = headSpecs['sge_discharge_llc']; //Discharge Line Loss Coefficients 

                              // Handle Sensors
    
    //Discharge Guage Pressure (SENSOR)
    //TODO: Check if sensor has already been done
    var dgp_specs = { ["output_min"]: headSpecs['sge_discharge_gp_outmin'], ["output_max"]: headSpecs['sge_discharge_gp_outmax'], ["measured_min"]: headSpecs['sge_discharge_gp_measuremin'], ["measured_max"]: headSpecs['sge_discharge_gp_measuremax'] }; //Get Output Min/Max, Measured Min/Max
    var measuredDGP = sensor_readings.sensor_readings['discharge_pressure']; //Get Value from server
    var discharge_gauge_pressure = sensors.sensorConversion(dgp_specs, measuredDGP); //Convert to scaled output


    //Discharge Guage Elevation (SENSOR)
    //TODO: Check if sensor has already been done
    var dge_specs = { ["output_min"]: headSpecs['sge_discharge_ge_outmin'], ["output_max"]: headSpecs['sge_discharge_ge_outmax'], ["measured_min"]: headSpecs['sge_discharge_ge_measuremin'], ["measured_max"]: headSpecs['sge_discharge_ge_measuremax'] }; //Get Output Min/Max, Measured Min/Max
    var measuredDGE = sensor_readings.sensor_readings['discharge_elevation']; //Get value from server
    var discharge_gauge_elevation = sensors.sensorConversion(dge_specs, measuredDGE); //Convert to scaled output

    
    //Store in structure to pass to AMO Tools Suite
    var input = {
      specificGravity: fluid_specific_gravity, //Form
      flowRate: flow_rate, //Sensor 
      suctionPipeDiameter: pipe_diameter, //Form
      suctionGaugePressure: suction_gauge_pressure, //Sensor
      suctionGaugeElevation: suction_gauge_elevation, //Form
      suctionLineLossCoefficients: suction_llc, //Form
      dischargePipeDiameter: discharge_pipe_diameter, //Form
      dischargeGaugePressure: discharge_gauge_pressure, //Sensor
      dischargeGaugeElevation: discharge_gauge_elevation, //Sensor
      dischargeLineLossCoefficients: discharge_llc //Form
    };
    //Call AMO Tools Suite Function Calculate Head
    var headValue = psatAddon.headTool(input);
    return headValue.pumpHead;

  }
}

module.exports = {
  computeHead: computeHead
};

