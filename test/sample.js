const Application = require('spectron').Application;
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const mock_local = require('mock-local-storage');
const Chart = require('chart.js');

return;

var electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');

const sleep = time => new Promise(r => setTimeout(r, time))

if (process.platform === 'win32') {
    electronPath += '.cmd';
}

var appPath = path.join(__dirname, '..');
var pagePath = path.join(appPath, 'HTML', 'pump', 'show.html')

var app = new Application({
    path: electronPath,
    args: [appPath]
});

global.before(function () {
    chai.should();
    chai.use(chaiAsPromised);
});

describe('Test Example', function () {
  this.timeout(30000);

  beforeEach(function () {
      return app.start();
  });

  afterEach(function () {
      return app.stop();
  });

  it('Goes to the page I want', async () =>{
    app.client.waitUntilWindowLoaded();
    data = {flow: 'gpm', pump_type: 'ANSI/API'};
    localStorage.setItem('data', data);
    app.browserWindow.loadURL(pagePath);
    app.client.waitUntilWindowLoaded();
    app.client.element("myChart").then((myChart) => {
      expect(myChart).to.not.equal(null);
    });
    // await sleep(5000);
    // chart = Chart.instances[0];
    // chartData = chart.data.datasets[0].data;
    // expect(chartData).to.equal([]);
  });

  it('opens a window', function () {
    return app.client.waitUntilWindowLoaded()
      .getWindowCount().should.eventually.equal(1);
  });

  it('tests the title', function () {
    return app.client.waitUntilWindowLoaded()
      .getTitle().should.eventually.equal('Mimir');
  });
});
