// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import './Interfaces/IHeritage.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

///@title Inheritance
///@author Egor A. Goncharov
///@notice Allows you to transfer ERC-20 tokens to inheritance
contract TheWill is IHeritage {

    ///@notice stores all (wills) inheritances data
    InheritanceData[] public inheritanceData;
    
    ///@notice the IDs of wills (inheritance) made by a person
    ///@return uint256
    mapping(address => uint256[]) public inheritancesOwner;

    ///@notice the IDs of wills intended for a person
    ///@return uint256
    mapping(address => uint256[]) public inheritancesHeir;

    ///@notice creates the will (heritage)
    ///@param heir address to whom the tokens are intended
    ///@param token address of token to send
    ///@param timeWhenWithdraw the time when the heir can take the tokens
    ///@param amount amount of tokens to send
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
        uint256 allowance = _token.allowance(msg.sender, address(this));
        require(allowance >= amount, 'Not enough allowance');
        uint256 _dataLength = inheritanceData.length;
        //create new data
        InheritanceData memory _data = InheritanceData(
            _dataLength, //ID
            msg.sender, //owner
            heir,
            token,
            timeWhenWithdraw,
            timeWhenWithdraw - block.timestamp,//timeBetweenWithdrawAndStart
            amount,
            false       //done
        );
        inheritancesOwner[msg.sender].push(_dataLength);
        inheritancesHeir[heir].push(_dataLength);
        //add to storage
        inheritanceData.push(_data);
        emit AddAnHeir(_dataLength, msg.sender, heir, token, timeWhenWithdraw, amount);
    }

    ///@notice reset timers to all person wills
    ///@custom:example if we said that the withdrawal time will be 25.02.2050,
    ///@custom:example and the time when we created the heritage is 25.02.2040 
    ///@custom:example the time between will be 10 years
    ///@custom:example but if in 25.02.2041 we will reset timers
    ///@custom:example withdrawal time will be 25.02.2051
    ///@custom:example still 10 years
    ///@dev in the loop of senders will new time when withraw will be will.timeBetweenWithdrawAndStart + block.timestamp
    function resetTimers() public {
        uint256[] memory _newTimes = new uint256[](inheritancesOwner[msg.sender].length);
        for (uint256 i; i < inheritancesOwner[msg.sender].length; i++) {
            InheritanceData memory _data = inheritanceData[i];
            uint256 _newTimeWhenWithdraw = _data.timeBetweenWithdrawAndStart + block.timestamp;
            _data.timeWhenWithdraw = _newTimeWhenWithdraw;
            _newTimes[i] = _newTimeWhenWithdraw;
            inheritanceData[i] = _data;
        }
        emit ResetTimers(inheritancesOwner[msg.sender], msg.sender, _newTimes);
    }

    ///@notice reset timers to only one person will
    ///@param ID of the will that needs to reset timers
    function resetTimersAtOne(uint256 ID) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        uint256 _newTimeWhenWithdraw = _data.timeBetweenWithdrawAndStart + block.timestamp;
        _data.timeWhenWithdraw = _newTimeWhenWithdraw;
        inheritanceData[ID] = _data;
        uint256[] memory _newTimes = new uint256[](1);
        _newTimes[0] = _newTimeWhenWithdraw;
        uint256[] memory _IDs = new uint256[](1);
        _IDs[0] = ID;
        emit ResetTimers(_IDs, msg.sender, _newTimes);
    }

    ///@notice update time when heir can withdraw
    ///@param ID of the will that needs to update time when withdraw
    ///@param newTime new time when withdraw
    ///@dev we are also updating the time between the withdrawal of funds and the start, because the new withdrawal time will be increased
    function updateWillTimeWhenWithdraw(uint256 ID, uint256 newTime) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(newTime > block.timestamp, "Heritage: Time when withdraw is lower then now");
        require(_data.done == false, "Heritage: Already withdrawn");
        //get time when created
        uint256 _timeWhenCreated = _data.timeWhenWithdraw - _data.timeBetweenWithdrawAndStart;
        _data.timeWhenWithdraw = newTime;
        //set new time when created
        _data.timeBetweenWithdrawAndStart = newTime - _timeWhenCreated;
        inheritanceData[ID] = _data;
        emit UpdateWillTimeWhenWithdraw(ID, msg.sender, _data.heir, newTime);
    }

    ///@notice set new heir to the will
    ///@param ID id of the will to update
    ///@param _heir new heir of the will
    function updateAnHeir(uint256 ID, address _heir) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(_data.heir != _heir, "Heritage: Same heir");
        require(_data.heir != address(0), "Heritage: Heir is address(0)");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        uint256[] memory _inheritancesHeir = inheritancesHeir[_data.heir];
        for (uint256 i; i < _inheritancesHeir.length; i++) {
            if (_inheritancesHeir[i] == ID) {
                inheritancesHeir[_data.heir][i] = _inheritancesHeir[_inheritancesHeir.length-1];
                inheritancesHeir[_data.heir].pop();
            }
        }
        inheritancesHeir[_heir].push(ID);
        _data.heir = _heir;
        inheritanceData[ID] = _data;
        emit UpdateAnHeir(ID, msg.sender, _heir);
    }

    ///@notice set new amount to the will
    ///@param ID id of the will to update
    ///@param amount new amount of the will
    function updateAmount(uint256 ID, uint256 amount) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        require(amount != 0, "Heritage: Amount 0");
        require(amount != _data.amount, "Heritage: Amount is the same");
        IERC20 _token = IERC20(_data.token);
        if (amount > _data.amount) {
            uint256 allowance = _token.allowance(msg.sender, address(this));
            require(allowance >= amount, 'Not enough allowance');
        }
        _data.amount = amount;
        inheritanceData[ID] = _data;
        emit UpdateAmount(ID, _data.owner, amount);
    }

    ///@notice update time when withdraw, heir, amount - calls when boolean variables >= 2
    ///@param ID id of the will to update
    ///@param newTime new time when withdraw
    ///@param _heir new heir of the will
    ///@param amount new amount of the will
    ///@param _updateTime to see if we need to update time
    ///@param _updateHeir to see if we need to update heir
    ///@param _updateAmount to see if we need to update amount
    function update(
        uint256 ID, 
        uint256 newTime, 
        address _heir, 
        uint256 amount,
        bool _updateTime,
        bool _updateHeir,
        bool _updateAmount
    ) public {
        if (_updateTime == true) {
            updateWillTimeWhenWithdraw(ID, newTime);
        }
        if (_updateHeir == true) {
            updateAnHeir(ID, _heir);
        }
        if (_updateAmount == true) {
            updateAmount(ID, amount);
        }
    }

    ///@notice remove will from storage
    ///@param ID id of the will to remove
    ///@dev we're also updating inheritancesOwner and inheritancesHeir and transfering token to owner
    function removeWill(uint256 ID) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(_data.owner == msg.sender, "Heritage: You not owner");
        require(block.timestamp <= _data.timeWhenWithdraw, "Heritage: Time is over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        uint256[] memory _inheritancesOwner = inheritancesOwner[msg.sender];
        uint256[] memory _inheritancesHeir = inheritancesHeir[_data.heir];
        for (uint256 i; i < _inheritancesOwner.length; i++) {
            if (_inheritancesOwner[i] == ID) {
                inheritancesOwner[msg.sender][i] = _inheritancesOwner[_inheritancesOwner.length-1];
                inheritancesOwner[msg.sender].pop();
            }
        }
        for (uint256 i; i < _inheritancesHeir.length; i++) {
            if (_inheritancesHeir[i] == ID) {
                inheritancesHeir[_data.heir][i] = _inheritancesHeir[_inheritancesHeir.length-1];
                inheritancesHeir[_data.heir].pop();
            }
        }
        delete inheritanceData[ID];
        emit RemoveWill(ID, msg.sender, _data.heir);
    }

    ///@notice function for heir to withdraw tokens
    ///@param ID id of the will to withdraw
    ///@dev we're also updating inheritancesOwner and inheritancesHeir
    function withdraw(uint256 ID) public {
        InheritanceData memory _data = inheritanceData[ID];
        require(msg.sender == _data.heir, "Heritage: You not heir");
        require(block.timestamp >= _data.timeWhenWithdraw, "Heritage: Time is not over yet");
        require(_data.done == false, "Heritage: Already withdrawn");
        _data.done = true;
        uint256[] memory _inheritancesOwner = inheritancesOwner[msg.sender];
        uint256[] memory _inheritancesHeir = inheritancesHeir[_data.heir];
        for (uint256 i; i < _inheritancesOwner.length; i++) {
            if (_inheritancesOwner[i] == ID) {
                inheritancesOwner[msg.sender][i] = _inheritancesOwner[_inheritancesOwner.length-1];
                inheritancesOwner[msg.sender].pop();
            }
        }
        for (uint256 i; i < _inheritancesHeir.length; i++) {
            if (_inheritancesHeir[i] == ID) {
                inheritancesHeir[_data.heir][i] = _inheritancesHeir[_inheritancesHeir.length-1];
                inheritancesHeir[_data.heir].pop();
            }
        }
        IERC20 _token = IERC20(_data.token);
        uint256 allowance = _token.allowance(_data.owner, address(this));
        uint256 balance = _token.balanceOf(_data.owner);
        uint256 amount;
        if (balance < allowance) {
            _token.transferFrom(_data.owner, _data.heir, balance);
            amount = balance;
        } else if (allowance < _data.amount) {
            _token.transferFrom(_data.owner, _data.heir, allowance);
            amount = allowance;
        } else {
            _token.transferFrom(_data.owner, _data.heir, _data.amount);
            amount = _data.amount;
        }
        emit Withdraw(ID, _data.owner, msg.sender, block.timestamp, amount);
        inheritanceData[ID] = _data;
    }

    ///@notice returns all user's wills
    ///@param owner owner of the wills
    ///@return InheritanceData[]
    function getAllWills(address owner) public view returns(InheritanceData[] memory) {
        uint256[] memory _inheritancesOwner = inheritancesOwner[owner];
        InheritanceData[] memory _data = new InheritanceData[](_inheritancesOwner.length);
        for (uint256 i; i < _inheritancesOwner.length; i++) {
            _data[i] = inheritanceData[_inheritancesOwner[i]];
        }
        return _data;
    }

    ///@notice returns all user's inheritances
    ///@param heir heir of the inheritances
    ///@return InheritanceData[]
    function getAllInheritances(address heir) public view returns(InheritanceData[] memory) {
        uint256[] memory _inheritancesHeir = inheritancesHeir[heir];
        InheritanceData[] memory _data = new InheritanceData[](_inheritancesHeir.length);
        for (uint256 i; i < _inheritancesHeir.length; i++) {
            _data[i] = inheritanceData[_inheritancesHeir[i]];
        }
        return _data;
    }

}
