//onload function
window.onload = function () {
  fetchClientsName();
};

// variables
let fetch_client_url = "http://localhost:3000/clients";
let fetch_accountname_url = "http://localhost:3000/accounts-by-client";
let fetch_dates_url = "http://localhost:3000/msgid-by-account";
let fetch_full_msg_url = "http://localhost:3000/messages";
let pageIndex = 1;
let accountSel = "";
let accountElementsArray = [];
let timeElementsArray = [];

const resetPageIndex = function () {
  pageIndex = 1;
};

// mouseOver and mouseOut
const mouseOver = function (target) {
  target.style.backgroundColor = "#ebebeb";
};
const mouseOut = function (target) {
  if (target.className.includes("timestamp-parent")) {
    target.style.backgroundColor = "white";
  } else {
    target.style.backgroundColor = "#f6f6f6";
  }
};

const addScrollEvent = function (ele, clientName, accName) {
  ele.addEventListener("scroll", (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      // console.log("scrolled to bottom");
      pageFlag = true;
      pageIndex += 1;
      updateUIList(clientName, accName);
    }
    if (scrollTop === 0) {
      // console.log("Reached top");
    }
  });
};

const addRightArrow = function (ele) {
  ele.classList.add("fa-angle-right");
  ele.classList.remove("fa-angle-down");
};

const addDownArrow = function (ele) {
  ele.classList.add("fa-angle-down");
  ele.classList.remove("fa-angle-right");
};

