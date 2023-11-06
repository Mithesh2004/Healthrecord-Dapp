import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.6.2/ethers.min.js";
import { initiateProcess } from "./sharedfile.js";
import { checkAccOnChange } from "./checkAccChange.js";

const [provider, signer, abi, contract, contractAddress] =
  await initiateProcess();

let admin = await contract.admin();
admin = admin.toLowerCase();

await checkAccOnChange(admin);

const form = document.querySelector("form");
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  let data = {
    name: document.getElementById("name").value,
    address: document.getElementById("address").value,
    age: document.getElementById("age").value,
    weight: document.getElementById("weight").value,
    sex: document.getElementById("sex").value,
    bloodgroup: document.getElementById("bloodgroup").value,
    condition: document.getElementById("condition").value,
    medication: document.getElementById("medication").value,
  };

  const submitBtn = document.getElementById("submit-btn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Adding Record....";

  try {
    const tx = await contract
      .connect(signer)
      .addPatientRecord(
        data.address,
        data.name,
        data.age,
        data.weight,
        data.sex,
        data.bloodgroup,
        data.condition,
        data.medication
      );
    await tx.wait();
    window.alert("Successful!");
  } catch (error) {
    if (ethers.isAddress(document.getElementById("address").value)) {
      let revertReason = error.reason;
      revertReason ? alert(revertReason) : alert("Something Went Wrong :(");
    } else {
      alert("Invalid Account Address");
    }
  } finally {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit";
  }
});
