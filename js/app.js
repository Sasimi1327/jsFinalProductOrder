const baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/customer";

const productUrl = `${baseUrl}/${apiPath}/products`;
const cartUrl = `${baseUrl}/${apiPath}/carts`;
const orderUrl = `${baseUrl}/${apiPath}/orders`;

let productData = [];
let cartData = {};

(function init() {
  getProductList();
  getCartList();
})();

//取得產品列表
function getProductList() {
  axios
    .get(productUrl)
    .then((res) => {
      productData = res.data.products;
      // console.log(showProduct);
      renderSelectHandler(productData);
      renderProductList(productData);
    })
    .catch((error) => {
      console.log(error);
    });
}

//篩選商品下拉選單
const productSelect = document.querySelector(".productSelect");
function renderSelectHandler(products) {
  let unSort = products.map((item) => item.category);
  let items = [...new Set(unSort)];
  // console.log(items);

  let str = `<option value="全部" selected>全部</option>`;
  items.forEach((item) => {
    str += `<option value="${item}">${item}</option>`;
  });
  productSelect.innerHTML = str;
}

productSelect.addEventListener("change", selectChangeHandler);
function selectChangeHandler(e) {
  let showProduct = [];
  const currentSelect = e.target.value;

  if (currentSelect == "全部") {
    showProduct = productData;
  } else {
    showProduct = productData.filter((item) => {
      return item.category == currentSelect;
    });
  }
  renderProductList(showProduct);
}

// 渲染產品列表
const productList = document.querySelector(".productWrap");
function renderProductList(data) {
  let str = "";
  data.forEach((item) => {
    str += `
    <li class="productCard" data-product-id="${item.id}">
      <h4 class="productType">${item.category}</h4>
      <img src="${item.images}" alt="">
      <a href="#" class="addCardBtn">加入購物車</a>
      <h3>${item.title}</h3>
      <del class="originPrice">NT$${thousands(item.origin_price)}</del>
      <p class="nowPrice">NT$${thousands(item.price)}</p>
    </li>
    `;
  });
  productList.innerHTML = str;
}

// 加入購物車
productList.addEventListener("click", addToCart);
function addToCart(e) {
  if (e.target.classList.contains("addCardBtn")) {
    e.preventDefault();
    let { productId } = e.target.closest("li").dataset;
    // console.log(productId);
    let quantity = cartData[productId] ? cartData[productId].quantity : 0;

    axios
      .post(cartUrl, {
        data: {
          productId: productId,
          quantity: ++quantity,
        },
      })
      .then((res) => {
        let data = res.data.carts;
        storeData(data);
        renderCartList(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

// 取得購物車列表
function getCartList() {
  axios
    .get(cartUrl)
    .then((res) => {
      let data = res.data.carts;
      // console.log(res.data);
      storeData(data);
      renderCartList(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

// 儲存購物車資料( productId, cartId, quantity )
function storeData(data) {
  cartData = {};
  if (data.length == 0) {
    return;
  }
  data.forEach((item) => {
    cartData[item.product.id] = {
      quantity: item.quantity,
      cartId: item.id,
    };
  });
}

// 渲染購物車列表
const shoppingCartList = document.querySelector(".shoppingCartList");
const totalDollar = document.querySelector(".total");
function renderCartList(data) {
  let total = 0;
  if (data.length == 0) {
    totalDollar.textContent = 0;
    shoppingCartList.innerHTML = "";
    return;
  }

  let str = "";

  data.forEach((item) => {
    // console.log(item);
    total += item.product.price * item.quantity;

    str += `
    <tr>
      <td>
        <div class="cardItem-title">
            <img src="${item.product.images}" alt="${item.product.title}">
            <p>${item.product.title}</p>
        </div>
      </td>
      <td>NT$${thousands(item.product.price)}</td>
      <td>${item.quantity}</td>
      <td>NT$${thousands(item.product.price * item.quantity)}</td>
      <td class="discardBtn">
        <a href="#" class="material-icons delete" data-cart-id="${item.id}">
            clear
        </a>
      </td>
    </tr>
    `;
  });

  totalDollar.textContent = `NT$${thousands(total)}`;
  shoppingCartList.innerHTML = str;
}

//刪除購物車內特定產品 及 刪除全部
shoppingCartList.addEventListener("click", delItem);
function delItem(e) {
  if (e.target.classList.contains("delete")) {
    console.log("刪除特定產品");
    e.preventDefault();
    const { cartId } = e.target.dataset;
    const delUrl = `${cartUrl}/${cartId}`;

    axios
      .delete(delUrl)
      .then((res) => {
        let data = res.data.carts;
        console.log(data);
        storeData(data);
        renderCartList(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("全部刪除");

  if (Object.keys(cartData).length == 0) {
    return;
  }

  axios
    .delete(cartUrl)
    .then((res) => {
      if (res.data.carts.length == 0) {
        storeData(res.data.carts);
        console.log(res.data.carts);

        totalDollar.textContent = 0;
        shoppingCartList.innerHTML = "";
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

//表單填寫 validate
const submitForm = document.querySelector(".orderInfo-form");
const messages = document.querySelectorAll("[data-message]");

let constraints = {
  姓名: {
    presence: {
      message: "必填",
    },
  },
  電話: {
    presence: {
      message: "必填",
    },
    length: {
      minimum: 8,
      message: "號碼需超過 8 碼",
    },
  },
  Email: {
    presence: {
      message: "必填",
    },
    email: {
      message: "格式有誤",
    },
  },
  寄送地址: {
    presence: {
      message: "必填",
    },
  },
};

//form submit 驗證
submitForm.addEventListener("submit", formSubmitHandler);
function formSubmitHandler(e) {
  e.preventDefault();
  let errors = validate(submitForm, constraints);

  if (errors) {
    console.log(errors);
    showError(errors);
  } else {
    // all good
    if (Object.keys(cartData).length !== 0) {
      addOrders();
    } else {
      console.log("購物車沒有值，無法送出訂單");
    }
  }
}
function showError(errors) {
  messages.forEach((item) => {
    item.textContent = "";
    item.textContent = errors[item.dataset.message];
  });
}

//欄位值變換驗證
let inputs = document.querySelectorAll(
  "input[type='text'], input[type='tel'], input[type='email']"
);
inputs.forEach((item) => {
  item.addEventListener("change", (e) => {
    e.preventDefault();
    let errors = validate(submitForm, constraints);
    item.nextElementSibling.textContent = "";

    let targetName = item.name;

    if (errors) {
      document.querySelector(`[data-message="${targetName}"]`).textContent =
        errors[targetName];
    }
  });
});

// 送出訂單
const addOrders = () => {
  let param = {
    data: {
      user: {
        name: document.querySelector("#customerName").value.trim(),
        tel: document.querySelector("#customerPhone").value.trim(),
        email: document.querySelector("#customerEmail").value.trim(),
        address: document.querySelector("#customerAddress").value.trim(),
        payment: document.querySelector("#tradeWay").value.trim(),
      },
    },
  };

  axios
    .post(orderUrl, param)
    .then((res) => {
      console.log(res.data);
      param = {};
      getCartList();
      submitForm.reset();
    })
    .catch((error) => {
      console.log(error);
    });
};

// utility js
function thousands(value) {
  if (value) {
    value += "";
    var arr = value.split(".");
    var re = /(\d{1,3})(?=(\d{3})+$)/g;

    return arr[0].replace(re, "$1,") + (arr.length == 2 ? "." + arr[1] : "");
  } else {
    return "";
  }
}
