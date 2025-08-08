async function createIpfsNode() {
  const { create } = await import("ipfs");
  return create({ start: false });
}

async function addJson(ipfs, obj) {
  const { cid } = await ipfs.add(JSON.stringify(obj));
  return cid;
}

async function catToString(ipfs, cid) {
  let data = "";
  for await (const chunk of ipfs.cat(cid)) {
    data += Buffer.from(chunk).toString();
  }
  return data;
}

module.exports = { createIpfsNode, addJson, catToString };
