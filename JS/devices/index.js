function noDevices(){
  var textnode = document.createTextNode("No devices");
  document.getElementById("no_devices").appendChild(textnode);
}

function loadPage(){
  try {
    devices = JSON.parse(localStorage.getItem("devices"));
  } catch (error){
    // What to do if no devices exist
    noDevices();
  }
  // What to do if no devices exist
  if (Object.keys(devices).length == 0) {
    noDevices();
  }

  list = document.getElementById("device_list");

  // create list of devices
  Object.keys(devices).forEach(function (key) {
    var device = devices[key]
    var newLi = document.createElement("LI");
    var textnode = document.createTextNode(device["device_name"] + " (" + device["device_type"] + ") ");         // Create a text node
    newLi.appendChild(textnode);

    var trash = document.createElement("i");
    trash.setAttribute("onclick", "deleteDevice(event)");
    trash.setAttribute("class", "fas fa-trash-alt");

    var pencil = document.createElement("i");
    pencil.setAttribute("onclick", "editDevice(event)");
    pencil.setAttribute("class", "fas fa-pencil-alt");

    newLi.appendChild(pencil);
    newLi.appendChild(trash);

    newLi.setAttribute("id", key);
    newLi.setAttribute("data-type", device["device_type"]);
    newLi.setAttribute("onclick", "loadDevice(this.id)")
    list.appendChild(newLi);
  });
}

$(document).ready(function(){
  syncDevices().then(() => {
    loadPage()
  })
});

function editDevice(event){
  event.stopPropagation();
  id = event.path[1].getAttribute("id");
  deviceType = event.path[1].getAttribute("data-type");
  switch (deviceType) {
    case "Pump":
      window.location.href = "../pump/form.html?id=" + id
      break;
    default:
  }
}

function deleteDevice(event){
  event.stopPropagation();
  message = "Are you sure you want to delete this device?"
  if(!confirm(message)){
    return
  }

  id = event.path[1].getAttribute("id")
  deviceType = event.path[1].getAttribute("data-type");

  //remove device from screen
  event.path[2].removeChild(event.path[1]);
  if(event.path[2].childElementCount == 0){
    noDevices();
  }
  // remove device from localStorage
  delete devices[id];
  localStorage.setItem("devices", JSON.stringify(devices));
  localStorage.removeItem(id);
  deleteDeviceFromServer(id);
}

function loadDevice(id){
  deviceType = event.path[0].getAttribute("data-type");

  switch (deviceType) {
    case "Pump":
      window.location.href = "../pump/show.html?id=" + id
      break;
    default:
  }
}
