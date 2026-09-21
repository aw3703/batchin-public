import test from "node:test";
import assert from "node:assert/strict";
import { verifyMerkleProof } from "../src/client.js";
import { createHash } from "node:crypto";

function sha256(str) {
  return createHash("sha256").update(str).digest("hex");
}

test("verifyMerkleProof should return true for empty proof when leaf matches root", () => {
  const leaf = "0x" + sha256("leaf_content");
  const result = verifyMerkleProof(leaf, [], leaf);
  assert.equal(result, true);
});

test("verifyMerkleProof should return false when leaf does not match root with empty proof", () => {
  const leaf = "0x" + sha256("leaf_content");
  const root = "0x" + sha256("other_content");
  const result = verifyMerkleProof(leaf, [], root);
  assert.equal(result, false);
});

test("verifyMerkleProof with explicit position object", () => {
  const leaf = "0x" + sha256("item_a");
  const sibling = "0x" + sha256("item_b");
  const expectedCombined = leaf.slice(2) + sibling.slice(2);
  const expectedRoot = "0x" + sha256(expectedCombined);

  const result = verifyMerkleProof(
    leaf,
    [{ position: "right", hash: sibling }],
    expectedRoot,
    (combined) => sha256(combined)
  );
  assert.equal(result, true);
});

test("verifyMerkleProof with string sibling (lexicographical ordering)", () => {
  const leaf = "0x" + sha256("leaf");
  const sibling = "0x" + sha256("sibling");
  const a = leaf.slice(2);
  const b = sibling.slice(2);
  const expectedCombined = a < b ? a + b : b + a;
  const expectedRoot = "0x" + sha256(expectedCombined);

  const result = verifyMerkleProof(
    leaf,
    [sibling],
    expectedRoot,
    (combined) => sha256(combined)
  );
  assert.equal(result, true);
});
