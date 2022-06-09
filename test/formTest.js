var assert = require('assert');
var myFunc = require('../JS/pump/form.js');

it('should return the correct saved data.', function () {
    $('#language').val('EN'); 
    saveForm();
    var language = localStorage.getItem('language');
    assert.equal(language, 'EN');
});