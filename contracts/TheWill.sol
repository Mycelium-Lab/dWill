// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import './Interfaces/IHeritage.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract TheWill is IHeritage {

    InheritanceData[] public inheritanceData;
    
    mapping(address => uint64) public inheritancesAmountOwner;
    mapping(address => uint64) public inheritancesAmountHeir;

    function addNewWill(
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
            inheritanceData.length, //ID
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
        emit AddAnHeir(inheritanceData.length - 1, msg.sender, heir, token, timeWhenWithdraw, amount);
    }

    function updateWillTimeWhenWithdraw(uint256 ID, uint256 newTime) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(newTime > block.timestamp, "Heritage: Time when withdraw is lower then now");
        require(_data.done == false, "Heritage: Already withdrawn");
        _data.timeWhenWithdraw = newTime;
        inheritanceData[ID] = _data;
        emit UpdateWillTimeWhenWithdraw(ID, msg.sender, _data.heir, newTime);
    }

    function updateAnHeir(uint256 ID, address _heir) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(_data.heir != _heir, "Heritage: Same heir");
        require(_data.heir != address(0), "Heritage: Heir is address(0)");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        inheritancesAmountHeir[_data.heir] -= 1;
        _data.heir = _heir;
        inheritancesAmountHeir[_heir] += 1;
        inheritanceData[ID] = _data;
        emit UpdateAnHeir(ID, msg.sender, _heir);
    }

    function removeWill(uint256 ID) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        IERC20 _token = IERC20(_data.token);
        _token.transfer(msg.sender, _data.amount);
        inheritancesAmountOwner[_data.owner] -= 1;
        inheritancesAmountHeir[_data.heir] -= 1;
        emit RemoveWill(ID, msg.sender, _data.heir);
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
        inheritancesAmountOwner[_data.owner] -= 1;
        inheritancesAmountHeir[_data.heir] -= 1;
        IERC20 _token = IERC20(_data.token);
        _token.transfer(msg.sender, _data.amount);
        emit Withdraw(ID, _data.owner, msg.sender, block.timestamp);
        inheritanceData[ID] = _data;
    }

    function getAllWills(address owner) public view returns(InheritanceData[] memory) {
        InheritanceData[] memory _data = new InheritanceData[](inheritancesAmountOwner[owner]);
        if (inheritancesAmountOwner[owner] == 0) {
            return _data;
        }
        uint64 counter;
        for (uint256 i; i < inheritanceData.length; i++) {
            if (inheritanceData[i].owner == owner) {
                _data[counter] = inheritanceData[i];
                counter += 1;
            }
        }
        return _data;
    }

    function getAllInheritances(address heir) public view returns(InheritanceData[] memory) {
        InheritanceData[] memory _data = new InheritanceData[](inheritancesAmountHeir[heir]);
        if (inheritancesAmountHeir[heir] == 0) {
            return _data;
        }
        uint64 counter;
        for (uint256 i; i < inheritanceData.length; i++) {
            if (inheritanceData[i].heir == heir) {
                _data[counter] = inheritanceData[i];
                counter += 1;
            }
        }
        return _data;
    }

}
