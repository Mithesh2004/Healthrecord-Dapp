const fs = require("fs-extra");
const ethers = require("ethers");
require("dotenv").config();


const rpcurl = process.env.RPC_URL
const privatekey = process.env.PRIVATE_KEY

async function main() {
  const provider = new ethers.JsonRpcProvider(rpcurl);
  const wallet = new ethers.Wallet(
    privatekey,
    provider
  );
  const abi = fs.readFileSync("./abi.txt", "utf8");
  const binary = fs.readFileSync(
    "./bytecode.txt",
    "utf8"
  );
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Please wait, Deploying.....");
  const contract = await contractFactory.deploy();
  const txn = await contract.deploymentTransaction();
 // console.log(txn)
  const receipt = await txn.wait(1);
  //console.log(receipt);
  let contract_address = await contract.getAddress()
  fs.writeFileSync("contract_addr.txt",contract_address)
  console.log("Successful")
  console.log("Now start the server")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  });