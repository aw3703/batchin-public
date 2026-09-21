// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC8004.sol";

/**
 * @title BatchInVaaSRegistry
 * @notice Enterprise-grade On-Chain Verifiable AI as a Service (VaaS) Registry.
 *
 * Architecture inspired by:
 * - Ritual (Infernet): Structured off-chain compute verification with on-chain callbacks
 * - Hyperbolic (spML): High-throughput Merkle batch commitments with proof of sampling
 * - ORA (opML): Optimistic dispute and challenge window for inference attestation
 * - ERC-8004: Trustless agent execution, identity attestation, and receipt verification
 */
contract BatchInVaaSRegistry is IERC8004 {
    // --- Structs ---

    struct BatchRecord {
        bytes32 merkleRoot;
        string modelId;
        uint256 recordCount;
        uint256 timestamp;
        uint256 blockNumber;
        address attestationSigner;
        uint256 disputeDeadline;
        bool disputed;
        bool resolved;
    }

    struct DisputeRecord {
        bytes32 merkleRoot;
        bytes32 receiptHash;
        address challenger;
        uint256 bondAmount;
        string reason;
        uint256 timestamp;
        bool resolved;
        bool slashed;
    }

    struct ModelMetadata {
        string modelId;
        string vendor;
        string computeSpec;
        bool teeSupported;
        uint256 maxContextLength;
        bool active;
    }

    struct AgentReceiptRecord {
        bytes32 settlementId;
        bytes32 intentId;
        uint256 actualCostWei;
        address debitedWallet;
        uint256 settledAt;
        bool exists;
    }

    // --- State Variables ---

    address public owner;
    address public attestationSigner;
    address public operator;
    uint256 public disputePeriod = 3 days;
    uint256 public challengeBond = 0.01 ether;

    mapping(bytes32 => BatchRecord) public batches;
    bytes32[] public batchRoots;

    mapping(bytes32 => DisputeRecord) public disputes;
    mapping(string => ModelMetadata) public models;
    mapping(bytes32 => AgentReceiptRecord) private _agentReceipts;

    // --- Events ---

    event BatchCommitted(
        bytes32 indexed merkleRoot,
        string modelId,
        uint256 recordCount,
        uint256 timestamp,
        uint256 blockNumber,
        address indexed signer
    );

    event ReceiptVerified(
        bytes32 indexed receiptHash,
        bytes32 indexed merkleRoot,
        uint256 indexed index,
        address verifier
    );

    event DisputeOpened(
        bytes32 indexed merkleRoot,
        bytes32 indexed receiptHash,
        address indexed challenger,
        uint256 bondAmount,
        string reason
    );

    event DisputeResolved(
        bytes32 indexed merkleRoot,
        bytes32 indexed receiptHash,
        bool slashed,
        address indexed resolver
    );

    event ModelRegistered(
        string indexed modelId,
        string vendor,
        string computeSpec,
        bool teeSupported
    );

    event ParametersUpdated(uint256 disputePeriod, uint256 challengeBond, address attestationSigner);

    // --- Modifiers ---

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == owner, "Only operator");
        _;
    }

    // --- Constructor ---

    constructor(address _attestationSigner, address _operator) {
        owner = msg.sender;
        attestationSigner = _attestationSigner;
        operator = _operator;
    }

    // --- Admin Configuration ---

    function setAttestationSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid address");
        attestationSigner = _signer;
        emit ParametersUpdated(disputePeriod, challengeBond, attestationSigner);
    }

    function setOperator(address _operator) external onlyOwner {
        require(_operator != address(0), "Invalid address");
        operator = _operator;
    }

    function setDisputePeriod(uint256 _period) external onlyOwner {
        require(_period >= 1 hours && _period <= 30 days, "Period out of range");
        disputePeriod = _period;
        emit ParametersUpdated(disputePeriod, challengeBond, attestationSigner);
    }

    function setChallengeBond(uint256 _bond) external onlyOwner {
        challengeBond = _bond;
        emit ParametersUpdated(disputePeriod, challengeBond, attestationSigner);
    }

    // --- Model Registry ---

    function registerModel(
        string calldata modelId,
        string calldata vendor,
        string calldata computeSpec,
        bool teeSupported,
        uint256 maxContextLength
    ) external onlyOwner {
        models[modelId] = ModelMetadata({
            modelId: modelId,
            vendor: vendor,
            computeSpec: computeSpec,
            teeSupported: teeSupported,
            maxContextLength: maxContextLength,
            active: true
        });

        emit ModelRegistered(modelId, vendor, computeSpec, teeSupported);
    }

    // --- Batch Anchoring ---

    /**
     * @notice Commit a batch of VaaS inference receipts anchored as a cryptographic Merkle Root.
     * @param merkleRoot The root of the Merkle tree aggregating all inference receipt hashes.
     * @param recordCount Number of receipts aggregated into this batch.
     * @param modelId Identifier of the model (or 'batchin-fabric-multi') producing the inference.
     * @param signature EIP-191 signature signed by attestationSigner over (merkleRoot, recordCount, modelId, block.chainid).
     */
    function commitBatch(
        bytes32 merkleRoot,
        uint256 recordCount,
        string calldata modelId,
        bytes calldata signature
    ) external onlyOperator {
        require(batches[merkleRoot].timestamp == 0, "Batch already committed");
        require(merkleRoot != bytes32(0), "Invalid merkle root");
        require(recordCount > 0, "Empty batch");

        // Verify attestation signature
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(merkleRoot, recordCount, modelId, block.chainid)))
        );
        address recoveredSigner = _recoverSigner(messageHash, signature);
        require(recoveredSigner == attestationSigner, "Invalid attestation signature");

        uint256 deadline = block.timestamp + disputePeriod;

        batches[merkleRoot] = BatchRecord({
            merkleRoot: merkleRoot,
            modelId: modelId,
            recordCount: recordCount,
            timestamp: block.timestamp,
            blockNumber: block.number,
            attestationSigner: recoveredSigner,
            disputeDeadline: deadline,
            disputed: false,
            resolved: false
        });

        batchRoots.push(merkleRoot);

        emit BatchCommitted(
            merkleRoot,
            modelId,
            recordCount,
            block.timestamp,
            block.number,
            recoveredSigner
        );
    }

    // --- Merkle Verification ---

    /**
     * @notice Verify inclusion of an individual inference receipt in an on-chain batch commitment.
     * @param receiptHash SHA256 / keccak256 hash of the individual VaaS receipt.
     * @param merkleProof Array of sibling hashes along the Merkle audit path.
     * @param index Leaf index in the Merkle tree.
     * @param merkleRoot The target batch Merkle root.
     * @return verified True if the receipt mathematically belongs to the committed batch.
     * @return isDisputed True if the batch has an active dispute.
     * @return timestamp The block timestamp when the batch was committed.
     */
    function verifyReceipt(
        bytes32 receiptHash,
        bytes32[] calldata merkleProof,
        uint256 index,
        bytes32 merkleRoot
    ) external view returns (bool verified, bool isDisputed, uint256 timestamp) {
        BatchRecord memory batch = batches[merkleRoot];
        if (batch.timestamp == 0) {
            return (false, false, 0);
        }

        bytes32 computedHash = receiptHash;
        uint256 path = index;

        for (uint256 i = 0; i < merkleProof.length; i++) {
            bytes32 proofElement = merkleProof[i];
            if (path % 2 == 0) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
            path /= 2;
        }

        verified = (computedHash == merkleRoot);
        return (verified, batch.disputed, batch.timestamp);
    }

    // --- Optimistic Challenge & Dispute Resolution ---

    /**
     * @notice Challenge a batch or receipt during the dispute window (opML optimistic verification).
     * @param merkleRoot The batch Merkle root being challenged.
     * @param receiptHash The specific receipt hash with alleged failure / SLA breach.
     * @param reason Human-readable description or error code.
     */
    function challengeBatch(
        bytes32 merkleRoot,
        bytes32 receiptHash,
        string calldata reason
    ) external payable {
        require(msg.value >= challengeBond, "Insufficient challenge bond");
        BatchRecord storage batch = batches[merkleRoot];
        require(batch.timestamp > 0, "Batch does not exist");
        require(block.timestamp <= batch.disputeDeadline, "Dispute window closed");
        require(!batch.disputed, "Already disputed");

        batch.disputed = true;

        disputes[receiptHash] = DisputeRecord({
            merkleRoot: merkleRoot,
            receiptHash: receiptHash,
            challenger: msg.sender,
            bondAmount: msg.value,
            reason: reason,
            timestamp: block.timestamp,
            resolved: false,
            slashed: false
        });

        emit DisputeOpened(merkleRoot, receiptHash, msg.sender, msg.value, reason);
    }

    /**
     * @notice Resolve a dispute after review of execution evidence.
     * @param receiptHash The receipt hash under dispute.
     * @param slashed True if challenger proved the fault (bond returned + penalty reward); false if challenge was invalid (bond slashed).
     */
    function resolveDispute(
        bytes32 receiptHash,
        bool slashed
    ) external onlyOwner {
        DisputeRecord storage dispute = disputes[receiptHash];
        require(dispute.timestamp > 0, "Dispute not found");
        require(!dispute.resolved, "Already resolved");

        dispute.resolved = true;
        dispute.slashed = slashed;

        BatchRecord storage batch = batches[dispute.merkleRoot];
        batch.resolved = true;

        if (slashed) {
            // Reward challenger: return bond + payout
            payable(dispute.challenger).transfer(dispute.bondAmount);
        } else {
            // Forfeit bond to contract owner
            payable(owner).transfer(dispute.bondAmount);
        }

        emit DisputeResolved(dispute.merkleRoot, receiptHash, slashed, msg.sender);
    }

    // --- IERC8004 Implementation ---

    /**
     * @notice Record an autonomous agent settlement link on-chain.
     */
    function recordAgentSettlement(
        bytes32 settlementId,
        bytes32 intentId,
        bytes32 receiptHash,
        uint256 actualCostWei,
        address debitedWallet
    ) external onlyOperator {
        require(!_agentReceipts[receiptHash].exists, "Receipt already settled");

        _agentReceipts[receiptHash] = AgentReceiptRecord({
            settlementId: settlementId,
            intentId: intentId,
            actualCostWei: actualCostWei,
            debitedWallet: debitedWallet,
            settledAt: block.timestamp,
            exists: true
        });

        emit AgentExecutionSettled(
            settlementId,
            intentId,
            receiptHash,
            actualCostWei,
            debitedWallet
        );
    }

    /**
     * @notice Verify whether a given receipt hash corresponds to a valid, settled agent execution.
     */
    function verifyAgentReceipt(bytes32 receiptHash) external view override returns (bool valid, uint256 settledAt) {
        AgentReceiptRecord memory record = _agentReceipts[receiptHash];
        return (record.exists, record.settledAt);
    }

    // --- Helper Functions ---

    function getBatchCount() external view returns (uint256) {
        return batchRoots.length;
    }

    function _recoverSigner(bytes32 ethSignedMessageHash, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return ecrecover(ethSignedMessageHash, v, r, s);
    }
}
