const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User');
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( '../middleware/auth' );

