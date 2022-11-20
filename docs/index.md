# Solidity API

## IHeritage

### InheritanceData

```solidity
struct InheritanceData {
  uint256 ID;
  address owner;
  address heir;
  address token;
  uint256 timeWhenWithdraw;
  uint256 timeBetweenWithdrawAndStart;
  uint256 amount;
  bool done;
}
```

### AddAnHeir

```solidity
event AddAnHeir(uint256 ID, address owner, address heir, address token, uint256 timeWhenWithdraw, uint256 amount)
```

### UpdateWillTimeWhenWithdraw

```solidity
event UpdateWillTimeWhenWithdraw(uint256 ID, address owner, address heir, uint256 newTime)
```

### UpdateAnHeir

```solidity
event UpdateAnHeir(uint256 ID, address owner, address newHeir)
```

### UpdateAmount

```solidity
event UpdateAmount(uint256 ID, address owner, uint256 newAmount)
```

### RemoveWill

```solidity
event RemoveWill(uint256 ID, address owner, address heir)
```

### Withdraw

```solidity
event Withdraw(uint256 ID, address owner, address heir, uint256 timeWhenWithdrawn, uint256 amount)
```

### ResetTimers

```solidity
event ResetTimers(uint256[] IDs, address owner, uint256[] newTimes)
```

## TokenForTests

### constructor

```solidity
constructor(string name, string symbol) public
```

## dWill

Allows you to transfer ERC-20 tokens to inheritance

### inheritanceData

```solidity
struct IHeritage.InheritanceData[] inheritanceData
```

stores all (wills) inheritances data

### inheritancesOwner

```solidity
mapping(address => uint256[]) inheritancesOwner
```

the IDs of wills (inheritance) made by a person

### inheritancesHeir

```solidity
mapping(address => uint256[]) inheritancesHeir
```

the IDs of wills intended for a person

### addNewWill

```solidity
function addNewWill(address heir, address token, uint256 timeWhenWithdraw, uint256 amount) public
```

creates the will (heritage)

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| heir | address | address to whom the tokens are intended |
| token | address | address of token to send |
| timeWhenWithdraw | uint256 | the time when the heir can take the tokens |
| amount | uint256 | amount of tokens to send |

### resetTimers

```solidity
function resetTimers() public
```

reset timers to all person wills

_in the loop of senders will new time when withraw will be will.timeBetweenWithdrawAndStart + block.timestamp_

### resetTimersAtOne

```solidity
function resetTimersAtOne(uint256 ID) public
```

reset timers to only one person will

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | of the will that needs to reset timers |

### updateWillTimeWhenWithdraw

```solidity
function updateWillTimeWhenWithdraw(uint256 ID, uint256 newTime) public
```

update time when heir can withdraw

_we are also updating the time between the withdrawal of funds and the start, because the new withdrawal time will be increased_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | of the will that needs to update time when withdraw |
| newTime | uint256 | new time when withdraw |

### updateAnHeir

```solidity
function updateAnHeir(uint256 ID, address _heir) public
```

set new heir to the will

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | id of the will to update |
| _heir | address | new heir of the will |

### updateAmount

```solidity
function updateAmount(uint256 ID, uint256 amount) public
```

set new amount to the will

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | id of the will to update |
| amount | uint256 | new amount of the will |

### update

```solidity
function update(uint256 ID, uint256 newTime, address _heir, uint256 amount, bool _updateTime, bool _updateHeir, bool _updateAmount) public
```

update time when withdraw, heir, amount - calls when boolean variables >= 2

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | id of the will to update |
| newTime | uint256 | new time when withdraw |
| _heir | address | new heir of the will |
| amount | uint256 | new amount of the will |
| _updateTime | bool | to see if we need to update time |
| _updateHeir | bool | to see if we need to update heir |
| _updateAmount | bool | to see if we need to update amount |

### removeWill

```solidity
function removeWill(uint256 ID) public
```

remove will from storage

_we're also updating inheritancesOwner and inheritancesHeir and transfering token to owner_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | id of the will to remove |

### withdraw

```solidity
function withdraw(uint256 ID) public
```

function for heir to withdraw tokens

_we're also updating inheritancesOwner and inheritancesHeir_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | id of the will to withdraw |

### getAllWillsAmountThisToken

```solidity
function getAllWillsAmountThisToken(address owner, address token) public view returns (uint256)
```

returns all user's wills amount

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | owner of the wills |
| token | address |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 amount |

### getAllWills

```solidity
function getAllWills(address owner) public view returns (struct IHeritage.InheritanceData[])
```

returns all user's wills

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | owner of the wills |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IHeritage.InheritanceData[] | InheritanceData[] |

### getAllInheritances

```solidity
function getAllInheritances(address heir) public view returns (struct IHeritage.InheritanceData[])
```

returns all user's inheritances

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| heir | address | heir of the inheritances |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IHeritage.InheritanceData[] | InheritanceData[] |

