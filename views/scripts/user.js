import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.6.2/ethers.min.js";
import { initiateProcess } from "./sharedfile.js";
import { checkUserAccOnChange } from "./UserAccChange.js";

const [provider, signer, abi, contract, contractAddress] =
  await initiateProcess();
let admin = await contract.admin();
let patientAddress = await signer.address;
patientAddress = patientAddress.toLowerCase();
await checkUserAccOnChange(patientAddress);
document.getElementById("disp-addr").innerText = patientAddress;
try {
  const patientRecord = await contract.patientRecords(patientAddress);
  if (patientRecord.name === "") {
    document.querySelector(".patient-details").innerHTML =
      "No record exists for your connected metamask wallet account.";
  } else {
    [
      "name",
      "age",
      "weight",
      "sex",
      "bloodgroup",
      "condition",
      "medication",
    ].forEach((field) => {
      document.getElementById(field).textContent = patientRecord[field];
    });
  }
} catch (err) {
  console.error("Error fetching patient record: ", err);
}

const bill = await contract.bills(patientAddress);
const billAmountInWei = bill.amount;
if (billAmountInWei === BigInt(0)) {
  document.querySelector(".bill-details").innerHTML = "No pending bills";
} else {
  try {
    const billAmountInEther = ethers.formatEther(billAmountInWei);
    // Fetch the current Ether price in USD
    const ethInUsd = await contract.ethToUsd();
    const billAmountInUsd7 = billAmountInEther * Number(ethInUsd);
    const billAmountInUsd = Number(billAmountInUsd7) / 10e7;
    console.log(billAmountInUsd);
    var timestamp = Number(bill.time);
    var date = new Date(timestamp * 1000); //convert to milli sec
    var dateString = date.toLocaleString(); // Convert to local date string

    document.getElementById("time").textContent = "Billed at: " + dateString;
    document.getElementById("amount").textContent =
      "Bill Amount: " +
      billAmountInEther +
      " Ether (" +
      billAmountInUsd +
      " USD)";
  } catch (err) {
    console.error("Error fetching patient bill: ", err);
  }

  document
    .getElementById("pay-button")
    .addEventListener("click", async function () {
      const payBtn = document.getElementById("pay-button");
      const waitTag = document.getElementById("waiting-tag");
      payBtn.disabled = true;
      waitTag.style.display = "block";
      try {
        const patientAccBal = await provider.getBalance(patientAddress);
        const bill = await contract.bills(patientAddress);
        const billAmountInWei = bill.amount;
        const billAmountInEther = ethers.formatEther(billAmountInWei);
        const amountToSend = ethers.parseEther(billAmountInEther);

        const tx = await contract
          .connect(signer)
          .payBill({ value: amountToSend });
        console.log("Transaction sent: " + tx.hash);
        await tx.wait();
        console.log("Transaction mined");
        alert("Bill Payment Successful!");
        location.reload();
      } catch (error) {
        if (error.code === "INSUFFICIENT_FUNDS") {
          alert("Insufficient Balance");
        } else {
          let revertReason = error.reason;
          revertReason ? alert(revertReason) : alert("Something Went Wrong :(");
        }
      } finally {
        payBtn.disabled = false;
        waitTag.style.display = "none";
      }
      let bal = await contract.bills(patientAddress);
      console.log(bal);
    });
}
