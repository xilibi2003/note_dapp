App = {
  web3Provider: null,
  contracts: {},
  account: null,
  noteIntance: null,
  noteLength : 0,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {

    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }

    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    }
    web3 = new Web3(App.web3Provider);

    var account = App.getAccountParam();

    if (null == account)  {
      console.log("initAccount");
      App.initAccount();
    } else {
      App.account = account;
      console.log("account:" + account);
    }

    return App.initContract();
  },

  initAccount: function() {
    web3.eth.getAccounts(function(error, accounts) {
      App.account = accounts[0];
    });
  },

  initContract: function() {
    $.getJSON('NoteContract.json', function(data) {
      App.contracts.noteContract = TruffleContract(data);
      App.contracts.noteContract.setProvider(App.web3Provider);

      App.contracts.noteContract.deployed().then(function(instance) {
        App.noteIntance = instance;
        return App.getNotes();
      });

    });

    return App.bindEvents();
  },

  getNotes: function() {
    App.noteIntance.getNotesLen(App.account).then(function(len) {
      $("#loader").hide();
      console.log(len + " 条笔记");
      App.noteLength = len;
      if (len > 0) {
        App.loadNote( len - 1);
      } 

    }).catch(function(err) {
      console.log(err.message);
    });
  },

  adjustHeight: function() {
    console.log("reset height");  
    $('textarea').each(function () {
      console.log("reset height");
           this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        })
  }, 

  loadNote: function(index) {

    App.noteIntance.notes(App.account, index).then(function(note) {
      $("#notes").append(
      '<div class="form-horizontal"> <div class="form-group"><div class="col-sm-8 col-sm-push-1 ">' + 
      ' <textarea class="form-control" id="note'+ 
      + index
      + '" >' 
      + note
      + '</textarea></div>'
      +  '</div> </div>');
      if (index -1 >= 0) {
        App.loadNote(index - 1);
      } else {
        App.adjustHeight();
      }
    } ).catch(function(err) {
      console.log(err.message);
    });

  },

  bindEvents: function() {
    $("#add_new").on('click', function() {
      console.log(" click ");
      $("#loader").show();

      App.noteIntance.addNote($("#new_note").val()).then(function(result) {
         return App.watchChange();
      }).catch(function (err) {
        console.log(err.message);
      });
    });

    $("#notes").on('click', "button", function() {
      var cindex = $(this).attr("index");
      var noteid = "#note" + cindex
      var note = $(noteid).val();
      console.log(note);

      
      App.noteIntance.modifyNote(App.account, cindex, note).then(
        function(result) {
          return App.getNotes();
        }
      ); 
    });
  }, 

  watchChange: function() {
      var infoEvent = App.noteIntance.NewNote();
      return infoEvent.watch(function (err, result) {
        console.log("reload");
        window.location.reload();
      });
  }, 

  getAccountParam: function() {
    var reg = new RegExp("(^|&)account=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
