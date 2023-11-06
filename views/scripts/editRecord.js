import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.6.2/ethers.min.js";
import { initiateProcess } from "./sharedfile.js";
import { checkAccOnChange } from "./checkAccChange.js";

const [provider, signer, abi, contract, contractAddress] =
  await initiateProcess();

let admin = await contract.admin();
admin = admin.toLowerCase();

await checkAccOnChange(admin);

let patientAddress;
document
  .getElementById("address-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    patientAddress = document.getElementById("address").value;
    const patientRecord = await contract.patientRecords(patientAddress);

    if (patientRecord.name !== "") {
      document.getElementById("address-form").innerHTML = "";
      document.getElementById("disp-addr").innerText = patientAddress;
      document.getElementById("update-form").style.display = "block";
    } else {
      alert("No patient record found for this address.");
    }
  });

const form = document.getElementById("update-form");
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  let data = {
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    weight: document.getElementById("weight").value,
    sex: document.getElementById("sex").value,
    bloodgroup: document.getElementById("bloodgroup").value,
    condition: document.getElementById("condition").value,
    medication: document.getElementById("medication").value,
  };
  const updateBtn = document.getElementById("update-btn");
  updateBtn.disabled = true;
  updateBtn.textContent = "Updating...";
  try {
    const tx = await contract
      .connect(signer)
      .updatePatientRecord(
        patientAddress,
        data.name,
        data.age,
        data.weight,
        data.sex,
        data.bloodgroup,
        data.condition,
        data.medication
      );
    await tx.wait();
    alert("Successful!");
  } catch (error) {
    let revertReason = error.reason;
    revertReason ? alert(revertReason) : alert("Something Went Wrong :(");
  } finally {
    form.reset();
    updateBtn.disabled = false;
    updateBtn.innerText = "Update Record";
  }
});
