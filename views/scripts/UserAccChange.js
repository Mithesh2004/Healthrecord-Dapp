//checks for the active account is admin even if there is change in accounts in metamask
export async function checkUserAccOnChange(account) {
  window.ethereum.on("accountsChanged", refresh);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts[0] !== account) {
            alert("The Page is being refreshed due to change in Account");
            location.reload();
          } else {
            window.ethereum.on("accountsChanged", refresh);
          }
        })
        .catch((error) => console.error(error));
    } else {
      window.ethereum.removeListener("accountsChanged", refresh);
    }
  });
}

const refresh = (accounts) => {
  alert("The Page is being refreshed due to change in Account");
  location.reload();
};
