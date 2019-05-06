import {
    Client,
    LocalAddress,
    CryptoUtils,
    LoomProvider
} from 'loom-js'

import NoteContract from '../build/contracts/NoteContract.json'

export default class Contract {
    init() {
        this.createClient();
        this.createCurrentUserAddress();
        this.initWeb3();
        this.initContract();
    }

    initWeb3() {
        this.web3 = new Web3(new LoomProvider(this.client, this.privateKey))
    }

    createClient() {
        this.privateKey = CryptoUtils.generatePrivateKey()
        this.publicKey = CryptoUtils.publicKeyFromPrivateKey(this.privateKey)
        let writeUrl = 'ws://127.0.0.1:46658/websocket'
        let readUrl = 'ws://127.0.0.1:46658/queryws'
        let networkId = 'default'

        this.client = new Client(networkId, writeUrl, readUrl)

        this.client.on('error', msg => {
            console.error('Error on connect to client', msg)
            console.warn('Please verify if loom command is running')
        })
    }

    createCurrentUserAddress() {
        this.account =  LocalAddress.fromPublicKey(this.publicKey).toString();  // "0x8B7A68cfF3725Ca1b682fE575BC891E381138eF8";
    }

    async initContract() {
        const networkId = "13654820909954";

        console.log("networkId:" + networkId );
        console.log(NoteContract)

        this.currentNetwork = NoteContract.networks[networkId]
        if (!this.currentNetwork) {
            throw Error('Contract not deployed on DAppChain')
        }
        const ABI = NoteContract.abi;

        var MyContract = this.web3.eth.contract(ABI);

        this.noteIntance = MyContract.at(this.currentNetwork.address);

        //  Loom Provider not support yet .
        this.event = this.noteIntance.NewNote()
        this.event.watch(function(err, result) {
            console.log(" watch event: " + err);
        });

        this.bindEvents();
        this.getNotes();
    }

    getNotes() {
        var that = this;

        $("#notes").empty();
        this.noteIntance.getNotesLen(this.account, function(err, len) {
            $("#loader").hide();
            console.log(len + " 条笔记");
            if (len > 0) {
                that.loadNote(len - 1);
            }
        });
    }

    adjustHeight() {
        console.log("reset height"); 
        $('textarea').each(function() {
            console.log("reset height");   
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;'); 
        }).on('input', function() { 
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px'; 
        })
    }

    loadNote(index) {
        var that = this;

        this.noteIntance.notes(this.account, index, function(err, note) {
            $("#notes").append(
                '<div class="form-horizontal"> <div class="form-group"><div class="col-sm-8 col-sm-push-1 ">' +
                ' <textarea class="form-control" id="note' +
                +index +
                '" >' +
                note +
                '</textarea></div>' +
                '</div> </div>');
            if (index - 1 >= 0) {
                that.loadNote(index - 1);
            } else {
                that.adjustHeight();
            }
        });
    }

    bindEvents() {
        var that = this;
        $("#add_new").on('click', function() {
             console.log(" click add new ");

            $("#loader").show();
            that.noteIntance.addNote($("#new_note").val(), { from: that.account } , function(err, result) {
                console.log( " addNote: callback:" + err);
                console.log("result hash:" + result);
                that.getNotes()
            });


        } );

        $("#notes").on('click', "button", async function() {
            var cindex = $(this).attr("index");
            var noteid = "#note" + cindex
            var note = $(noteid).val();
            console.log(note);

            await this.noteIntance.modifyNote(this.account, cindex, note, function(err, result) {
                     return this.getNotes();
                 }
            );
        });
    }

    getAccountParam() {
        var reg = new RegExp("(^|&)account=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

}

$(function() {
    $(window).load(async function() {
        var app = new Contract();
        await app.init();
    });
});