//checks for the active account is admin even if there is change in accounts in metamask
export async function checkAccOnChange(admin) {
  window.ethereum.on("accountsChanged", unAuthorised);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts[0] !== admin) {
            alert("The current account is Unauthorised");
            window.location.href = "http://localhost:3000/";
          } else {
            window.ethereum.on("accountsChanged", unAuthorised);
          }
        })
        .catch((error) => console.error(error));
    } else {
      window.ethereum.removeListener("accountsChanged", unAuthorised);
    }
  });
}

const unAuthorised = (accounts) => {
  alert("The current account is Unauthorised");
  window.location.href = "http://localhost:3000/";
};
