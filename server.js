import express from "express";
import { RateLimiterMiddleware } from "./src/middleware/rateLimiterMiddleware.js";

const app = express();

const rateLimiterMiddleware = new RateLimiterMiddleware({
    TIME_FRAME_IN_S: 10,
    RPS_LIMIT: 2
})
app.use(rateLimiterMiddleware.rateLimiter);

app.get('/', (req, res) => {
    res.send('I am here.')
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
