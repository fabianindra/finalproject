import { hash, genSalt } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import {
  repoAddTenant,
  repoAddUser,
  repoFindTenant,
  repoFindUser,
  repoTenantCompletePassword,
  repoUserCompletePassword,
} from '../repository/auth.repository';

type User = {
  id: number;
  email: string;
  username: string;
  password: string;
};

type Tenant = {
  id: number;
  email: string;
  username: string;
  password: string;
};
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const hashPassword = async (password: string): Promise<string> => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

const createToken = (
  payload: object,
  secret: string,
  expiresIn: string,
): string => {
  return sign(payload, secret, { expiresIn });
};

const createTransporter = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await new Promise<string>((resolve, reject) => {
    oauth2Client.getAccessToken((err: any, token: any) => {
      if (err) {
        reject(err);
      }
      resolve(token as string);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  } as nodemailer.TransportOptions);
  return transporter;
};

const sendEmail = async (emailOptions: any) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};

const registerEntity = async (request: User | Tenant, repoFind: Function, repoAdd: Function, role:string) => {
  try {
    const existingEntity = await repoFind(request.email);

    if (existingEntity) {
      return {
        status: 401,
        success: false,
        message: 'Email already registered',
      };
    }
    await repoAdd(request.email);
    const verificationToken = createToken(
      { email: request.email },
      'verificationKey',
      '1h',
    );
    await sendEmail({
      subject: 'Email Verification',
      text: `Please verify your email by clicking the link: ${BACKEND_URL}/auth/verify-email?token=${verificationToken}&role=${role} 
      if the link expired, you can ask for a new link here: ${FRONTEND_URL}/re-register?role=${role}`,
      to: request.email,
      from: process.env.EMAIL,
    });
    return {
      status: 201,
      success: true,
      message: 'Register successfully. Please check your email to verify your account.',
      data: request,
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    };
  }
};

export const serviceReRegister = async (request: { email: string, role: string }) => {
  try {
    let existingEntity;
    if (request.role === 'user') {
      existingEntity = await repoFindUser(request.email);
    } else if (request.role === 'tenant') {
      existingEntity = await repoFindTenant(request.email);
    } else {
      return {
        status: 400,
        success: false,
        message: 'Invalid role specified',
      };
    }
    if (!existingEntity) {
      return {
        status: 404,
        success: false,
        message: 'Email not found',
      };
    }
    const verificationToken = createToken(
      { email: request.email, role: request.role },
      'verificationKey',
      '1h',
    );
    await sendEmail({
      subject: 'Resend Email Verification',
      text: `Please verify your email by clicking the link: ${BACKEND_URL}/auth/verify-email?token=${verificationToken}&role=${request.role} 
      if the link expired, you can ask for a new link here: ${FRONTEND_URL}/re-register?role=${request.role}`,
      to: request.email,
      from: process.env.EMAIL,
    });
    return {
      status: 200,
      success: true,
      message: 'Verification email resent successfully. Please check your email.',
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    };
  }
};

export const serviceRegisterUser = async (request: User) => {
  return registerEntity(request, repoFindUser, repoAddUser, 'user');
};

export const serviceRegisterTenant = async (request: Tenant) => {
  return registerEntity(request, repoFindTenant, repoAddTenant, 'tenant');
};

export const serviceCompleteRegistrationUser = async (data: {
  email: string;
  username: string;
  password: string;
}) => {
  try {
    const user = await repoFindUser(data.email);
    if (!user || user.verified === false) {
      return {
        status: 400,
        success: false,
        message: 'Email not verified or user not found',
      };
    }
    const hashedPassword = await hashPassword(data.password);
    await repoUserCompletePassword(data.email, data.username, hashedPassword);
    return {
      status: 200,
      success: true,
      message: 'Registration completed successfully',
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: 'Server error',
    };
  }
};

export const serviceCompleteRegistrationTenant = async (data: {
  email: string;
  username: string;
  password: string;
}) => {
  try {
    const user = await repoFindTenant(data.email);
    if (!user || user.verified === false) {
      return {
        status: 400,
        success: false,
        message: 'Email not verified or user not found',
      };
    }
    const hashedPassword = await hashPassword(data.password);
    await repoTenantCompletePassword(data.email, data.username, hashedPassword);
    return {
      status: 200,
      success: true,
      message: 'Registration completed successfully',
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: 'Server error',
    };
  }
};
