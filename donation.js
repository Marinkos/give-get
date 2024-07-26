//Generate modal table and Show total amount
document.addEventListener("DOMContentLoaded", function () {
    const donationTotalElement = document.getElementById("donationTotal");
    fetchDataAndUpdateTotal(donationTotalElement); // Fetch data and update #donationTotal on load
  
    const donationTableButton = document.getElementById("donationTable");
    const donationTotal2Element = document.getElementById("donationTotal2");
  
    donationTableButton.addEventListener("click", function () {
      fetchDataAndUpdateTotal(donationTotal2Element); // Fetch data and update #donationTotal2 on button click
    });
  
    function fetchDataAndUpdateTotal(totalElement, retries = 5, interval = 1000) {
      const companyIdentifier = localStorage.getItem("company_identifier");
      if (companyIdentifier) {
        const encodedIdentifier = encodeURIComponent(companyIdentifier);
        const apiUrl = `https://xqsu-ttbr-nccs.n7c.xano.io/api:wXyyqNPC/members?company_identifier=${encodedIdentifier}`;
        fetch(apiUrl)
          .then((response) => response.json())
          .then((data) => processData(data, totalElement))
          .catch((error) => console.error("Error fetching data: ", error));
      } else if (retries > 0) {
        setTimeout(
          () => fetchDataAndUpdateTotal(totalElement, retries - 1, interval),
          interval
        );
      } else {
        console.error(
          "Failed to retrieve company_identifier from local storage after multiple retries."
        );
      }
    }
  
    function processData(data, totalElement) {
      const charityMap = {};
      let globalTotalDonation = 0;
  
      data.forEach((member) => {
        (member.donated_to || []).flat().forEach((charity) => {
          if (charity && charity.name && charity.amount) {
            if (!charityMap[charity.name]) {
              charityMap[charity.name] = {
                donations: [],
                totalDonation: 0,
              };
            }
            charityMap[charity.name].donations.push({
              email: member.email,
              amount: charity.amount,
            });
            charityMap[charity.name].totalDonation += charity.amount;
            globalTotalDonation += charity.amount;
          }
        });
      });
  
      totalElement.textContent = `A$${globalTotalDonation}`;
  
      if (totalElement === donationTotal2Element) {
        updateUI(charityMap);
      }
    }
  
    function updateUI(charityMap) {
      const donationInfo = document.querySelector(".donation_info");
      donationInfo.innerHTML = ""; // Clear existing content
  
      Object.entries(charityMap).forEach(([charName, charity]) => {
        const donationRow = document.createElement("div");
        donationRow.classList.add("donation_row");
  
        let userDonations = charity.donations
          .map((donation) => `${donation.email} - A$${donation.amount}`)
          .join("<br>");
  
        donationRow.innerHTML = `
                  <div class="w-node-_43e79eb5-d7f8-3e1b-b53c-e119b50d4b18-098a679a">${charName}</div>
                  <div class="w-node-_67335351-7fe0-d484-2d8d-da3573e3bb44-098a679a">${userDonations}</div>
                  <div class="donation_amount is-modal">
                      <div class="donation_total">A$${charity.totalDonation}</div>
                      <div class="dontation_text">Total amount donated</div>
                  </div>`;
  
        donationInfo.appendChild(donationRow);
      });
    }
  });
  