import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.6.2/ethers.min.js";

export async function initiateProcess() {
  let provider;
  let signer;
  let abi;
  let contractAddress;
  if (window.ethereum == null) {
    window.alert("Please install Metamask");
    window.location.reload();
  } else {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  fetch("http://localhost:3000/get-abi", { method: "POST" })
    .then((response) => response.text())
    .then((_abi) => {
      abi = _abi;
    });
  fetch("http://localhost:3000/get-cont-addr", { method: "POST" })
    .then((response) => response.text())
    .then((_addr) => {
      contractAddress = _addr;
    });

  signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, provider);

  return [provider, signer, abi, contract, contractAddress];
}
