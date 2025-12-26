"""
Brevo API email sending utility.
Uses HTTP API instead of SMTP to bypass Railway's SMTP port blocking.
"""
import logging
from decouple import config
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

logger = logging.getLogger(__name__)

def send_email_via_brevo_api(to_email, subject, text_content, html_content=None):
    """
    Send email using Brevo's HTTP API instead of SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        text_content: Plain text content
        html_content: Optional HTML content
        
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        # Configure API key authorization
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = config('BREVO_API_KEY')
        
        # Create an instance of the API class
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        
        # Set up sender
        sender = {
            "name": "PeelOJuice",
            "email": config('DEFAULT_FROM_EMAIL', default='peelojuice0@gmail.com')
        }
        
        # Set up recipient
        to = [{"email": to_email}]
        
        # Create email  payload
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            sender=sender,
            subject=subject,
            text_content=text_content,
            html_content=html_content or text_content
        )
        
        # Send email
        api_response = api_instance.send_transac_email(send_smtp_email)
        
        logger.info(f"Email sent successfully via Brevo API to {to_email}. Message ID: {api_response.message_id}")
        return True, f"Email sent successfully (ID: {api_response.message_id})"
        
    except ApiException as e:
        error_msg = f"Brevo API error: {e}"
        logger.error(error_msg)
        return False, error_msg
    except Exception as e:
        error_msg = f"Unexpected error sending email: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return False, error_msg


def send_otp_email_api(email, otp, purpose="verification"):
    """
    Send OTP email using Brevo API.
    
    Args:
        email: Recipient email
        otp: OTP code
        purpose: "verification", "password_reset", or "resend"
        
    Returns:
        bool: True if sent successfully, False otherwise
    """
    subject_map = {
        "verification": "Verify your email - PeelOJuice",
        "password_reset": "Password Reset OTP - PeelOJuice",
        "resend": "Your OTP - PeelOJuice"
    }
    
    message_map = {
        "verification": f"""
Hello,

Thank you for registering with PeelOJuice!

Your email verification OTP is: {otp}

This OTP will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
PeelOJuice Team
""",
        "password_reset": f"""
Hello,

You requested a password reset for your PeelOJuice account.

Your password reset OTP is: {otp}

This OTP will expire in 10 minutes.

If you didn't request this, please ignore this email and your password will remain unchanged.

Best regards,
PeelOJuice Team
""",
        "resend": f"""
Hello,

Your OTP code is: {otp}

This OTP will expire in 10 minutes.

Best regards,
PeelOJuice Team
"""
    }
    
    subject = subject_map.get(purpose, "Your OTP - PeelOJuice")
    message = message_map.get(purpose, f"Your OTP is: {otp}")
    
    logger.info(f"Attempting to send {purpose} email to {email} via Brevo API")
    success, result_msg = send_email_via_brevo_api(email, subject, message)
    
    if success:
        logger.info(f"Successfully sent {purpose} email to {email}")
    else:
        logger.error(f"Failed to send {purpose} email to {email}: {result_msg}")
    
    return success
