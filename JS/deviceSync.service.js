function saveToLocalStorage(deviceId, deviceName, deviceType, deviceInfo){
  localStorage.setItem(deviceId, JSON.stringify(deviceInfo))
  devices = JSON.parse(localStorage.getItem("devices"))
  devices[deviceId] = {
    device_name: deviceName,
    device_type: deviceType
  }
  localStorage.setItem("devices", JSON.stringify(devices))
}

function createDevice(deviceName, deviceType, deviceInfo){
  baseUrl = localStorage.getItem("server_url")
  url = baseUrl + "/devices"

  data = { device_name: deviceName, type: deviceType, data: deviceInfo}
  dataString = jQuery.param(data)

  return jQuery.post(url, dataString).then((data) => {
    deviceId = data["device_id"]
    saveToLocalStorage(deviceId, deviceName, deviceType, deviceInfo)
    return deviceId
  })
}

function updateDevice(deviceId, deviceName, deviceType, deviceInfo){
  baseUrl = localStorage.getItem("server_url")
  url = baseUrl + "/devices/" + deviceId

  saveToLocalStorage(deviceId, deviceName, deviceType, deviceInfo)
  return $.ajax({
    url: url,
    type: 'PUT',
    data: {
      device_name: deviceName,
      type: deviceType,
      data: deviceInfo
    },
  });
}

function deleteDeviceFromServer(deviceId){
  baseUrl = localStorage.getItem("server_url")
  url = baseUrl + "/devices/" + deviceId

  $.ajax({
    url: url,
    type: 'DELETE'
  });
}

// TODO make this sync only data since last time synced
function syncDevices(){
  baseUrl = localStorage.getItem("server_url")
  url = baseUrl + "/devices"

  return jQuery.get(url).then((devices) => {
    devicesHash = {}
    devices.forEach((device) => {
      id = device["id"]
      devicesHash[id] = {
        device_name: device["device_name"],
        device_type: device["device_type"]
      }
      localStorage.setItem(id, device["data"]);
    })
    localStorage.setItem("devices", JSON.stringify(devicesHash))
  })
}
