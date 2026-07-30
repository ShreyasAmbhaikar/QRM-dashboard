'use server';

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';
import { sendEmail } from '@/lib/email/client';
import { RegisterSchema, ForgotPasswordSchema, ResetPasswordSchema } from './schemas';
import crypto from 'crypto';

interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  data?: T;
}

// Bot Prevention Turnstile Verification
async function verifyTurnstileToken(token?: string): Promise<boolean> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET;
  if (!secretKey) {
    console.warn('CLOUDFLARE_TURNSTILE_SECRET is missing. Bypassing Turnstile verification.');
    return true; // Bypass Turnstile if key is not configured in development
  }

  if (!token) return false;

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();
    return !!outcome.success;
  } catch (error) {
    console.error('Turnstile verification network error:', error);
    return false;
  }
}

// 1. User Registration Action
export async function registerUser(
  formData: any,
  turnstileToken?: string
): Promise<ActionResponse> {
  // Validate Zod schema
  const parsed = RegisterSchema.safeParse(formData);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0].toString()] = err.message;
      }
    });
    return { success: false, message: 'Validation failed', errors };
  }

  const { name, email, password } = parsed.data;

  // Bot check
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return {
      success: false,
      message: 'Bot validation failed. Please solve the Turnstile challenge again.',
    };
  }

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Account with this email already exists.',
        errors: { email: 'Email address already registered' },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user along with relations inside transaction
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.VIEWER, // Default role
          isActive: true,
        },
      });

      // Create default RBAC permissions
      await tx.userPermission.create({
        data: {
          userId: user.id,
          role: Role.VIEWER,
          customPermissions: {
            dashboard: 'read',
            clients: 'read',
            leads: 'none',
            agreements: 'none',
            gbp: 'none',
            keywords: 'none',
            competitors: 'none',
            posts: 'none',
            localGrid: 'none',
            servicePages: 'none',
            seoAudit: 'none',
            autoReplies: 'none',
            backlinks: 'none',
            tasks: 'read',
            performance: 'none',
            notifications: 'read',
            activityLog: 'none',
            settings: 'none',
          },
        },
      });

      // Create default notification preferences
      await tx.notificationPreference.create({
        data: {
          userId: user.id,
          inApp: true,
          email: true,
          dailyDigest: false,
        },
      });

      return user;
    });

    // Write audit log
    await createAuditLog({
      userId: newUser.id,
      action: 'CREATE',
      resource: 'User',
      resourceId: newUser.id,
      newData: { name: newUser.name, email: newUser.email, role: newUser.role },
    });

    return {
      success: true,
      message: 'Registration successful! You can now log in.',
    };
  } catch (error) {
    console.error('Registration server action error:', error);
    return {
      success: false,
      message: 'A database error occurred during registration. Please try again.',
    };
  }
}

// 2. Forgot Password Action
export async function forgotPassword(formData: any, turnstileToken?: string): Promise<ActionResponse> {
  const parsed = ForgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
      errors: { email: 'Invalid email address' },
    };
  }

  const { email } = parsed.data;

  // Bot check
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return {
      success: false,
      message: 'Bot validation failed. Please resolve Turnstile challenge.',
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    // Security: Do not reveal whether user exists or not, but return success
    if (!user || !user.isActive) {
      return {
        success: true,
        message: 'If the email is registered, password reset instructions have been sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Save token in VerificationToken table
    await db.verificationToken.upsert({
      where: { token },
      update: { expires },
      create: {
        identifier: email,
        token,
        expires,
      },
    });

    // Dispatch email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Reset Password — Quantum Reach Media',
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 600px; color: #1f2937;">
          <h2 style="color: #7c3aed;">Reset Your Password</h2>
          <p>You requested a password reset for your Quantum Reach Media agency account. Click the button below to configure a new password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">Reset Password</a>
          <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">If you did not request this email, you can safely ignore it.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: 'If the email is registered, password reset instructions have been sent.',
    };
  } catch (error) {
    console.error('Forgot password action error:', error);
    return {
      success: false,
      message: 'Failed to send password recovery instructions. Please try again.',
    };
  }
}

// 3. Reset Password Action
export async function resetPassword(
  token: string,
  formData: any,
  turnstileToken?: string
): Promise<ActionResponse> {
  if (!token) {
    return { success: false, message: 'Invalid or missing recovery token.' };
  }

  const parsed = ResetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0].toString()] = err.message;
      }
    });
    return { success: false, message: 'Validation failed', errors };
  }

  const { password } = parsed.data;

  // Bot check
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return {
      success: false,
      message: 'Bot validation failed. Please solve the Turnstile challenge again.',
    };
  }

  try {
    // Find validation token
    const dbToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!dbToken || dbToken.expires < new Date()) {
      return {
        success: false,
        message: 'This reset token has expired or is invalid. Please request a new link.',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and delete verification token in transaction
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: dbToken.identifier },
        data: { password: hashedPassword },
      });

      await tx.verificationToken.delete({
        where: { token },
      });
    });

    return {
      success: true,
      message: 'Password successfully updated. You can now log in.',
    };
  } catch (error) {
    console.error('Reset password action error:', error);
    return {
      success: false,
      message: 'Failed to reset password. Please request a new recovery link.',
    };
  }
}
