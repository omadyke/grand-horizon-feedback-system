const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// ----------------------------------
// MIDDLEWARE
// ----------------------------------

app.use(cors());
app.use(express.json());

// ----------------------------------
// TEST ROUTE
// ----------------------------------

app.get("/", (req, res) => {
    res.send("✅ StayFlow Backend is running.");
});

// ----------------------------------
// REVIEW ENDPOINT
// ----------------------------------

app.post("/review", async (req, res) => {

    console.log("================================");
    console.log("Review received from frontend:");
    console.log(req.body);
    console.log("================================");

    try {

        console.log("Sending review to n8n...");

        const response = await axios.post(

            "https://species-entrench-husband.ngrok-free.dev/webhook/review-submit",

            req.body,

            {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 10000
            }

        );

        console.log("✅ n8n responded successfully!");
        console.log(response.data);

        // Return EXACTLY what n8n sends back
        res.status(200).json(response.data);

    }

    catch (error) {

        console.log("================================");
        console.log("❌ ERROR SENDING TO N8N");
        console.log("================================");

        if (error.response) {

            console.log("Status:", error.response.status);
            console.log("Response:", error.response.data);

        }

        else if (error.request) {

            console.log("No response received from n8n.");

        }

        else {

            console.log(error.message);

        }

        res.status(500).json({

            success: false,
            action: "error",
            message: "Backend could not reach n8n."

        });

    }

});

// ----------------------------------
// START SERVER
// ----------------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("================================");
    console.log(`🚀 StayFlow Backend running on port ${PORT}`);
    console.log("================================");

});