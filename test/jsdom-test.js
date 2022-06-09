const assert = require('assert');
const jsdom = require('jsdom');
const mock_local = require('mock-local-storage');
const Chart = require('chart.js');

options = {
  resources: 'usable',
  runScripts: 'outside-only'
};



describe('my test', () => {
  beforeEach(() => {
    jsdom.JSDOM.fromFile("HTML/pump/show.html", options).then((dom) => {
        window = dom.window;
        document = window.document;
        var updateGraph = require('../JS/pump/graph');
    });
  });

  it('does something', ()=> {
    chart = Chart.instances[0];
    chartData = chart.data.datasets[0].data;
    expect(chartData).to.equal([]);
  })
});
