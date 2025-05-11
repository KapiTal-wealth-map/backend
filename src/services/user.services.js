const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const { FRONTEND_DEV_URL } = require('../config/env');
const sendEmail = require('../utils/sendEmail');
const FRONTEND_URL = FRONTEND_DEV_URL;

const generateInvite = async ( email, role, adminUser ) => {
  // Only allow admin to invite
  if (adminUser.role !== 'admin') throw new AppError('Only admins can invite users', 403);

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

  const inviteUrl = `${FRONTEND_URL}/accept-invite/${token}`;
  const emailSubject = 'Invitation to join Wealth Map';
  const emailText = `Click the link below to accept the invitation: ${inviteUrl}. This link will expire in 24 hours.`;
  const emailHtml = `<p>Click the link below to accept the invitation: <a href="${inviteUrl}">${inviteUrl}</a>. This link will expire in 24 hours.</p>`;
  const emailResult = await sendEmail({ to: 't.mulugur@gmail.com', subject: emailSubject, text: emailText, html: emailHtml });
  console.log('invite sent');
  return {
    success: true,
    inviteUrl,
    expiresAt,
  };
}

const acceptInvite = async ( token, empName, password ) => {

    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.status !== 'pending') throw new AppError('Invalid or expired invite token', 401);
  
    const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existingUser) throw new AppError('User already exists for this email', 400);
  
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
  
    return {
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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




module.exports = {
  generateInvite,
  acceptInvite,
  getUserProfile,
  updateUserProfile,
  getUsersInCompany,
  deactivateUser,
};
