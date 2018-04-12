pragma solidity ^0.4.18;
contract TimeTrack {

    // Address to represent owner
    address public employer;
    address[] public employeeAddresses;
    uint public employeeIdCount;
    uint currentBlockTime;
    uint breakViolationCount;


    // Datastructure to represent each employee
    struct Employee {
        uint employeeID;
        address employeeAddress;
        bool isActive;
        Card card;
    }

    struct Card {
        bool punchAlert; //true => IN, false => OUT
        uint punchIn;
        uint punchOut;
        uint breakViolationCount;
    }

    //Stores employee struct for each possible address
    mapping(address => Employee) public employees;


    function TimeTrack() public {
        employer = msg.sender;
        employeeIdCount = 0;
        addEmployee();
    }

    //Make employee inactive in the system
    function removeAuthorization(address addr) public {
        require(msg.sender == employer);
        employees[addr].isActive = false;
    }

    // add an employee given an address and name
    function addEmployee() public returns (bool _success)  {
        require(!employees[msg.sender].isActive);
        employees[msg.sender] = Employee(employeeIdCount, msg.sender, true, Card(false, 0, 0, 0));
        employeeIdCount++;
        employeeAddresses.push(msg.sender);
        return true;
    }

    function displayNow() public view returns (uint) {
     return currentBlockTime;
    }

    function displayViolation() public view returns (uint) {
      return breakViolationCount;
    }

    function breakViolationAlert() public pure returns (string) {
      return "Break Rules Violated!!!";
    }

    function doPunchIN() public returns (bool _success) {
        require(
            (employer != msg.sender) &&
            (employees[msg.sender].isActive) &&
            (!employees[msg.sender].card.punchAlert)
            );
        currentBlockTime = now;
        employees[msg.sender].card.punchIn = currentBlockTime;
        employees[msg.sender].card.punchAlert = true;
        return true;
    }

    function doPunchOUT() public returns (bool _success) {
               require(
            (employer != msg.sender) &&
            (employees[msg.sender].isActive) &&
            (employees[msg.sender].card.punchAlert)
            );
        currentBlockTime = now;
        employees[msg.sender].card.punchOut = currentBlockTime;
        employees[msg.sender].card.punchAlert = false;
        calculateBreakViolation();
        return true;
    }

    function calculateBreakViolation() private {
        uint punchOut = employees[msg.sender].card.punchOut;
        uint punchIn = employees[msg.sender].card.punchIn;
        require(punchOut > punchIn);
        uint diff = punchOut - punchIn;
        if (diff < 1800) {
            employees[msg.sender].card.breakViolationCount++;
        }
        breakViolationCount = employees[msg.sender].card.breakViolationCount;
    }

    function displayBreakViolation() public view returns(uint) {
        return employees[msg.sender].card.breakViolationCount;
    }

    function getEmployees() public view returns(address[])  {
        return employeeAddresses;
    }


}
