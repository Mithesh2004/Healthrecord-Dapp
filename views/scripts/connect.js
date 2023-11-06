import { initiateProcess } from "./sharedfile.js";

const ConnectBtn = document.getElementById("connect-button");
ConnectBtn.addEventListener("click", async () => {
  const [provider, signer, abi, contract, contractAddress] =
    await initiateProcess();
  const admin = await contract.admin();
  if (admin === signer.address) {
    window.location.href = "http://localhost:3000/admin";
  } else {
    window.location.href = "http://localhost:3000/user";
  }
});
