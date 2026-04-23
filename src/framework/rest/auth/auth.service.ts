import { CoreApi } from '@framework/utils/core-api';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { sdk } from '@lib/medusa';
import Cookies from 'js-cookie';
import { AUTH_TOKEN } from '@lib/constants';

export type LoginInputType = {
  email: string;
  password: string;
};
export type RegisterUserInputType = {
  name: string;
  email: string;
  password: string;
};

export type ChangePasswordInputType = {
  oldPassword: string;
  newPassword: string;
};
export type ForgetPasswordInputType = {
  email: string;
};
export type ResetPasswordInputType = {
  email: string;
  token: string;
  password: string;
};
export type VerifyPasswordInputType = {
  email: string;
  token: string;
};
export type SocialLoginInputType = {
  provider: string;
  access_token: string;
};
export type SendOtpCodeInputType = {
  phone_number: string;
};
export type VerifyOtpInputType = {
  phone_number: string;
  code: string;
  otp_id: string;
};
export type OtpLoginInputType = {
  phone_number: string;
  code: string;
  otp_id: string;
  name?: string;
  email?: string;
};
export type UpdateContactInput = {
  phone_number: string;
  code: string;
  otp_id: string;
  user_id: string;
};

function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  Cookies.set(AUTH_TOKEN, token, { expires: 30, sameSite: 'lax' });
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  Cookies.remove(AUTH_TOKEN);
}

function splitName(fullName: string | undefined): { first_name: string; last_name?: string } {
  const n = (fullName ?? '').trim();
  if (!n) return { first_name: '' };
  const parts = n.split(/\s+/);
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') || undefined };
}

/**
 * ChawkBazar's Auth service wrapped around Medusa's JS SDK. Each method
 * returns the shape ChawkBazar's hooks/components expect (`{token, permissions}`
 * for login/register, simple `{message}` for password flows, etc.). OTP and
 * social login remain stubbed — Medusa doesn't provide them out of the box.
 */
class Auth extends CoreApi {
  async login(input: LoginInputType) {
    const token = await sdk.auth.login('customer', 'emailpass', {
      email: input.email,
      password: input.password,
    });
    if (typeof token !== 'string') {
      throw new Error('Login requires additional verification');
    }
    setAuthCookie(token);
    return { token, permissions: ['customer'] };
  }

  async register(input: RegisterUserInputType) {
    const { first_name, last_name } = splitName(input.name);

    // 1) Register the auth identity (returns token bound to identity)
    const token = await sdk.auth.register('customer', 'emailpass', {
      email: input.email,
      password: input.password,
    });
    if (typeof token !== 'string') {
      throw new Error('Unexpected registration response');
    }
    setAuthCookie(token);

    // 2) Create the customer profile using that token
    await sdk.store.customer.create(
      {
        email: input.email,
        first_name,
        last_name,
      },
      {},
      { authorization: `Bearer ${token}` }
    );

    // 3) Re-login to get a properly-scoped customer session token
    try {
      const loginToken = await sdk.auth.login('customer', 'emailpass', {
        email: input.email,
        password: input.password,
      });
      if (typeof loginToken === 'string') setAuthCookie(loginToken);
    } catch {
      /* ignore; the registration token is still usable */
    }

    return { token, permissions: ['customer'] };
  }

  async logout() {
    try {
      await sdk.auth.logout();
    } catch {
      /* no-op */
    }
    clearAuthCookie();
    return { success: true };
  }

  async changePassword(input: ChangePasswordInputType) {
    // Medusa stores customer password via the auth identity; for simplicity
    // rely on the reset flow. Surface a helpful message here.
    return {
      success: false,
      message:
        'Direct password change is not supported. Use "Forgot password" to reset.',
    };
  }

  async forgetPassword(input: ForgetPasswordInputType) {
    try {
      await sdk.auth.resetPassword('customer', 'emailpass', {
        identifier: input.email,
      });
      return { success: true, message: 'Password reset email sent.' };
    } catch (e: any) {
      return { success: false, message: e?.message ?? 'Reset failed' };
    }
  }

  async verifyForgetPassword(_input: VerifyPasswordInputType) {
    return { success: true };
  }

  async resetPassword(input: ResetPasswordInputType) {
    try {
      await sdk.auth.updateProvider(
        'customer',
        'emailpass',
        { password: input.password },
        input.token
      );
      return { success: true, message: 'Password reset successful.' };
    } catch (e: any) {
      return { success: false, message: e?.message ?? 'Reset failed' };
    }
  }

  async socialLogin(_input: SocialLoginInputType) {
    return { token: null, message: 'social-login-disabled' };
  }

  async sendOtpCode(_input: SendOtpCodeInputType) {
    return { id: '', message: 'otp-disabled', phone_number: '' };
  }

  async verifyOtpCode(_input: VerifyOtpInputType) {
    return { success: false, message: 'otp-disabled' };
  }

  async otpLogin(_input: OtpLoginInputType) {
    return { token: null, message: 'otp-disabled' };
  }

  async updateContact(_input: UpdateContactInput) {
    return { message: 'otp-disabled' };
  }
}

export const AuthService = new Auth('auth');
