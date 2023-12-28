const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require("jsonwebtoken");


mongoose
    .connect("mongodb+srv://sayakbasakhack:i6Oiz9mk8qUo5NFr@cluster0.dadkmyk.mongodb.net/?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error Connecting to MongoDB");
    });

app.listen(port, () => {
    console.log("server is running on port 3000");
});

const User = require("./models/User");
const Post = require("./models/Post");

//endpoint to register a user in the backend
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        //create a new user
        const newUser = new User({ name, email, password });

        //generate and store the verification token
        newUser.verificationToken = crypto.randomBytes(20).toString("hex");

        //save the  user to the database
        await newUser.save();

        //send the verification email to the user
        sendVerificationEmail(newUser.email, newUser.verificationToken);

        res.status(200).json({ message: "Registration successful" });
    } catch (error) {
        console.log("error registering user", error);
        res.status(500).json({ message: "error registering user" });
    }
});

const sendVerificationEmail = async (email, verificationToken) => {
    //create a nodemailer transporter

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "sayakbasakhack@gmail.com",
            pass: "sqqy rjgo rpqy ailg",
        },
    });
    //compose the email message
    const mailOptions = {
        from: "threads.com",
        to: email,
        subject: "Email Verification",
        text: `please click the following link to verify your email http://localhost:19006/verify/${verificationToken}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log("error sending email", error);
    }
};

app.get("/verify/:token", async (req, res) => {
    try {
        const token = req.params.token;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(404).json({ message: "Invalid token" });
        }

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.log("error getting token", error);
        res.status(500).json({ message: "Email verification failed" });
    }
});

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");
    return secretKey;
};

const secretKey = generateSecretKey();

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Invalid email" });
        }

        if (user.password !== password) {
            return res.status(404).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user._id }, secretKey);

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});

//endpoint to access all the users except the logged in the user
app.get("/user/:userId", (req, res) => {
    try {
        const loggedInUserId = req.params.userId;


        User.find({ _id: { $ne: loggedInUserId } })
            .then((users) => {
                res.status(200).json(users);
            })
            .catch((error) => {
                console.log("Error: ", error);
                res.status(500).json("errror");
            });
    } catch (error) {
        res.status(500).json({ message: "error getting the users" });
    }
});

//endpoint to access all the users except the logged in the user
app.get("/curr/:userId", async (req, res) => {
    try {
        const loggedInUserId = req.params.userId;

        const user = await User.findOne({ _id: loggedInUserId });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "error getting the user" });
    }
});


//endpoint to create a new post in the backend
app.post("/create-post", async (req, res) => {
    try {
        const { content, userId } = req.body;

        const newPostData = {
            user: userId,
        };

        if (content) {
            newPostData.content = content;
        }

        const newPost = new Post(newPostData);

        await newPost.save();

        res.status(200).json({ message: "Post saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "post creation failed" });
    }
});


//endpoint to get all the posts
app.get("/get-posts", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res
            .status(500)
            .json({ message: "An error occurred while getting the posts" });
    }
});

app.get("/profile/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Error while getting the profile" });
    }
});