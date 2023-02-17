# Solidity API

## IHeritage

### WillData

```solidity
struct WillData {
  uint256 ID;
  address owner;
  address heir;
  contract IERC20 token;
  uint256 creationTime;
  uint256 withdrawalTime;
  uint256 timeInterval;
  uint256 amount;
  uint256 fee;
  bool done;
}
```

### AddWill

```solidity
event AddWill(uint256 ID, address owner, address heir, contract IERC20 token, uint256 withdrawalTime, uint256 amount)
```

### UpdateWithdrawalTime

```solidity
event UpdateWithdrawalTime(uint256 ID, uint256 oldWithdrawalTime, uint256 newWithdrawalTime)
```

### UpdateHeir

```solidity
event UpdateHeir(uint256 ID, address oldHeir, address newHeir)
```

### UpdateAmount

```solidity
event UpdateAmount(uint256 ID, uint256 oldAmount, uint256 newAmount)
```

### RemoveWill

```solidity
event RemoveWill(uint256 ID, address owner, address heir)
```

### Withdraw

```solidity
event Withdraw(uint256 ID, address owner, address heir, contract IERC20 token, uint256 time, uint256 amount)
```

### CollectFee

```solidity
event CollectFee(uint256 ID, contract IERC20 token, uint256 amount)
```

### SetFeeCollector

```solidity
event SetFeeCollector(address oldFeeCollector, address newFeeCollector)
```

### SetFee

```solidity
event SetFee(uint256 oldFee, uint256 newFee)
```

## TokenForTests

### constructor

```solidity
constructor(string name, string symbol) public
```

## dWill

### willData

```solidity
struct IHeritage.WillData[] willData
```

Stores all will/inheritance data.
For clarity we use "will" to refer to wills created by owner and "inheritance" to refer to inheritance intended for heir,
however "will" and "inheritance" refer to the same data types.

### ownerWills

```solidity
mapping(address => uint256[]) ownerWills
```

The IDs of wills made by a person.

### indexOfOwnerWillsId

```solidity
mapping(uint256 => uint256) indexOfOwnerWillsId
```

Index where given ID is in ownerWills[owner] array. It is independent of owner because each will can have only one owner.

### willAmountForToken

```solidity
mapping(address => mapping(contract IERC20 => uint256)) willAmountForToken
```

Owner's token amounts in all their wills. Used to check if owner has enough allowance for new will/to increase will amount.

### heirInheritances

```solidity
mapping(address => uint256[]) heirInheritances
```

The IDs of inheritances intended for a person.

### indexOfHeirInheritanceId

```solidity
mapping(uint256 => uint256) indexOfHeirInheritanceId
```

Index where given ID is in heirInheritances[heir] array. It is independent of heir because each inheritance can have only one heir.

### feeCollector

```solidity
address feeCollector
```

Address the fees are sent to.

### fee

```solidity
uint256 fee
```

Fee amount collected from each withdrawal. Can be in range from 0% to 5%. [10^18 == 100%].

### constructor

```solidity
constructor(address _feeCollector, uint256 _fee) public
```

### addWill

```solidity
function addWill(address heir, contract IERC20 token, uint256 withdrawalTime, uint256 amount) external returns (uint256 ID)
```

Create the will will provided parameters. Checks if owner has enough allowance and calculates and 
        calculates time interval for future use in resetTimers(). Emits AddWill event.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| heir | address | - Address to whom the tokens are inherited to. |
| token | contract IERC20 | - Token to use in will. |
| withdrawalTime | uint256 | - Time when the heir will be able to withdraw tokens. |
| amount | uint256 | - Amount of tokens to send. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - Id of the created will |

### resetTimers

```solidity
function resetTimers(uint256[] IDs) external
```

Reset timers for all sender's wills depending on calculated timeInterval. Emits UpdateWithdrawalTime events.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of wills to reset timers for. |

### updateWithdrawalTime

```solidity
function updateWithdrawalTime(uint256 ID, uint256 _withdrawalTime) public
```

Update time when heir can withdraw their tokens and timeInterval. Emits UpdateWithdrawalTime event.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - ID of will to update. |
| _withdrawalTime | uint256 | - New withdrawal time. |

### updateHeir

```solidity
function updateHeir(uint256 ID, address _heir) public
```

Sets new heir to the will. Emits UpdateHeir event.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - Id of the will to update. |
| _heir | address | - New heir of the will. |

### updateAmount

```solidity
function updateAmount(uint256 ID, uint256 _amount) public
```

Set new amount to the will. Checks if owner has enough allowance. Emits UpdateAmount event.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - Id of the will to update. |
| _amount | uint256 | - New amount of the will. |

### update

```solidity
function update(uint256 ID, uint256 _withdrawalTime, address _heir, uint256 _amount) external
```

Batch update will values.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - Id of the inheritwillance to update. |
| _withdrawalTime | uint256 | - New will withdrawal time. |
| _heir | address | - New heir of the will. |
| _amount | uint256 | - New amount of the will. |

### removeWill

```solidity
function removeWill(uint256 ID) external
```

Remove will from storage. Emits UpdaRemoveWillteHeir event.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - Id of the will to remove. |

### withdraw

```solidity
function withdraw(uint256 ID) external returns (uint256 amount)
```

Withdraw tokens to heir. Emits Withdraw event.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - Id of the inheritance to withdraw. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | - Amount withdrawn. |

### getWill

```solidity
function getWill(address owner, uint256 index) external view returns (struct IHeritage.WillData will)
```

Returns owner's will at index.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | - Owner of the will. |
| index | uint256 | - Index of the will in ownerWills to return. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| will | struct IHeritage.WillData | - Info on will. |

### getInheritance

```solidity
function getInheritance(address heir, uint256 index) external view returns (struct IHeritage.WillData inheritance)
```

Returns user's inheritance  at index.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| heir | address | - Heir of the inheritance. |
| index | uint256 | - Index of the inheritance in heirInheritances to return. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| inheritance | struct IHeritage.WillData | - Info on inheritance. |

### getWillsLength

```solidity
function getWillsLength(address owner) external view returns (uint256 _length)
```

### getInheritancesLength

```solidity
function getInheritancesLength(address heir) external view returns (uint256 _length)
```

### _checkWillAvailability

```solidity
function _checkWillAvailability(struct IHeritage.WillData _data) internal view
```

### setFeeCollector

```solidity
function setFeeCollector(address _feeCollector) external
```

### setFee

```solidity
function setFee(uint256 _fee) external
```

### _setFeeCollector

```solidity
function _setFeeCollector(address _feeCollector) internal
```

### _setFee

```solidity
function _setFee(uint256 _fee) internal
```

