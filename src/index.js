import {
    Client,
    LocalAddress,
    CryptoUtils,
    LoomProvider
} from 'loom-js'

import Web3 from 'web3'
import NoteContract from '../build/contracts/NoteContract.json'

export default class App {
    async init() {
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
        this.account = LocalAddress.fromPublicKey(this.publicKey).toString();
    }


    initContract() {

        const networkId = "13654820909954";

        this.currentNetwork = NoteContract.networks[networkId]
        if (!this.currentNetwork) {
            throw Error('Contract not deployed on DAppChain')
        }
        const ABI = NoteContract.abi;

        this.noteIntance = new this.web3.eth.Contract(ABI, this.currentNetwork.address, {
            from: this.account
        })

        console.log(this.noteIntance)

        // this.noteIntance.events.NewNote(function(err, result) {
        //     console.log("reload");
        //     window.location.reload();
        // });

        this.bindEvents();
        this.getNotes();
    }

    getNotes() {
        this.noteIntance.methods.getNotesLen(this.account).call({ from: this.currentUserAddress }).then(function(len) {
            $("#loader").hide();
            console.log(len + " 条笔记");
            this.noteLength = len;
            if (len > 0) {
                this.loadNote(len - 1);
            }
        }).catch(function(err) {
            console.log(err.message);
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

        this.noteIntance.methods.notes(this.account, index).call().then(function(note) {
            $("#notes").append(
                '<div class="form-horizontal"> <div class="form-group"><div class="col-sm-8 col-sm-push-1 ">' +
                ' <textarea class="form-control" id="note' +
                +index +
                '" >' +
                note +
                '</textarea></div>' +
                '</div> </div>');
            if (index - 1 >= 0) {
                this.loadNote(index - 1);
            } else {
                this.adjustHeight();
            }
        }).catch(function(err) {
            console.log(err.message);
        });

    }

    bindEvents() {
        $("#add_new").on('click', function() {
            console.log(" click ");
            $("#loader").show();

            this.noteIntance.methods.addNote($("#new_note").val()).send({ from: this.currentUserAddress }).then(function() {
                this.watchChange();
            });
        });

        $("#notes").on('click', "button", function() {
            var cindex = $(this).attr("index");
            var noteid = "#note" + cindex
            var note = $(noteid).val();
            console.log(note);

            this.noteIntance.methods.modifyNote(this.account, cindex, note).send().then(
                function(result) {
                    return this.getNotes();
                }
            );
        });
    }

    watchChange() {
        var infoEvent = this.noteIntance.NewNote();
        return infoEvent.watch(function(err, result) {
            console.log("reload");
            window.location.reload();
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
    $(window).load(function() {

        var app = new App();
        app.init();
    });
});