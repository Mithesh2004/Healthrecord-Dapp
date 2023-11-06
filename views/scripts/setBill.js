import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.6.2/ethers.min.js";
import { initiateProcess } from "./sharedfile.js";
import { checkAccOnChange } from "./checkAccChange.js";

const [provider, signer, abi, contract, contractAddress] =
  await initiateProcess();

let admin = await contract.admin();
admin = admin.toLowerCase();

await checkAccOnChange(admin);

let amountInUsd7 = await contract.ethToUsd();
let ethToUsd = Number(amountInUsd7) / 10e7;
document.getElementById("amount").addEventListener("input", () => {
  let amountInEther = document.getElementById("amount").value;

  let amountInUsd = ethToUsd * amountInEther;
  document.getElementById("usdEquivalent").value = amountInUsd;
});

let form = document.querySelector("form");
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  if (
    document.getElementById("usdEquivalent").value === "NaN" ||
    document.getElementById("usdEquivalent").value === "0"
  ) {
    alert("Please enter a valid amount");
  } else {
    let address = document.getElementById("address").value;
    let amountInEther = document.getElementById("amount").value;

    // Convert amount from ether to wei
    let amountInWei = ethers.parseEther(amountInEther);

    const setBillBtn = document.getElementById("set-bill");
    setBillBtn.innerText = "Adding Bill ...";
    setBillBtn.disabled = true;

    try {
      const tx = await contract
        .connect(signer)
        .createBill(address, amountInWei);
      await tx.wait();
      alert("success!");
      form.reset();
    } catch (error) {
      if (ethers.isAddress(document.getElementById("address").value)) {
        let revertReason = error.reason;
        revertReason ? alert(revertReason) : alert("Something Went Wrong :(");
      } else {
        alert("Invalid Patient Address");
      }
    } finally {
      setBillBtn.disabled = false;
      setBillBtn.innerText = "Submit";
    }
  }
});
