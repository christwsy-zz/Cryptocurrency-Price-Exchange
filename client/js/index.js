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
    var json = {
      'type': 'currencylist',
    };
    connection.send(JSON.stringify(json));
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
    switch (json.type) {
      case 'rate':
        console.log("received rate");
        rate = json.data.rate;
        srcFullname.html("1 " + json.data.srcPrice[0] + " equals");
        tgtFullname.html(rate.toFixed(3) + " " +  json.data.tgtPrice[0]);
        convertSrc();
        break;
      case 'currencylist':
        var selections = json.data;
        selections.forEach(element => {
          srcCurrencySelector.append($("<option />").val(element).text(element));
          tgtCurrencySelector.append($("<option />").val(element).text(element));
        });
        break;
      default:
        break;
    }
  };

  srcCurrencySelector.change(requestRate);
  tgtCurrencySelector.change(requestRate);
  srcAmount.keyup(convertSrc);  
  tgtAmount.keyup(convertTgt);  

  function requestRate() {
    var json = {
      'type': 'rate',
      'src': srcCurrencySelector.val(),
      'tgt': tgtCurrencySelector.val()
    };
    connection.send(JSON.stringify(json));
  };

  function convertSrc() {
    var srcAmountOld = parseFloat(srcAmount.val());
    if (!checkInput(srcAmountOld)) return;
    tgtAmount.val((srcAmountOld * rate).toFixed(3).toString());
  }

  function convertTgt() {
    var tgtAmountOld = parseFloat(tgtAmount.val());
    if (!checkInput(tgtAmountOld)) return;
    srcAmount.val((tgtAmountOld / rate).toFixed(3).toString());
  }

  function checkInput(val) {
    if (val >= 0) return true;
    else {
      tgtAmount.val(0);
      srcAmount.val(0);
      return false;
    }
  }
});