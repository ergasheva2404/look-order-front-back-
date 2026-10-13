const BASE_URL = "http://localhost:2424";

const customersList = document.querySelector(".customers-list");
const ordersList = document.querySelector(".orders-list");
const foodsSelect = document.querySelector("#foodsSelect");
const userAdd = document.querySelector("#userAdd");
const usernameInput = document.querySelector("#usernameInput");
const telephoneInput = document.querySelector("#telephoneInput");
const foodsForm = document.querySelector("#foodsForm");
const foodsCount = document.querySelector("#foodsCount");
const clientId = document.querySelector("#clientId");
const userHeader = document.querySelector("#userHeader");

let currentUserId = null;

async function getClients() {
  let response = await axios.get(`${BASE_URL}/users`);
  let users = response.data.data;

  customersList.innerHTML = "";
  for (const user of users) {
    customersList.innerHTML += `
      <li class="customer-item" data-id="${user.userId}" data-name="${user.username}">
        <span class="customer-name">${user.username}</span>
        <a class="customer-phone" href="tel:${user.telephone}">${user.telephone}</a>
      </li>
    `;
  }

  if (currentUserId === null && users.length > 0) {
    selectUser(users[0].userId, users[0].username);
  }
}

async function addClient(username, telephone) {
  await axios.post(`${BASE_URL}/users`, {
    username: username,
    telephone: telephone,
  });
  getClients();
}

function selectUser(id, name) {
  currentUserId = id;
  clientId.textContent = id;
  userHeader.textContent = name;
  getOrders(id);
}

async function selectFoods() {
  let response = await axios.get(`${BASE_URL}/foods`);
  let foods = response.data.data;

  foodsSelect.innerHTML = "";
  for (const food of foods) {
    foodsSelect.innerHTML += `
      <option value="${food.foodId}">${food.food_name}</option>
    `;
  }
}


async function getOrders(userId) {
  let response = await axios.get(`${BASE_URL}/orders/${userId}`);
  let orders = response.data.data;

  ordersList.innerHTML = "";
  for (const order of orders) {
    let food = order.foods[0];
    ordersList.innerHTML += `
      <li class="order-item">
        <img src="${BASE_URL}${food.food_img}" alt="${food.food_name}">
        <div>
          <span class="order-name">${food.food_name}</span>
          <span class="order-count">${order.count}</span>
        </div>
      </li>
    `;
  }
}

async function addOrder(userId, foodId, count) {
  await axios.post(`${BASE_URL}/orders`, {
    userId: userId,
    foodId: foodId,
    count: count,
  });
  getOrders(userId);
}

customersList.addEventListener("click", (e) => {
  let item = e.target.closest(".customer-item");
  if (item) {
    selectUser(Number(item.dataset.id), item.dataset.name);
  }
});

userAdd.addEventListener("submit", (e) => {
  e.preventDefault();
  addClient(usernameInput.value, telephoneInput.value);
  userAdd.reset();
});

foodsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addOrder(currentUserId, Number(foodsSelect.value), Number(foodsCount.value));
  foodsCount.value = "";
});

getClients();
selectFoods();