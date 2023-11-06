// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract HealthcareDApp {
    address payable public admin;

    struct PatientRecord {
        string name;
        uint age;
        string weight;
        string sex;
        string bloodgroup;
        string condition;
        string medication;
    }

    struct Bill{
        uint amount;
        uint time;
    }

    mapping(address => PatientRecord) public patientRecords;
    mapping(address => Bill) public bills;

    constructor() {
        admin = payable(msg.sender);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    modifier checkPatient(address patientAddr){
        require(bytes(patientRecords[patientAddr].name).length > 0, "Patient record not found");
        _;
    }
    function addPatientRecord(
        address patientAddr, 
        string memory _name, 
        uint _age, 
        string memory _weight, 
        string memory _sex, 
        string memory _bloodgroup, 
        string memory _condition,
        string memory _medication
    ) public onlyAdmin {
        
        require(bytes(patientRecords[patientAddr].name).length == 0, "Patient record already exists");

         patientRecords[patientAddr]  = PatientRecord({
            name: _name,
            age: _age,
            weight: _weight,
            sex: _sex,
            bloodgroup: _bloodgroup,
            condition: _condition,
            medication: _medication
        });
    }
    function updatePatientRecord(
        address patientAddr, 
        string memory _name, 
        uint _age, 
        string memory _weight, 
        string memory _sex, 
        string memory _bloodgroup, 
        string memory _condition, 
        string memory _medication
    ) public onlyAdmin checkPatient(patientAddr){
        

        patientRecords[patientAddr] = PatientRecord({
            name: _name,
            age: _age,
            weight: _weight,
            sex: _sex,
            bloodgroup: _bloodgroup,
            condition: _condition,
            medication: _medication
        });
    }

    function createBill(address patientAddr, uint _amount) public onlyAdmin checkPatient(patientAddr) {
        bills[patientAddr].amount += _amount;
        bills[patientAddr].time = block.timestamp;
    }

    function payBill() public payable {
        uint amount = bills[msg.sender].amount;
        require(amount > 0, "No bill to pay");
        require(msg.value >= amount, "Insufficient funds");
        require(msg.value == amount,"Higher than bill");
        admin.transfer(msg.value);
        delete bills[msg.sender];
    }

    function delRec(address patientAddr) public onlyAdmin checkPatient(patientAddr){
        require(bills[patientAddr].amount ==0,"Patient has pending dues");
        delete patientRecords[patientAddr];
    }

    function editBill(address patientAddr , uint _amount) public onlyAdmin checkPatient(patientAddr){
        require(bills[patientAddr].amount != _amount,"Existing bill amount is same");
        bills[patientAddr].amount = _amount;
        bills[patientAddr].time = block.timestamp;
         
    }

    function changeAdmin(address _addr) public onlyAdmin{
        admin = payable(_addr);
    }

    function ethToUsd() public view returns(uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
       (,int256 answer,,,) = priceFeed.latestRoundData();
        uint ethInUsd7 =  uint256(answer); //gives eth in 10^7 * usd
        return ethInUsd7 ;
    }
}