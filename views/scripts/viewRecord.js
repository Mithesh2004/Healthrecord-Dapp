import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.6.2/ethers.min.js";
import { initiateProcess } from "./sharedfile.js";
import { checkAccOnChange } from "./checkAccChange.js";

const [provider, signer, abi, contract, contractAddress] =
  await initiateProcess();

let admin = await contract.admin();
admin = admin.toLowerCase();

await checkAccOnChange(admin);

const form = document.getElementById("address-form");

form.addEventListener("submit", async function (event) {
  try {
    event.preventDefault();

    const patientAddress = document.getElementById("address").value;
    const [patientRecord, bill] = await Promise.all([
      contract.patientRecords(patientAddress),
      contract.bills(patientAddress),
    ]);

    if (patientRecord.name !== "") {
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
      document.getElementById("disp-addr").innerText = patientAddress;
      document.querySelector(".patient-details").style.display = "block";

      const billTimeElement = document.getElementById("bill-time");
      const noBillElement = document.getElementById("no-bill");
      const billAmountElement = document.getElementById("bill-amount");

      if (bill.amount > BigInt(0)) {
        const billAmountInEther = ethers.formatEther(bill.amount);
        const ethInUsd = await contract.ethToUsd();
        const billAmountInUsd =
          (Number(billAmountInEther) * Number(ethInUsd)) / 10e7;
        const dateString = new Date(Number(bill.time) * 1000).toLocaleString();

        billAmountElement.textContent = `Pending Amount: ${billAmountInEther} ETH (${billAmountInUsd} USD)`;
        billTimeElement.textContent = `Bill Issued On: ${dateString}`;
        noBillElement.style.display = "none";
        billAmountElement.style.display = "block";
        billTimeElement.style.display = "block";
      } else {
        billAmountElement.textContent = "";
        billTimeElement.textContent = "";
        billTimeElement.style.display = "none";
        billAmountElement.style.display = "none";
        noBillElement.style.display = "block";
      }

      document.getElementById("bill-details").style.display = "block";

      document
        .getElementById("trash-icon")
        .addEventListener("click", async () => {
          const waitTag = document.getElementById("waiting-tag");
          let userResponse = confirm(
            "Are you sure you want to delete this record?"
          );
          if (userResponse == true) {
            try {
              waitTag.style.display = "block";
              const txn = await contract.connect(signer).delRec(patientAddress);
              await txn.wait();
              alert("Patient Record Deleted Successfully");
              location.reload();
            } catch (error) {
              let revertReason = error.reason;
              revertReason
                ? alert(revertReason)
                : alert("Something Went Wrong :(");
            } finally {
              waitTag.style.display = "none";
            }
          }
        });

      //modal
      const modal = document.getElementById("edit-bill-modal");
      const editBillBtn = document.getElementById("edit-icon");
      const closeBtn = document.getElementsByClassName("close-button")[0];

      let amountInUsd7 = await contract.ethToUsd();
      let ethToUsd = Number(amountInUsd7) / 10e7;
      document.getElementById("amount").addEventListener("input", () => {
        let amountInEther = document.getElementById("amount").value;

        let amountInUsd = ethToUsd * amountInEther;
        document.getElementById("usdEquivalent").value = amountInUsd;
      });
      editBillBtn.onclick = function () {
        if (bill.amount > BigInt(0)) {
          modal.style.display = "block";
        } else {
          alert("No Pending Bills");
        }
      };
      closeBtn.onclick = function () {
        modal.style.display = "none";
      };
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      };
      const editBillForm = document.getElementById("edit-bill-form");
      editBillForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (document.getElementById("usdEquivalent").value === "NaN") {
          alert("Please enter a valid amount");
        } else {
          const editBillBtn = document.getElementById("editbill-btn");
          try {
            let amountInEther = document.getElementById("amount").value;

            // Convert amount from ether to wei
            let amountInWei = ethers.parseEther(amountInEther);

            editBillBtn.innerText = "Changing Bill ...";
            editBillBtn.disabled = true;

            const tx = await contract
              .connect(signer)
              .editBill(patientAddress, amountInWei);
            await tx.wait();
            alert("success!");
            editBillForm.reset();
            location.reload();
          } catch (error) {
            let revertReason = error.reason;
            revertReason
              ? alert(revertReason)
              : alert("Something Went Wrong :(");
          } finally {
            editBillBtn.disabled = false;
            editBillBtn.innerText = "Change Bill";
          }
        }
      });
    } else {
      alert("No patient record found for this address.");
    }
  } catch (error) {
    if (ethers.isAddress(document.getElementById("address").value)) {
      let revertReason = error.reason;
      revertReason ? alert(revertReason) : alert("Something Went Wrong :(");
    } else {
      alert("Invalid Account Address");
    }
  }
});
