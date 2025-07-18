import json
import hashlib
from pathlib import Path
from merkletools import MerkleTools

data_dir = Path.cwd().parent / "data"
with open(data_dir / "diplomas.json", "r") as f:
    diplomas = json.load(f)

def keccak256(data):
    return hashlib.sha3_256(data.encode("utf-8")).hexdigest()

mt = MerkleTools(hash_type="sha3_256")
for diploma in diplomas:
    serialized = json.dumps(diploma, separators=(",", ":"), sort_keys=True)
    mt.add_leaf(serialized, do_hash=True)
mt.make_tree()

merkle_root = mt.get_merkle_root()

proofs = []
for i, diploma in enumerate(diplomas):
    serialized = json.dumps(diploma, separators=(",", ":"), sort_keys=True)
    leaf_hash = keccak256(serialized)
    raw_proof = mt.get_proof(i)
    proof = {
        "index": i,
        "leaf": leaf_hash,
        "diploma": diploma,
        "proof": [
            {
                "position": "left" if "left" in p else "right",
                "hash": p.get("left") or p.get("right")
            }
            for p in raw_proof
        ]
    }
    proofs.append(proof)

ipfs_object = {
    "merkleRoot": merkle_root,
    "proofs": proofs
}

out_file = data_dir / "ipfs_simulated.json"
with open(out_file, "w") as f:
    json.dump(ipfs_object, f, indent=2)

print(f"✅ Merkle root: {merkle_root}")
print(f"✅ Simulated IPFS data saved to: {out_file}")
