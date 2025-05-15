const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { FRONTEND_DEV_URL, JWT_SECRET } = require('../config/env');
const sendEmail = require('../utils/sendEmail');
const FRONTEND_URL = FRONTEND_DEV_URL;

const generateInvite = async ( email, role, adminUser ) => {
  // Only allow admin to invite
  if (adminUser.role !== 'admin') throw new AppError('Only admins can invite users', 403);
  const existingUser = await prisma.user.findUnique({ where: { email: email } });
  if (existingUser) throw new AppError('User already part of organisation', 400);
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  const invite = await prisma.invite.create({
    data: {
      email,
      role,
      token,
      companyId: adminUser.companyId,
      expiresAt,
    },
  });

  const inviteUrl = `${FRONTEND_URL}/accept-invite?token=${token}`;
  const emailSubject = 'Invitation to join Wealth Map';
  const emailText = `Click the link below to accept the invitation: ${inviteUrl}. This link will expire in 24 hours.`;
  const emailHtml = `<p>Click the link below to accept the invitation: <a href="${inviteUrl}">${inviteUrl}</a>. This link will expire in 24 hours.</p>`;
  const emailResult = await sendEmail({ to: email, subject: emailSubject, text: emailText, html: emailHtml });
  console.log('invite sent');
  return {
    success: true,
    inviteUrl,
    expiresAt,
  };
}

const acceptInvite = async ( token, empName, password ) => {
    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.status !== 'pending') throw new AppError('Invalid or expired invite token yoo', 401);
  
    const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
    console.log(existingUser)
    if (existingUser) throw new AppError('User already part of organisation', 400);
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const user = await prisma.user.create({
      data: {
        email: invite.email,
        name: empName,
        password: hashedPassword,
        role: invite.role,
        companyId: invite.companyId,
        status: 'active',
        mfaEnabled: false, // optionally prompt to set MFA later
      },
    });
  
    await prisma.invite.update({
      where: { token },
      data: { status: 'accepted' },
    });
    
    // Generate JWT token for the user
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  
    return {
      success: true,
      message: 'Account created successfully',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.companyId,
      },
    };
}

const getUserProfile = async (userId) => {
    if (!userId) throw new AppError('User ID is required', 400);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    return user;
}

const updateUserProfile = async (userId, data) => {
    if (!userId) throw new AppError('User ID is required', 400);
    const user = await prisma.user.update({ where: { id: userId }, data });
    return user;
}

const getUsersInCompany = async (companyId) => {
    if (!companyId) throw new AppError('Company ID is required', 400);
    const users = await prisma.user.findMany({ where: { companyId } });
    if (!users || users.length === 0) throw new AppError('No users found', 404);
    return users;
}

const deactivateUser = async (userId, companyId) => {
    if (!userId) throw new AppError('User ID is required', 400);
    if (!companyId) throw new AppError('Company ID is required', 400);
    await prisma.user.update({ where: { id: userId }, data: { status: 'inactive' } });
}

const updateUserRole = async (userId, role, companyId) => {
    if (!userId) throw new AppError('User ID is required', 400);
    if (!role) throw new AppError('Role is required', 400);
    if (!companyId) throw new AppError('Company ID is required', 400);
    
    // First check if the user belongs to the same company as the admin
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
    });
    
    if (!user) {
        throw new AppError('User not found', 404);
    }
    
    if (user.companyId !== companyId) {
        throw new AppError('You can only update users in your own company', 403);
    }
    
    await prisma.user.update({
        where: { id: userId },
        data: { role }
    });
}

const getCompanySettings = async (companyId) => {
  if (!companyId) throw new AppError('Company ID is required', 400);
  
  const company = await prisma.company.findUnique({ 
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      logo: true,
      dataAccessSettings: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  if (!company) throw new AppError('Company not found', 404);
  return company;
};

const updateCompanySettings = async (companyId, data) => {
  if (!companyId) throw new AppError('Company ID is required', 400);
  
  const company = await prisma.company.update({
    where: { id: companyId },
    data: data,
    select: {
      id: true,
      name: true,
      logo: true,
      dataAccessSettings: true,
      updatedAt: true
    }
  });
  
  return company;
};

const getUserNotificationPreferences = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationPreferences: true }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user.notificationPreferences;
};

const updateUserNotificationPreferences = async (userId, preferences) => {
  // Validate preferences object
  if (!preferences || typeof preferences !== 'object') {
    throw new Error('Invalid notification preferences');
  }

  // Ensure only email and inApp are present
  const validPreferences = {
    email: !!preferences.email,
    inApp: !!preferences.inApp
  };

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { notificationPreferences: validPreferences },
    select: { notificationPreferences: true }
  });

  return updatedUser.notificationPreferences;
};

module.exports = {
  generateInvite,
  acceptInvite,
  getUserProfile,
  updateUserProfile,
  getUsersInCompany,
  deactivateUser,
  updateUserRole,
  getCompanySettings,
  updateCompanySettings,
  getUserNotificationPreferences,
  updateUserNotificationPreferences
};
