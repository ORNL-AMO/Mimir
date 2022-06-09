//TODO: Still need input validation as well as dynamic attributes
var custom = true;
var urlParams = new URLSearchParams(window.location.search);
var edit = false; //false means we are creating a new pump

function loadData(){
  id = urlParams.get('id');
  data = JSON.parse(localStorage.getItem(id));

  $.each(data, function(name, val) {
    var $el = $('[name="' + name + '"]'), type=$el.attr('type');
    switch (type) {
        case 'checkbox':
            $el.attr('checked', 'checked');
            break;
        case 'radio':
            $el.filter('[value="' + val + '"]').attr('checked', 'checked');
            break;
        default:
            $el.val(val);
        }
  });
}

$(document).ready(function(){
  if(urlParams.get('id') != null){
    edit = true;
    loadData();
  }

  document.getElementById("defaultOpen").click();
});

function dynamicFieldUpdate(){
    //Update Load Estimation Method
    var sensorLoad = document.getElementById('load_estimation_method');
    var formToUpdate = document.getElementById('load_estimation_method_display');
    formToUpdate.value = sensorLoad.value;
}

//Only Allow One Checkbox to be selected
function onlyAllowOneCheckbox(checkbox){
	var checkboxes = document.getElementsByName('measure');
	var checkboxes1 = document.getElementsByName('output');
    checkboxes.forEach((item) => {
        if (item != checkbox) item.checked = false
	})
	checkboxes1.forEach((item) =>{
		if (item != checkbox) item.checked = false
	})
}

function saveDevice(deviceName, deviceType, formInfo){
  if (edit){
    id = urlParams.get('id');
    updateDevice(id, deviceName, deviceType, formInfo)
    return new Promise((resolve, reject) => {
      resolve(id)
    })
  }

  return createDevice(deviceName, deviceType, formInfo);
}

//save all the fields.
function saveForm(){
  var deviceName = document.getElementById('device-name').value;

  formInfo = {};
  formInfo['device_name'] = deviceName;

  $('input, select, textarea').each( function(){
    var input = $(this);
    //Make sure element is not a child of headModal
    if (!input.parents('#headModal').length){
        if(input.attr("type") == "radio"){ //Radio Button
            if( input.is(":checked")){
            formInfo[input.attr("name")] = input.val();
            }
        }
        else{ //Other Buttons
            formInfo[input.attr("name")] = input.val();
        }
    }
  });

  //Save Form Values to Local Storage
  var headModal = storeHeadInputs(); //Get All Inputs From Modal
  formInfo['head_modal'] = headModal; //Store in FormInfo

  saveDevice(deviceName, "Pump", formInfo).then((deviceId) => {
    window.location.href = 'show.html?id=' + deviceId;
  })

}

$('.measure').click(function () {
    if (document.getElementById('measurement_type_imperial').checked)
        {
            var head = document.getElementById('head_measurement_unit');
            var flow = document.getElementById('flow_measurement_unit');
            var power = document.getElementById('power_measurement_unit');
            var pressure = document.getElementById('pressure_measurement_unit');
            var temp = document.getElementById('temp_measurement_unit');
            custom = false;

            head.value = "ft";
            flow.value = "gpm";
            power.value = "hp";
            pressure.value = "psi";
            temp.value = "Fahrenheit";
        }

    else if (document.getElementById('measurement_type_metric').checked)
        {
            var head = document.getElementById('head_measurement_unit');
            var flow = document.getElementById('flow_measurement_unit');
            var power = document.getElementById('power_measurement_unit');
            var pressure = document.getElementById('pressure_measurement_unit');
            var temp = document.getElementById('temp_measurement_unit');
            custom = false;

            head.value = "m";
            flow.value = "L/s";
            power.value = "KW";
            pressure.value = "kPa";
            temp.value = "Celcius";
        }
});
//checks to see if metric or imperial value has changed so that checkbox will automatically go to custom.
$('#form_part1').click(function () {
    if(!custom)
        {
            //custom = true;
            var head = document.getElementById('headMeasure');
            var flow = document.getElementById('flow');
            var power = document.getElementById('power');
            var pressure = document.getElementById('pressure');
            var temp = document.getElementById('temp');
            var imperial = document.getElementById('imperial');
            var metric = document.getElementById('metric');
            var customBox = document.getElementById('custom');

            var array = [head, flow, power, pressure, temp];
            for (var i = 0; i < array.length; i++){
                array[i].addEventListener('change', function () {
                    imperial.checked = false;
                    metric.checked = false;
                    customBox.checked = true;
                });
            }
        }
});

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}
