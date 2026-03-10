const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const PORT = 3005;

// logger -> morgan
app.use(morgan('combined')); // tiny

// limit no of requests -> ratelimit
// 20 requests per 2 minutes
const limiter = rateLimit({ windowMs: 2 * 60 * 1000, max: 200 });
app.use(limiter);

/**
 * Authenticate User Before using any services like { Booking.... }
 * Use Middleware
 */

app.use('/bookingservice', async (req, res, next) => {
    console.log(req.headers['x-access-token']);

    try {
        const response = await axios.get('http://localhost:4000/api/v1/user/isAuthenticated', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        });
        // console.log(response);
        console.log(response.data); // as per response

        /**
         * If user is authenticated then call -> next()
         */
        if(response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }
});

/**
 * After authorisation -> { It will access bookingservice }  
 * But we need to give token in headers for authorisation💁🏻‍🔐       
 */
// proxy booking service
app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true}));


app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
