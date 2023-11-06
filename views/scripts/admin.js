import { initiateProcess } from "./sharedfile.js";
import { checkAccOnChange } from "./checkAccChange.js";

const [provider, signer, abi, contract, contractAddress] =
  await initiateProcess();

let admin = await contract.admin();
admin = admin.toLowerCase();

await checkAccOnChange(admin);
