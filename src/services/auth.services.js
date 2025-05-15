const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const prisma = require('../config/db');
const { JWT_SECRET, MFA_ISSUER } = require('../config/env');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');
const redisClient = require('../utils/redis');

// register a new company and admin user
const registerCompany = async (companyName, email, password, name, logoUrl = null) => {
  // check if all fields are provided
  if (!companyName || !email || !password || !name) throw new AppError('All fields are required', 400);

  // check if email is already used
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('Email is already registered', 400);

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create new company for the admin
  const company = await prisma.company.create({
    data: {
      name: companyName,
      logo: logoUrl // Store the logo URL from Supabase
    },
  });

  // create admin user, set mfa to false, link to the company
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'admin',
      mfaEnabled: false,
      companyId: company.id,
      status: 'active',
      mfaSecret: null, // No MFA secret yet
    },
  });

  return {
    success: true,
    message: 'Registration successful',
    company: {
      id: company.id,
      name: company.name
    }
  };
}

// login a user (admin or company employee)
const login = async (email, password ) => {
  // check if all fields are provided
  if (!email || !password) throw new AppError('All fields are required', 400);

  // check if user exists
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  // check if user is active
  if (user.status !== 'active') throw new AppError('User not active', 401);

  // check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  // check if mfa is enabled, if so then in frontend prompt user to enter mfa code / scan qr code if first time setup
  if (user.mfaEnabled) {
    return { requireMFA: true, email };
  }

  // generate jwt token direcctly if mfa is not enabled
  const token = generateJWT(user);
  return {
    token,
    user: formatUser(user),
    requireMFA: false,
  };
}
  
// verify mfa code this is called when user has already setup mfa and after logging in
// user will be prompted to enter mfa code from authenticator app in frontend
const verifyMfaCode = async ( email, code ) => {
  // check if all fields are provided
  if (!email || !code) throw new AppError('All fields are required', 400);

  // check if user exists and mfa is setup
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.mfaSecret) throw new AppError('MFA not setup', 401);

  // verify mfa code
  const isValid = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: code,
    window: 1,
  });

  // if mfa code is not valid, throw error
  if (!isValid) throw new AppError('Invalid MFA code', 401);

  // else update user mfaEnabled to true and generate jwt token indicated logged in successfully
  await prisma.user.update({
    where: { email },
    data: { mfaEnabled: true },
  });

  const token = generateJWT(user);
  return {
    token,
    user: formatUser(user),
  };
}

// setup mfa for a user
const setupMfa = async (userId) => {
  // check if all fields are provided
  if (!userId) throw new AppError('All fields are required', 400);

  // check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  // generate mfa secret
  const secret = speakeasy.generateSecret({ name: `${MFA_ISSUER} (${user.email})` });

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret: secret.base32,
    },
  });

  // generate qr code url, in frontend this will be rendered as a qr code image which user can scan using authenticator app
  const otpauthUrl = secret.otpauth_url;
  const qrCode = await qrcode.toDataURL(otpauthUrl);

  return {
    mfaSecret: secret.base32,
    mfaQrCode: qrCode,
  };
}

// email based OTP as fallback for mfa
const sendEmailOtp = async (email) => {
  // check if email is provided
  if (!email) throw new AppError('Email is required', 400);

  // check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);

  // check if user is active
  if (user.status !== 'active') throw new AppError('User not active', 401);

  // generate otp
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `otp:${email}`;
  // await redisClient.set(key, otp, 'EX', 60); // 60 seconds
  // console.log('redis otp set');

  // send otp to user email
  const emailSubject = 'Wealth Map - OTP for MFA';
  const emailText = `Your OTP is ${otp}, expires in 60 seconds`;
  const emailHtml = `<p>Your OTP is ${otp}, expires in 60 seconds</p>`;

  // send email
  console.log('sending email');
  const emailResult = await sendEmail({ to: email, subject: emailSubject, text: emailText, html: emailHtml });
  return { success: true, message: 'Email sent successfully' };
}

// verify email otp
const verifyEmailOtp = async (email, otp) => {
  // check if all fields are provided
  if (!email || !otp) throw new AppError('All fields are required', 400);

  // // check if user exists
  // const user = await prisma.user.findUnique({ where: { email } });
  // if (!user) throw new AppError('User not found', 404);

  // // check if user is active
  // if (user.status !== 'active') throw new AppError('User not active', 401);

  // check if otp is valid
  const key = `otp:${email}`;
  // const storedOtp = await redisClient.get(key);
  const storedOtp = '123456';
  console.log('stored otp', storedOtp);
  
  if (!storedOtp) throw new AppError('Invalid OTP', 401);

  // check if otp is correct
  if (storedOtp !== otp) throw new AppError('Invalid OTP', 401);

  // delete otp from redis
  // await redisClient.del(key);

  // generate jwt token
  // const token = generateJWT(user);

  return {
    success: true,
    message: 'OTP verified successfully',
    // token,
    // user: formatUser(user),
  };
}

const logout = async (token) => {
  // TODO: implement logout logic
  return { success: true, message: 'Logged out successfully' };
}

// generate jwt token
// TODO: shift to utils
const generateJWT = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// format user helper function
const formatUser = (user) => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    company: user.companyId,
  };
}

// verify jwt token
// TODO: shift to utils
const verifyJWT = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user || user.status !== 'active') {
      throw new Error('Invalid token');
    }
    return {
      user: formatUser(user),
      decoded
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = {
  registerCompany,
  login,
  verifyMfaCode,
  setupMfa,
  logout,
  verifyJWT,
  sendEmailOtp,
  verifyEmailOtp,
};