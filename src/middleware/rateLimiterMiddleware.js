import NodeCache from "node-cache";
import { isIPv6 } from "is-ip";
import { getClientIp } from "request-ip";

export class RateLimiterMiddleware {
    constructor(arg) {
        this.MS_TO_S = 1 / 1000
        this.TIME_FRAME_IN_S = arg.TIME_FRAME_IN_S
        this.TIME_FRAME_IN_MS = arg.TIME_FRAME_IN_S * 1000
        this.RPS_LIMIT = arg.RPS_LIMIT
        this.IPCache = new NodeCache({ stdTTL: this.TIME_FRAME_IN_S, deleteOnExpire: false, checkperiod: this.TIME_FRAME_IN_S })
        this.IPCache.on('expired', (key, value) => {
            if (Date.now() - value[value.length - 1] > this.TIME_FRAME_IN_MS) {
                this.IPCache.del(key)
            }
            else {
                const updateValue = value.filter((val) => {
                    return Date.now() - val < this.TIME_FRAME_IN_MS
                })
                this.IPCache.set(key, updateValue, this.TIME_FRAME_IN_S - (Date.now() - updateValue[0]) * this.MS_TO_S)
            }
        })
    }
    rateLimiter = (req, res, next) => {
        let clientIP = getClientIp(req)
        if (isIPv6(clientIP)) {
            clientIP = clientIP.split(':').splice(0, 4).join(':') + '::/64'
        }
        this.updateCache(clientIP)
        const IPArray = this.IPCache.get(clientIP)
        if (IPArray.length > 1) {
            const rps = IPArray.length / ((IPArray[IPArray.length - 1] - IPArray[0]) * this.MS_TO_S)
            if (rps > this.RPS_LIMIT) {
                const timeToWait = Math.ceil((IPArray.length + 1) / this.RPS_LIMIT / this.MS_TO_S) + IPArray[0] - Date.now()
                res.setHeader('Content-Type', 'text/html')
                res.setHeader('Retry-After', timeToWait)
                res.status(429).send(`You are hitting the limit. Please try after ${timeToWait} miliseconds.`)
            }
            else next()
        }
        else next()
    }
    updateCache = (ip) => {
        let IPArray = this.IPCache.get(ip) || []
        IPArray.push(Date.now())
        this.IPCache.set(ip, IPArray, (this.IPCache.getTtl(ip) - Date.now()) * this.MS_TO_S || this.TIME_FRAME_IN_S)
    }

}
