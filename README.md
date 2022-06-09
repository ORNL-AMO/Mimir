# Mimir
## What is Mimir?<br/>
Mimir is a live system performance analysis tool designed to give real time feedback about Pumps, Fans, Furnaces, and many more devices. **(Currently only supports pumps)**
### How does it work?<br/>
In order to get data from sensors into Mimir, you must first send data to a server hosting [Mimir's backend](https://github.com/ChrisCanyon/sensorAPI). For more information about connecting your data to Mimir click [here](https://github.com/ChrisCanyon/sensorAPI)
Once you have a server hosting Mimir's backend, you can follow the instructions here to setup the Mimir desktop app. With the app successfully configured, you can setup devices through Mimir's UI or load existing devices on your network.

## Clone the Repo
```
git clone https://github.com/ORNL-AMO/Mimir.git
cd Mimir
```

## Configuration: <br/>
  Python: 2.7<br/>
  Node: 9.11<br/>
  Node-gyp: 3.8<br/>
  amo-tools-suite: ^0.3.3<br/>

### Python: (Anaconda)<br/>
[Install Anaconda](https://www.anaconda.com/distribution/#download-section)<br/>
```
conda create -n mimir python=2.7 anaconda  
activate mimir
```

### Node:<br/>
Node Version Manager (nvm):<br/>
[Windows](https://github.com/coreybutler/nvm-windows)<br/>
[Mac/Linux](https://github.com/nvm-sh/nvm)<br/>
```
nvm install 9.11
nvm use 9.11
```

### Node-gyp:<br/>
[Install node-gyp](https://github.com/nodejs/node-gyp)<br/>

### amo-tools-suite:<br/>
[AMO-tools-suite](https://github.com/ORNL-AMO/AMO-Tools-Suite)<br/>

```
npm install amo-tools-suite
```

## npm install and electron-rebuild<br/>
Because the amo-tools-suite is built on some python components, you have to run electron-rebuild to build the python components<br/>
```
npm install
node_modules/.bin/electron_rebuild
```

## Running<br/>
To launch the Mimir desktop application run:
```
npm start
```
### In app Configuration<br/>
Before you can start analyzing device performance, Mimir needs to know the domain name that is hosting [Mimir's Backend](https://github.com/ChrisCanyon/sensorAPI). If you don't have the backend setup, you can use our demo backend free of charge! Just set the server URL to **https://demosensorapi.herokuapp.com**<br/>
### Run Tests<br/>
```
npm test
```
## Contributing
???
