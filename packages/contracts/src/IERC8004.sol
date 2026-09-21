// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC8004
 * @notice Standard interface for Trustless Agent Execution, Autonomous Identity, and Compute Receipts.
 * Enables autonomous AI agents to prove spend authorization, compute attestation, and receipt verification.
 */
interface IERC8004 {
    /// @notice Emitted when an agent creates a spend authorization intent
    event SpendIntentAuthorized(
        bytes32 indexed intentId,
        address indexed agentOwner,
        string requestedModel,
        uint256 maxBudgetWei,
        uint256 expiresAt
    );

    /// @notice Emitted when an agent's execution is cryptographically settled
    event AgentExecutionSettled(
        bytes32 indexed settlementId,
        bytes32 indexed intentId,
        bytes32 indexed receiptHash,
        uint256 actualCostWei,
        address debitedWallet
    );

    /// @notice Emitted when an agent budget policy is updated
    event BudgetPolicyUpdated(
        address indexed agentAddress,
        uint256 maxDailyWei,
        uint256 maxPerRequestWei,
        bool active
    );

    /**
     * @notice Verify whether a given receipt hash corresponds to a valid, settled agent execution
     * @param receiptHash SHA256 hash of the execution receipt
     * @return valid True if the receipt exists and is verified
     * @return settledAt Block timestamp when settlement was recorded
     */
    function verifyAgentReceipt(bytes32 receiptHash) external view returns (bool valid, uint256 settledAt);
}
