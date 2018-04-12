App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load employees.
    $.getJSON('../employees.json', function(data) {
      var employeesRow = $('#employeesRow');
      var employeeTemplate = $('#employeeTemplate');

      for (i = 0; i < data.length; i ++) {
        employeeTemplate.find('.panel-title').text(data[i].name);
        employeeTemplate.find('img').attr('src', data[i].picture);
        employeeTemplate.find('.empid').text(data[i].empid);
        employeeTemplate.find('.breakviolation').text(data[i].breakviolation).attr('data-id', data[i].id);
        employeeTemplate.find('.ethaddress').text(data[i].ethaddress);
        employeeTemplate.find('.btn-addemployee').attr('data-id', data[i].empid);
        employeeTemplate.find('.btn-punchIN').attr('data-id', data[i].id);
        employeeTemplate.find('.btn-punchOUT').attr('data-id', data[i].id);
        employeesRow.append(employeeTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
    App.web3Provider = web3.currentProvider;
     } else {
  // If no injected web3 instance is detected, fall back to Ganache
     App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
     web3 = new Web3(App.web3Provider);

     return App.initContract();
  },

  initContract: function() {
    $.getJSON('TimeTrack.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var TimeTrackArtifact = data;
    App.contracts.TimeTrack = TruffleContract(TimeTrackArtifact);

    // Set the provider for our contract
    App.contracts.TimeTrack.setProvider(App.web3Provider);

    // Use our contract to retrieve and mark
    //return App.markAdded();
  });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-addemployee', App.handleAddEmployee);
    $(document).on('click', '.btn-punchIN',App.handlePunchIN);
    $(document).on('click', '.btn-punchOUT',App.handlePunchOUT);
  },

  markAdded: function(employees, account) {
    var timeTrackInstance;

  App.contracts.TimeTrack.deployed().then(function(instance) {
  timeTrackInstance = instance;

  return timeTrackInstance.getEmployees.call();
}).then(function(employees) {
  for (i = 1; i < employees.length; i++) {
    if (employees[i] !== '0x0000000000000000000000000000000000000000') {
      $('.panel-employee').eq(i-1).find('.btn-addemployee').text('Active \n EthAddress = ' + employees[i]).attr('disabled', true);
    }
  }
}).catch(function(err) {
  console.log(err.message);
});
  },

  displayPunchNow: function(value, id) {
    var timeTrackInstance;

  App.contracts.TimeTrack.deployed().then(function(instance) {
  timeTrackInstance = instance;

  return timeTrackInstance.displayNow.call();
}).then(function(result) {
  if (value == "IN") {
   console.log("CurrentTimeIN: " + result);
   $('.panel-employee').eq(id).find('.btn-punchIN').text('PunchIN : Last Time = ' + result);
 } else {
   console.log("CurrentTimeOUT: " + result);
   $('.panel-employee').eq(id).find('.btn-punchOUT').text('PunchOUT : Last Time = ' + result);
 }
}).catch(function(err) {
  console.log(err.message);
});
  },

  updateBreakViolation: function(id) {
    var timeTrackInstance;

  App.contracts.TimeTrack.deployed().then(function(instance) {
  timeTrackInstance = instance;

  return timeTrackInstance.displayViolation.call();
}).then(function(result) {
   console.log("BreakVio:  " + result);
   $('.panel-employee').eq(id).find('.breakviolation').text(result);
}).catch(function(err) {
  console.log(err.message);
});
  },


  handlePunchIN: function() {
    event.preventDefault();
    var id = parseInt($(event.target).data('id'));
    var timeTrackInstance;
    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];
    App.contracts.TimeTrack.deployed().then(function(instance) {
    timeTrackInstance = instance;

    return timeTrackInstance.doPunchIN({from: account});
  }).then(function(result) {
    console.log("Panel Id In:" + id);
    App.displayPunchNow("IN", id);
    //$('.panel-employee').eq(i).find('button-punchIN').text('PunchIN Time = ' + result);

    }).catch(function(err) {
     console.log(err.message);
     });
     });
},
handlePunchOUT: function() {
  event.preventDefault();
  var id = parseInt($(event.target).data('id'));
  var timeTrackInstance;
  web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }

  var account = accounts[0];

  App.contracts.TimeTrack.deployed().then(function(instance) {
  timeTrackInstance = instance;

  return timeTrackInstance.doPunchOUT({from: account});
}).then(function(result) {
    console.log("Panel Id Out:" + id);
    App.displayPunchNow("OUT", id);
    App.updateBreakViolation(id);
  }).catch(function(err) {
   console.log(err.message);
   });
 });
},



  handleAddEmployee: function(event) {
    event.preventDefault();

    // var empid = parseInt($(event.target).data('empid'));
    // var name = $(event.target).data('name');
    // var ethaddress = parseInt($(event.target).data('ethaddress'), 16);

    var timeTrackInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    App.contracts.TimeTrack.deployed().then(function(instance) {
    timeTrackInstance = instance;

    // Execute adopt as a transaction by sending account
    return timeTrackInstance.addEmployee({from: account});
  }).then(function(result) {
    return App.markAdded();
  }).catch(function(err) {
    console.log(err.message);
  });
});
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
