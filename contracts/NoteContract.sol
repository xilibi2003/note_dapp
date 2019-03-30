pragma solidity ^0.5.0;

contract NoteContract {
    
    mapping(address => string [] ) public notes;

    constructor() public {

    }

    event NewNote(address, string note);
    event ModifyNote(address, uint index);

    function addNote( string memory note) public {
    
        notes[msg.sender].push(note);
        emit NewNote(msg.sender, note);
    }

    function getNotesLen(address own) public view returns (uint) {
        return notes[own].length;
    }
    
    function modifyNote(address own, uint index, string memory note) public {
        notes[own][index] = note;
        emit ModifyNote(own, index);
    }

}
