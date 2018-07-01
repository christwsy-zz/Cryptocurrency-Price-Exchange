$(function () {
  "use strict";

  var srcFullname = $('#src-currency-fullname');
  var tgtFullname = $('#tgt-currency-fullname');
  var srcCurrencySelector = $('#src-currency-selector');
  var srcAmount = $('#src-amount');
  var tgtCurrencySelector = $('#tgt-currency-selector');
  var tgtAmount = $('#tgt-amount');
  var rate = 1.0;

  window.WebSocket = window.WebSocket || window.MozWebSocket;

  if (!window.WebSocket) {
    alert('Your browser doesn\'t support WebSocket.');
    return;
  }

  var connection = new WebSocket('ws://localhost:7310');

  connection.onopen = function () {

  };

  connection.onerror = function (error) {

  };

  connection.onmessage = function (message) {
    try {
      var json = JSON.parse(message.data);
    } catch (e) {
      console.log('Invalid json: ', message.data);
      return;
    }
    console.log("received rate");
    rate = json.rate;
  };

  srcCurrencySelector.change(requestRate);
  tgtCurrencySelector.change(requestRate);
  srcAmount.keyup(convertSrc);  
  tgtAmount.keyup(convertTgt);  

  function requestRate() {
    var json = { 'src': srcCurrencySelector.val(), 
                 'tgt': tgtCurrencySelector.val() };
    connection.send(JSON.stringify(json));
  };

  function convertSrc() {
    var srcAmountOld = parseFloat(srcAmount.val());
    tgtAmount.val((srcAmountOld * rate).toFixed(3).toString());
  }

  function convertTgt() {
    var tgtAmountOld = parseFloat(tgtAmount.val());
    srcAmount.val((tgtAmountOld / rate).toFixed(3).toString());
  }
});