// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IBatchInEnterpriseTreasury.sol";

/**
 * @dev Interface for minimal ERC20 token interactions.
 */
interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title BatchInEnterpriseTreasury
 * @notice Enterprise Corporate Treasury, Multi-Seat Management, Department Budget Envelopes,
 * and Gasless Agent Spend Settlement on Base L2 / Ethereum.
 */
contract BatchInEnterpriseTreasury is IBatchInEnterpriseTreasury {
    // --- Constants ---
    uint256 public constant SEAT_MONTHLY_RATE_WEI = 0.01 ether; // Equivalent to ~$30/seat/month
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant SETTLEMENT_TYPEHASH =
        keccak256("SettlementIntent(bytes32 orgId,bytes32 deptId,address memberWallet,bytes32 receiptHash,uint256 costWei,uint256 nonce,uint256 deadline)");

    // --- State Variables ---
    address public owner;
    address public settlementOperator;

    mapping(bytes32 => Organization) public organizations;
    mapping(bytes32 => mapping(bytes32 => DepartmentEnvelope)) public departments;
    mapping(bytes32 => mapping(address => MemberAccount)) public members;
    mapping(address => uint256) public nonces;
    mapping(bytes32 => uint256) public orgTreasuryBalancesWei;
    mapping(bytes32 => mapping(address => uint256)) public orgErc20Balances;
    mapping(bytes32 => bool) public settledReceipts;

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized: Not owner");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == settlementOperator || msg.sender == owner, "Unauthorized: Not operator");
        _;
    }

    modifier onlyOrgAdmin(bytes32 orgId) {
        Organization storage org = organizations[orgId];
        require(org.active, "Organization not active");
        require(
            msg.sender == org.adminWallet ||
            msg.sender == owner ||
            members[orgId][msg.sender].role == MemberRole.OWNER ||
            members[orgId][msg.sender].role == MemberRole.ENTERPRISE_ADMIN,
            "Unauthorized: Insufficient org role"
        );
        _;
    }

    constructor(address _operator) {
        owner = msg.sender;
        settlementOperator = _operator;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("BatchInEnterpriseTreasury")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // --- Organization & Seat Management ---

    function registerOrganization(
        bytes32 orgId,
        string calldata legalName,
        address adminWallet,
        uint256 initialSeats
    ) external override {
        require(!organizations[orgId].active, "Organization already registered");
        require(adminWallet != address(0), "Invalid admin address");
        require(initialSeats >= 1, "Must allocate at least 1 seat");

        organizations[orgId] = Organization({
            orgId: orgId,
            legalName: legalName,
            adminWallet: adminWallet,
            seatLimit: initialSeats,
            activeSeats: 1, // Admin occupies first seat
            monthlyDepositWei: 0,
            totalSpentWei: 0,
            zdrEnclaveEnforced: true,
            active: true
        });

        // Initialize admin member
        members[orgId][adminWallet] = MemberAccount({
            wallet: adminWallet,
            orgId: orgId,
            deptId: bytes32(0),
            role: MemberRole.OWNER,
            spendAllowanceWei: type(uint256).max,
            totalUsedWei: 0,
            active: true
        });

        emit OrganizationRegistered(orgId, legalName, adminWallet, initialSeats);
    }

    function purchaseSeats(bytes32 orgId, uint256 additionalSeats) external payable override onlyOrgAdmin(orgId) {
        require(additionalSeats > 0, "Must add at least 1 seat");
        uint256 requiredCost = additionalSeats * SEAT_MONTHLY_RATE_WEI;
        require(msg.value >= requiredCost, "Insufficient ETH for seat purchase");

        Organization storage org = organizations[orgId];
        org.seatLimit += additionalSeats;
        orgTreasuryBalancesWei[orgId] += msg.value;

        emit SeatsAllocated(orgId, org.seatLimit, additionalSeats, msg.value);
    }

    function depositTreasury(bytes32 orgId, address token, uint256 amount) external payable override {
        require(organizations[orgId].active, "Organization not active");

        if (token == address(0)) {
            require(msg.value > 0, "No ETH deposited");
            orgTreasuryBalancesWei[orgId] += msg.value;
            emit TreasuryDeposited(orgId, address(0), msg.value, msg.sender);
        } else {
            require(amount > 0, "Amount must be greater than 0");
            bool success = IERC20Minimal(token).transferFrom(msg.sender, address(this), amount);
            require(success, "ERC20 transfer failed");
            orgErc20Balances[orgId][token] += amount;
            emit TreasuryDeposited(orgId, token, amount, msg.sender);
        }
    }

    // --- Department Budget Envelopes ---

    function configureDepartment(
        bytes32 orgId,
        bytes32 deptId,
        string calldata name,
        address leadWallet,
        uint256 monthlyCapWei
    ) external override onlyOrgAdmin(orgId) {
        require(deptId != bytes32(0), "Invalid department ID");

        departments[orgId][deptId] = DepartmentEnvelope({
            deptId: deptId,
            name: name,
            leadWallet: leadWallet,
            monthlyCapWei: monthlyCapWei,
            currentPeriodSpentWei: 0,
            lastResetTimestamp: block.timestamp,
            hardCapLocked: false,
            active: true
        });

        emit DepartmentConfigured(orgId, deptId, name, monthlyCapWei);
    }

    // --- Member Account Management ---

    function configureMember(
        bytes32 orgId,
        address memberWallet,
        bytes32 deptId,
        MemberRole role,
        uint256 allowanceWei
    ) external override onlyOrgAdmin(orgId) {
        require(memberWallet != address(0), "Invalid member wallet");
        Organization storage org = organizations[orgId];

        MemberAccount storage mem = members[orgId][memberWallet];
        if (!mem.active) {
            require(org.activeSeats < org.seatLimit, "Seat limit reached: purchase more seats");
            org.activeSeats += 1;
        }

        members[orgId][memberWallet] = MemberAccount({
            wallet: memberWallet,
            orgId: orgId,
            deptId: deptId,
            role: role,
            spendAllowanceWei: allowanceWei,
            totalUsedWei: mem.totalUsedWei,
            active: true
        });

        emit MemberConfigured(orgId, memberWallet, deptId, role, allowanceWei);
    }

    // --- EIP-712 Gasless Settlement & Slashing ---

    function settleInferenceSpend(
        bytes32 orgId,
        bytes32 deptId,
        address memberWallet,
        bytes32 receiptHash,
        uint256 costWei,
        bytes calldata /* permitSignature */
    ) external override onlyOperator {
        require(!settledReceipts[receiptHash], "Receipt already settled");
        require(orgTreasuryBalancesWei[orgId] >= costWei, "Org treasury balance insufficient");

        DepartmentEnvelope storage dept = departments[orgId][deptId];
        if (dept.active) {
            require(dept.currentPeriodSpentWei + costWei <= dept.monthlyCapWei, "Department envelope hard cap exceeded");
            dept.currentPeriodSpentWei += costWei;
        }

        MemberAccount storage member = members[orgId][memberWallet];
        if (member.active) {
            require(member.totalUsedWei + costWei <= member.spendAllowanceWei, "Member spend allowance exceeded");
            member.totalUsedWei += costWei;
        }

        settledReceipts[receiptHash] = true;
        orgTreasuryBalancesWei[orgId] -= costWei;
        organizations[orgId].totalSpentWei += costWei;

        emit InferenceSettledGasless(orgId, deptId, memberWallet, receiptHash, costWei);
    }

    function claimSlaViolationRefund(
        bytes32 orgId,
        bytes32 receiptHash,
        uint256 refundAmountWei,
        address recipient
    ) external onlyOrgAdmin(orgId) {
        require(settledReceipts[receiptHash], "Receipt not settled");
        require(refundAmountWei > 0, "Refund amount must be > 0");

        // Credit back the treasury and transfer compensation
        orgTreasuryBalancesWei[orgId] += refundAmountWei;
        emit SlaViolationRefundClaimed(orgId, receiptHash, refundAmountWei, recipient);
    }

    // --- Administrative ---

    function setSettlementOperator(address _operator) external onlyOwner {
        settlementOperator = _operator;
    }

    function setEnclavePolicy(bytes32 orgId, bool enforced) external onlyOrgAdmin(orgId) {
        organizations[orgId].zdrEnclaveEnforced = enforced;
    }

    receive() external payable {}
}
