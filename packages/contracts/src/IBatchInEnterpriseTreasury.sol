// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBatchInEnterpriseTreasury
 * @notice Interface for corporate multi-seat subscription, department budget envelopes,
 * and EIP-712 gasless spend delegation on Base L2 / Ethereum.
 */
interface IBatchInEnterpriseTreasury {
    enum MemberRole {
        DEVELOPER,       // 0: Basic inference, scoped keys
        FINOPS,          // 1: Invoices, budget top-ups
        AUDITOR,         // 2: Read-only VaaS proof verification
        ENTERPRISE_ADMIN,// 3: Department creation, seat assignment
        OWNER            // 4: Corporate superadmin, treasury withdraw
    }

    struct Organization {
        bytes32 orgId;
        string legalName;
        address adminWallet;
        uint256 seatLimit;
        uint256 activeSeats;
        uint256 monthlyDepositWei;
        uint256 totalSpentWei;
        bool zdrEnclaveEnforced;
        bool active;
    }

    struct DepartmentEnvelope {
        bytes32 deptId;
        string name;
        address leadWallet;
        uint256 monthlyCapWei;
        uint256 currentPeriodSpentWei;
        uint256 lastResetTimestamp;
        bool hardCapLocked;
        bool active;
    }

    struct MemberAccount {
        address wallet;
        bytes32 orgId;
        bytes32 deptId;
        MemberRole role;
        uint256 spendAllowanceWei;
        uint256 totalUsedWei;
        bool active;
    }

    event OrganizationRegistered(
        bytes32 indexed orgId,
        string legalName,
        address indexed adminWallet,
        uint256 seatLimit
    );

    event SeatsAllocated(
        bytes32 indexed orgId,
        uint256 newTotalSeats,
        uint256 addedSeats,
        uint256 costWei
    );

    event TreasuryDeposited(
        bytes32 indexed orgId,
        address indexed token,
        uint256 amount,
        address indexed depositor
    );

    event DepartmentConfigured(
        bytes32 indexed orgId,
        bytes32 indexed deptId,
        string name,
        uint256 monthlyCapWei
    );

    event MemberConfigured(
        bytes32 indexed orgId,
        address indexed memberWallet,
        bytes32 indexed deptId,
        MemberRole role,
        uint256 allowanceWei
    );

    event InferenceSettledGasless(
        bytes32 indexed orgId,
        bytes32 indexed deptId,
        address indexed memberWallet,
        bytes32 receiptHash,
        uint256 amountWei
    );

    event SlaViolationRefundClaimed(
        bytes32 indexed orgId,
        bytes32 indexed receiptHash,
        uint256 refundAmountWei,
        address recipient
    );

    function registerOrganization(
        bytes32 orgId,
        string calldata legalName,
        address adminWallet,
        uint256 initialSeats
    ) external;

    function purchaseSeats(bytes32 orgId, uint256 additionalSeats) external payable;

    function depositTreasury(bytes32 orgId, address token, uint256 amount) external payable;

    function configureDepartment(
        bytes32 orgId,
        bytes32 deptId,
        string calldata name,
        address leadWallet,
        uint256 monthlyCapWei
    ) external;

    function configureMember(
        bytes32 orgId,
        address memberWallet,
        bytes32 deptId,
        MemberRole role,
        uint256 allowanceWei
    ) external;

    function settleInferenceSpend(
        bytes32 orgId,
        bytes32 deptId,
        address memberWallet,
        bytes32 receiptHash,
        uint256 costWei,
        bytes calldata permitSignature
    ) external;
}
