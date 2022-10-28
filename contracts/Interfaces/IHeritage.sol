// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

/// @title Interface for Inheritance
/// @author Egor A. Goncharov
interface IHeritage {

    struct InheritanceData {
        uint256 ID;
        address owner;
        address heir;
        address token; 
        uint256 timeWhenWithdraw;
        //if we said that the withdrawal time will be 25.02.2050, 
        //when the time when we created the heritage is 25.02.2040 
        //the time between will be 10 years
        uint256 timeBetweenWithdrawAndStart;
        uint256 amount;
        bool done;
    }
    
    event AddAnHeir(
        uint256 ID,
        address owner,
        address heir,
        address token,
        uint256 timeWhenWithdraw, 
        uint256 amount
    );

    event UpdateWillTimeWhenWithdraw(
        uint256 ID,
        address owner,
        address heir,
        uint256 newTime
    );

    event UpdateAnHeir(
        uint256 ID,
        address owner,
        address newHeir
    );

    event UpdateAmount(
        uint256 ID,
        address owner,
        uint256 newAmount
    );

    event RemoveWill(
        uint256 ID,
        address owner,
        address heir
    );

    event Withdraw(
        uint256 ID, 
        address owner, 
        address heir, 
        uint256 timeWhenWithdrawn
    );

    event ResetTimers(
        uint256[] IDs,
        address owner,
        uint256[] newTimes
    );

}