//Fetch API
const fetchData = async function (url, method, headers, body) {
  return await fetch(url, {
    method: method,
    headers: headers,
    body: body,
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

// Fetch Clients Name
const fetchClientsName = async function () {
  let data = await fetchData(
    fetch_client_url,
    "POST",
    {
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
    },
    JSON.stringify({
      logged_in_user: "torontotest@avrl.io",
    })
  );
  displayClients(data.clients);
};

//display Clients
const displayClients = function (client_list) {
  let customerSection = document.querySelector(".customer-section");

  for (let i = 0; i < client_list.length; i++) {
    customerSection.innerHTML += `<div class = "customer-name-parent">
                                    <div class="customer-name" id="${client_list[i]}" onclick="fetchAccountName(this)" onmouseover="mouseOver(this)" onmouseout="mouseOut(this)">
                                      <i class="fa-regular fa-angle-right angle-right-icon" class="${client_list[i]}" ></i>
                                      <p class="customer_name_text">${client_list[i]}</p>
                                    </div>
                                  </div>`;
  }
};

// Fetch Account Name
const fetchAccountName = async function (clientElement) {
  resetPageIndex();
  let clientId = clientElement.id;
  let data = await fetchData(
    fetch_accountname_url,
    "POST",
    {
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
    },
    JSON.stringify({
      logged_in_user: "torontotest@avrl.io",
      client_name: clientId,
    })
  );
  if (accountSel && accountSel != clientElement.id) {
    document
      .getElementById(accountSel)
      .parentElement.removeChild(
        document.getElementById(accountSel).parentElement.children[1]
      );
    addRightArrow(
      document.getElementById(accountSel).parentElement.childNodes[1]
        .childNodes[1]
    );
    document.getElementById(accountSel).children[1].style.textDecoration = "";
    document.getElementById(clientElement.id).children[1].style.textDecoration =
      "underline";
    accountSel = clientElement.id;
  } else if (accountSel && accountSel == clientElement.id) {
    document.getElementById(accountSel).children[1].style.textDecoration = "";
    accountSel = "";
  } else {
    accountSel = clientElement.id;
    document.getElementById(accountSel).children[1].style.textDecoration =
      "underline";
  }

  displayAccountName(data.msg_per_account, clientElement.id);
};

//Display Accounr Name
const displayAccountName = function (accNameObj, clientName) {
  let accountNameList = Object.keys(accNameObj);
  let msgCountList = Object.values(accNameObj);
  let customerName = document.getElementById(`${clientName}`);
  let customerParent = customerName.parentElement;

  let ul_list = document.createElement("ul");
  ul_list.classList.add("account-list-style");

  for (let i = 0; i < msgCountList.length; i++) {
    ul_list.innerHTML += `<li class="customer-msg" onclick="fetchDates(this,${clientName})" id ="${accountNameList[i]}" onmouseover="mouseOver(this)" onmouseout="mouseOut(this)">
                          <h4 class="position">
                              <p class="customer_account_text" id="${accountNameList[i]}">${accountNameList[i]}</p>
                              <p class = "customer_count_text">${msgCountList[i]}</p>
                          </h4>
                        </li>`;
  }
  if (customerParent.children.length === 2) {
    customerParent.removeChild(
      customerParent.children[customerParent.children.length - 1]
    );
    addRightArrow(customerParent.childNodes[1].childNodes[1]);
  } else if (customerParent.childElementCount <= 1) {
    customerParent.appendChild(ul_list);
    addDownArrow(customerParent.childNodes[1].childNodes[1]);
  }
};

//Fetch Dates
const fetchDates = async function (accNameEle, clientNameElement) {
  accountElementsArray.push(accNameEle);
  if (accountElementsArray[accountElementsArray.length - 2]) {
    accountElementsArray[
      accountElementsArray.length - 1
    ].style.backgroundColor = "#cde4fc";
    accountElementsArray[accountElementsArray.length - 1].removeAttribute(
      "onmouseover"
    );
    accountElementsArray[accountElementsArray.length - 1].removeAttribute(
      "onmouseout"
    );
    accountElementsArray[
      accountElementsArray.length - 2
    ].style.backgroundColor = "#f6f6f6";
    accountElementsArray[accountElementsArray.length - 2].setAttribute(
      "onmouseover",
      "mouseOver(this)"
    );
    accountElementsArray[accountElementsArray.length - 2].setAttribute(
      "onmouseout",
      "mouseOut(this)"
    );
  } else {
    accNameEle.style.backgroundColor = "#cde4fc";
    accNameEle.removeAttribute("onmouseover");
    accNameEle.removeAttribute("onmouseout");
  }
  resetPageIndex();
  let data = await fetchData(
    fetch_dates_url,
    "POST",
    {
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
    },
    JSON.stringify({
      logged_in_user: "torontotest@avrl.io",
      client_name: clientNameElement.id,
      account_name: accNameEle.id,
      page_index: pageIndex,
    })
  );

  if (Object.keys(JSON.parse(data.msg_ids)).length > 0) {
    
    displayDates(data.msg_ids, accNameEle.id, clientNameElement.id);
  } else {
    console.log("Stop - Length is 0");
  }
};

//Display Dates
const displayDates = function (dateObj, accName, clientName) {
  let obj = JSON.parse(dateObj);
  let date = Object.keys(obj)[0];

  let DateSection = document.querySelector(".dates-section");

  DateSection.innerHTML = "";
  DateSection.innerHTML += `<div class="account-date-section">${accName}</div>`;
  DateSection.innerHTML += `<div class = "date-section-parent" style="height: calc( 100% - 48.4px);">
                                <div class="date-list"  id="${date}" onmouseover="mouseOver(this)" onmouseout="mouseOut(this)">
                                    <i class="fa-regular fa-angle-right angle-right-icon" class="${date}" ></i>
                                    <p class="date-text">${date}</p>
                                </div>
                            </div>`;
  document.querySelector(".date-list").addEventListener("click", function () {
    displaytimes(JSON.parse(dateObj), date, accName, clientName);
  });
};

//Display Times
const displaytimes = function (dateObj, dateSel, accName, clientName) {
  let ul_list = document.createElement("ul");
  let ul_list_div = document.createElement("div");
  ul_list_div.classList.add("date-scroll");
  ul_list.classList.add("time-list-style");

  let dateParent = document.querySelector(".date-section-parent");

  for (let keys in dateObj[dateSel]) {
    let node = document.createElement("li");
    node.style.listStyleType = "none";
    node.classList.add("timestamp-parent");

    let p = document.createElement("p");
    p.classList.add("time-position");
    node.setAttribute("onmouseover", "mouseOver(this)");
    node.setAttribute("onmouseout", "mouseOut(this)");
    let fontWeightText = dateObj[dateSel][keys]["is_read"] ? "bold" : "normal";

    p.classList.add(`${dateObj[dateSel][keys]["is_read"]}`);
    p.setAttribute("id", `timelist-${dateObj[dateSel][keys]["timestamp"]}`);
    p.innerHTML = `<p class="rg-color" style="background-color: ${dateObj[dateSel][keys]["rgb_color"]};"></p><i class="fa-light fa-truck-fast date-icon"></i><p class="timestamp"  style="font-weight: ${fontWeightText};" id="${dateObj[dateSel][keys]["msg_id"]}">${dateObj[dateSel][keys]["timestamp"]}</p>`;
    node.appendChild(p);
    ul_list.appendChild(node);
    node.addEventListener("click", function () {
      fetchFullMessage(
        this,
        dateObj[dateSel][keys]["msg_id"],
        accName,
        clientName
      );
    });
    ul_list_div.appendChild(ul_list);
  }

  if (dateParent.childElementCount === 2) {
    dateParent.removeChild(dateParent.children[dateParent.children.length - 1]);
    resetPageIndex();
    addRightArrow(dateParent.childNodes[1].childNodes[1]);
  } else if (dateParent.childElementCount <= 1) {
    dateParent.appendChild(ul_list_div);
    addScrollEvent(document.querySelector(".date-scroll"), clientName, accName);
    addDownArrow(dateParent.childNodes[1].childNodes[1]);
  }
};

const fetchFullMessage = async function (
  timeListEle,
  msg_id,
  accName,
  clientName
) {
  timeElementsArray.push(timeListEle);
  if (timeElementsArray[timeElementsArray.length - 2]) {
    timeElementsArray[timeElementsArray.length - 1].style.backgroundColor =
      "#cde4fc";
    timeElementsArray[timeElementsArray.length - 1].removeAttribute(
      "onmouseover"
    );
    timeElementsArray[timeElementsArray.length - 1].removeAttribute(
      "onmouseout"
    );
    timeElementsArray[timeElementsArray.length - 2].style.backgroundColor =
      "white";
    timeElementsArray[timeElementsArray.length - 2].setAttribute(
      "onmouseover",
      "mouseOver(this)"
    );
    timeElementsArray[timeElementsArray.length - 2].setAttribute(
      "onmouseout",
      "mouseOut(this)"
    );
  } else {
    timeListEle.removeAttribute("onmouseover");
    timeListEle.removeAttribute("onmouseout");
    timeListEle.style.backgroundColor = "#cde4fc";
  }

  document.getElementById(msg_id).style.fontWeight = "";

  let data = await fetchData(
    fetch_full_msg_url,
    "POST",
    {
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
    },
    JSON.stringify({
      msg_id: msg_id,
      client_name: clientName,
      account_name: accName,
    })
  );
  displayFullMsg(data.message);
};

const displayFullMsg = function (message) {
  let detailSection = document.querySelector(".details-section");
  detailSection.style.display = "block";
  detailSection.innerHTML = "";
  detailSection.innerHTML = message;
};

const updateUIList = async function (clientName, AccName) {
  let data = await fetchData(
    fetch_dates_url,
    "POST",
    {
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
    },
    JSON.stringify({
      logged_in_user: "torontotest@avrl.io",
      client_name: clientName,
      account_name: AccName,
      page_index: pageIndex,
    })
  );

  if (Object.keys(JSON.parse(data.msg_ids)).length > 0) {
    console.log("Wal");
    let dateObj = JSON.parse(data.msg_ids);
    let dateSel = Object.keys(dateObj)[0];

    let ul_list = document.querySelector(".time-list-style");
    let ul_list_div = document.querySelector(".date-scroll");
    let dateParent = document.querySelector(".date-section-parent");

    for (let keys in dateObj[dateSel]) {
      if (dateObj[dateSel] !== undefined) {
        let node = document.createElement("li");
        node.style.listStyleType = "none";
        node.classList.add("timestamp-parent");

        let p = document.createElement("p");
        p.classList.add("time-position");
        node.setAttribute("onmouseover", "mouseOver(this)");
        node.setAttribute("onmouseout", "mouseOut(this)");

        let fontWeightText = dateObj[dateSel][keys]["is_read"]
          ? "bold"
          : "normal";

        p.classList.add(`${dateObj[dateSel][keys]["is_read"]}`);
        p.setAttribute("id", `timelist-${dateObj[dateSel][keys]["timestamp"]}`);
        p.innerHTML = `<p class="rg-color" style="background-color: ${dateObj[dateSel][keys]["rgb_color"]};"></p><i class="fa-light fa-truck-fast date-icon"></i><p class="timestamp"  style="font-weight: ${fontWeightText};" id="${dateObj[dateSel][keys]["msg_id"]}">${dateObj[dateSel][keys]["timestamp"]}</p>`;
        node.appendChild(p);
        ul_list.appendChild(node);
        node.addEventListener("click", function () {
          fetchFullMessage(
            dateObj[dateSel][keys]["msg_id"],
            accName,
            clientName
          );
        });
        ul_list_div.appendChild(ul_list);
      }
    }
    dateParent.appendChild(ul_list_div);

    document.querySelector(".date-scroll").scrollTop =
      document.querySelector(".date-scroll").scrollHeight;
    document.querySelector(".date-scroll").scrollTop -=
      document.querySelector(".date-scroll").clientHeight * 10;
      
  } else {
    console.log("Stop - Length is 0");
  }
};
