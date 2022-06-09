$(document).ready(function(){
  url = localStorage.getItem("server_url")
  if (url != null){
    document.getElementById("url-name").value = url
  }
});

function setURL(){
  url = document.getElementById("url-name").value;
  localStorage.setItem("server_url", url)
};

function submit(){
  setURL()
}
