pragma solidity ^0.6.0;

import "./ICompliance.sol";
import "../token/Token.sol";

contract LimitHolder is ICompliance {
    Token public token;
    uint public holderLimit;

    constructor (address _token, uint _holderLimit) public {
        token = Token(_token);
        holderLimit = _holderLimit;
    }

    function getHolderCount() public view returns(uint) {
        return token.holderCount();
    }


    /**
    * @notice checks that the transfer is compliant.
    * this function will check if the amount of holders is
    * allowing the transfer to happen, considering a maximum
    * amount of holders
    *
    * @param _from The address of the sender
    * @param _to The address of the receiver
    * @param _value The amount of tokens involved in the transfer
    */
    function canTransfer(address _from, address _to, uint256 _value) public view returns (bool) {
        if (token.holderCount() < holderLimit) {
            return true;
        }
        return false;
    }
}
