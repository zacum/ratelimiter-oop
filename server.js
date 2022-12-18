import express from "express";

const app = express();


app.get('/', (req, res) => {
    res.send('I am here.')
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
