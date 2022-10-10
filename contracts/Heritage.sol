// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import './Interfaces/IHeritage.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Heritage is IHeritage {

    InheritanceData[] public inheritanceData;
    
    mapping(address => uint64) public inheritancesAmountOwner;
    mapping(address => uint64) public inheritancesAmountHeir;

    function addAnHeir(
        address heir, 
        address token,
        uint256 timeWhenWithdraw, 
        uint256 amount
    ) public {
        require(heir != address(0), "Heritage: Heir is address(0)");
        require(token != address(0), "Heritage: Token is address(0)");
        require(timeWhenWithdraw > block.timestamp, "Heritage: Time when withdraw is lower then now");
        require(amount != 0, "Heritage: Amount 0");
        IERC20 _token = IERC20(token);
        _token.transferFrom(msg.sender, address(this), amount);
        InheritanceData memory _data = InheritanceData(
            msg.sender, //owner
            heir,
            token,
            timeWhenWithdraw,
            amount,
            false       //done
        );
        inheritanceData.push(_data);
        inheritancesAmountOwner[msg.sender] += 1;
        inheritancesAmountHeir[heir] += 1;
        emit AddAnHeir(inheritanceData.length - 1, heir, token, timeWhenWithdraw, amount);
    }

    function updateAnHeirTimeWhenWithdraw(uint256 ID, uint256 newTime) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        _data.timeWhenWithdraw = newTime;
        inheritanceData[ID] = _data;
    }

    function updateAnHeir(uint256 ID, address _heir) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(_data.heir != _heir, "Heritage: Same heir");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        _data.heir = _heir;
        inheritanceData[ID] = _data;
    }

    function removeAnHeir(uint256 ID) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        IERC20 _token = IERC20(_data.token);
        _token.transfer(msg.sender, _data.amount);
        _data.owner = address(0);
        _data.amount = 0;
        _data.token = address(0);
        _data.heir = address(0);
        _data.timeWhenWithdraw = 0;
        _data.done = false;
        inheritanceData[ID] = _data;
    }

    function withdraw(uint256 ID) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(msg.sender == _data.heir, "Heritage: You not heir");
        require(block.timestamp >= _data.timeWhenWithdraw, "Heritage: Time is not over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        _data.done = true;
        IERC20 _token = IERC20(_data.token);
        _token.transfer(msg.sender, _data.amount);
        inheritanceData[ID] = _data;
        emit Withdraw(ID, block.timestamp);
    }

}
