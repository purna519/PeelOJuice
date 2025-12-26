import random
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from smtplib import SMTPException
import logging

# Import Brevo API email function (bypasses Railway SMTP port blocking)
from .email_api import send_otp_email_api

logger = logging.getLogger(__name__)

def generate_email_otp(user):
    otp = str(random.randint(100000,999999))
    
    user.email_otp = otp
    user.otp_created_at = timezone.now()
    user.is_email_verified = False

    user.save(update_fields=[
        'email_otp',
        'otp_created_at',
        'is_email_verified'
    ])
    logger.info(f"Generated email OTP for user: {user.email}")

    # Use Brevo API instead of SMTP (Railway blocks SMTP ports)
    try:
        email_sent = send_otp_email_api(user.email, otp, purpose="verification")
    except Exception as e:
        logger.error(f"Email API error: {str(e)}")
        email_sent = False
    
    if not email_sent:
        logger.error(f"Failed to send email OTP to {user.email}")
    
    return otp, email_sent

def generate_phone_otp(user):
    otp = str(random.randint(100000, 999999))
    
    user.phone_otp = otp
    user.phone_otp_created_at = timezone.now()
    user.is_phone_verified = False

    user.save(update_fields=[
        'phone_otp',
        'phone_otp_created_at',
        'is_phone_verified'
    ])

    return otp

def generate_password_reset_otp(user):
    otp = str(random.randint(100000, 999999))
    
    user.password_reset_otp = otp
    user.password_reset_otp_created_at = timezone.now()
    
    user.save(update_fields=[
        'password_reset_otp',
        'password_reset_otp_created_at'
    ])
    
    try:
        send_otp_email(user.email, otp, purpose="password_reset")
    except Exception as e:
        # Log the error but don't fail the password reset process
        print(f"Failed to send password reset email: {e}")
    
    return otp





def send_otp_email(email, otp, purpose="verification"):
    subject_map = {
        "verification": "Verify your email",
        "password_reset": "Reset your password",
    }

    message_map = {
        "verification": f"""
Hi,

Your email verification OTP is: {otp}

This OTP is valid for 5 minutes.

If you didn’t request this, please ignore this email.
""",
        "password_reset": f"""
Hi,

Your password reset OTP is: {otp}

This OTP is valid for 5 minutes.

If you didn’t request this, please secure your account.
"""
    }

    send_mail(
        subject=subject_map[purpose],
        message=message_map[purpose],
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,  # Gmail blocks Railway IPs - can't fix this
    )
