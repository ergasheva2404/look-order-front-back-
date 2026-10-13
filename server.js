import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import cors from "cors"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = 2424
const DATA_DIR = path.join(__dirname, "data")

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name + ".json"), "utf8"))
}
function write(name, data) {
  const file = path.join(DATA_DIR, name + ".json")
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function nextId(items, key) {
  let max = 0
  for (const item of items) {
    if (item[key] > max) max = item[key]
  }
 
 return max + 1;
}

app.use(cors())
app.use(express.json());
app.use("/img", express.static(path.join(__dirname, "public", "img")))

const ok = (res, data, status = 200) => res.status(status).json({ status, data })
const fail = (res, message, status = 400) => res.status(status).json({ status, message })

app.get("/users", (req, res) => ok(res, read("users")))

app.post("/users", (req, res) => {
  const username = String(req.body.username || "").trim()
  const telephone = String(req.body.telephone || "").trim()
  if (!username || !telephone) return fail(res, "username va telephone majburiy")

  const users = read("users")
  if (users.some((u) => u.telephone === telephone)) {
    return fail(res, "Bu telefon raqam bilan user allaqachon mavjud", 409)
  }
  const user = { userId: nextId(users, "userId"), username, telephone }
  users.push(user)
  write("users", users)
  ok(res, user, 201)
});

app.get("/foods", (req, res) => ok(res, read("foods")));

app.get("/orders/:userId", (req, res) => {
  const userId = Number(req.params.userId)
  const foods = read("foods")
  const orders = read("orders")
    .filter((o) => o.userId === userId)
    .map((o) => ({ ...o, foods: foods.filter((f) => f.foodId === o.foodId) }))
  ok(res, orders)
});

app.post("/orders", (req, res) => {
  const userId = Number(req.body.userId)
  const foodId = Number(req.body.foodId)
  const count = Number(req.body.count)

  if (!Number.isInteger(count) || count < 1) return fail(res, "count musbat butun son bo'lishi kerak")
  if (!read("users").some((u) => u.userId === userId)) return fail(res, "Bunday user topilmadi", 404)
  if (!read("foods").some((f) => f.foodId === foodId)) return fail(res, "Bunday taom topilmadi", 404)

  const orders = read("orders")
  const order = { orderId: nextId(orders, "orderId"), userId, foodId, count }
  orders.push(order)
  write("orders", orders)
  ok(res, order, 201)
});

app.get("/", (req, res) => res.send("LOOK ORDER ishlayapti"))

app.listen(PORT, () => console.log(`Server is running...`))