const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {v4:uuidv4}=require("uuid")
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "your_jwt_secret_key";
const MONGO_URI = "mongodb+srv://varshamurugeshan:varshamrr@cluster0.gb2dd.mongodb.net/pets";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: {type: String,required: true},
});
const User = mongoose.model("User", userSchema);

const petSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, 
  name: { type: String, required: true },
  age: { type: Number, required: true },
  breed: { type: String, required: true },
  description: { type: String, required: true },
  adopted: { type: Boolean, default: false }
});
const Pet = mongoose.model("Pet", petSchema);

const adoptionRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "Pending" },
});
const AdoptionRequest = mongoose.model("AdoptionRequest", adoptionRequestSchema);

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});
const Contact = mongoose.model("Contact", contactSchema);

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Invalid email or password" });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

app.post("/api/pets", async (req, res) => {
  try {
    const { name, age, breed, description } = req.body;
    if (!name || !age || !breed || !description) return res.status(400).json({ message: "All fields are required" });
    const newPet = new Pet({ id:uuidv4(),name, age, breed, description });
    await newPet.save();
    res.status(201).json({ message: "Pet added successfully!", pet: newPet });
  } catch (error) {
    res.status(500).json({ message: "Error adding pet", error });
  }
});

app.get("/api/pets", async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pets", error });
  }
});

app.post("/api/adopt", async (req, res) => {
  try {
    const {name, email, message } = req.body;
    if ( !name || !email || !message) return res.status(400).json({ message: "All fields are required" });
    const existingRequest = await AdoptionRequest.findOne({name,email});
    if (existingRequest) return res.status(400).json({ message: "You have already requested adoption for this pet" });
    const newRequest = new AdoptionRequest({name, email, message });
    await newRequest.save();
    res.status(201).json({ message: "Adoption request submitted!", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Error submitting request", error });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: "All fields are required" });
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ message: "Contact form submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting contact form", error });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server running..."));
