let baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/admin";
let orderUrl = `${baseUrl}/${apiPath}/orders`;

let orderData = [];

(function () {
  getOrderList();
})();

function getOrderList() {
  axios
    .get(orderUrl, auth)
    .then((res) => {
      orderData = res.data.orders;
      // console.log(orderData);
      renderOrderList(orderData);
      renderC3(orderData);
    })
    .catch((error) => {
      console.log(error);
    });
}

const orderList = document.querySelector(".orderList");

function renderOrderList(data) {
  let str = "";
  data.forEach((item) => {
    // console.log(item);

    // 組裝時間戳(需13碼，毫秒)
    let date = new Date(item.createdAt * 1000);
    const orderTime = `
      ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

    // 組產品字串
    let productStr = "";
    item.products.forEach((productItem) => {
      productStr += `<p>${productItem.title}*${productItem.quantity}</p>`;
    });

    //判斷訂單處理狀態
    str += `
    <tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${productStr}
        </td>
        <td>${orderTime}</td>
        <td class="orderStatus">
          <a href="#" class="js-orderStatus" data-id="${item.id}">${
      item.paid ? "已處理" : "未處理"
    }</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn js-orderDel" data-id="${
            item.id
          }" value="刪除">
        </td>
    </tr>
    `;
  });
  orderList.innerHTML = str;
}

orderList.addEventListener("click", (e) => {
  e.preventDefault();
  const { id } = e.target.dataset;
  // console.log(id);
  if (e.target.classList.contains("js-orderDel")) {
    console.log("刪除項目");

    delItems(id);
  } else if (e.target.classList.contains("js-orderStatus")) {
    console.log("狀態處理");

    let paid = e.target.textContent.trim() == "未處理" ? true : false;
    changeStatus(id, paid);
  }
});

function changeStatus(orderId, status) {
  axios
    .put(
      orderUrl,
      {
        data: {
          id: orderId,
          paid: status,
        },
      },
      auth
    )
    .then((res) => {
      orderData = res.data.orders;
      renderOrderList(orderData);
    })
    .catch((error) => {
      console.log(error);
    });
}

function delItems(orderId) {
  axios
    .delete(`${orderUrl}/${orderId}`, auth)
    .then((res) => {
      orderData = res.data.orders;
      renderOrderList(orderData);
      renderC3(orderData);
    })
    .catch((error) => {
      console.log(error);
    });
}

const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  axios
    .delete(orderUrl, auth)
    .then((res) => {
      orderData = res.data.orders;
      console.log(orderData);
      renderOrderList(orderData);
      renderC3(orderData);
    })
    .catch((error) => {
      console.log(error);
    });
});
