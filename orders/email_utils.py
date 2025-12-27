from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_order_confirmation_email(order, user):
    """
    Send order confirmation email to customer using Brevo API
    """
    subject = f'Order Confirmation - #{order.order_number} | PeelOJuice'
    
    # Get payment method display
    payment_method = 'Cash on Delivery'
    if hasattr(order, 'payment'):
        payment_method = order.payment.get_method_display()
    
    # Format amounts with proper 2 decimal places
    total_amount_formatted = f"₹{float(order.total_amount):.2f}"
    
    # Create HTML email content
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; }}
            .order-box {{ background: white; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #8B5CF6; }}
            .order-id {{ font-size: 24px; font-weight: bold; color: #8B5CF6; }}
            .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
            .label {{ color: #6b7280; }}
            .value {{ font-weight: bold; color: #111827; }}
            .total {{ font-size: 20px; color: #8B5CF6; font-weight: bold; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
            .footer {{ text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }}
            .success-icon {{ font-size: 48px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">✅</div>
                <h1 style="margin: 10px 0;">Order Confirmed!</h1>
                <p style="margin: 0;">Thank you for your order</p>
            </div>
            
            <div class="content">
                <p>Hi <strong>{user.full_name or user.email}</strong>,</p>
                <p>Great news! We've received your order and it's being processed. Your delicious juices will reach you soon! 🥤</p>
                
                <div class="order-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <p style="color: #6b7280; margin: 0; font-size: 14px;">Order Number</p>
                            <p class="order-id" style="margin: 5px 0 0 0;">#{order.order_number}</p>
                        </div>
                        <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">Confirmed</span>
                    </div>
                    <p style="color: #6b7280; margin: 10px 0; font-size: 14px;">
                        Placed on {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
                    </p>
                    
                    <div style="margin-top: 20px;">
                        <div class="detail-row">
                            <span class="label">Payment Method</span>
                            <span class="value">{payment_method}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Order Status</span>
                            <span class="value" style="color: #3b82f6;">Confirmed</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Items</span>
                            <span class="value">{order.items.count()} items</span>
                        </div>
                        <div class="detail-row" style="border: none; padding-top: 15px;">
                            <span class="label" style="font-size: 18px;">Total Amount</span>
                            <span class="total">{total_amount_formatted}</span>
                        </div>
                    </div>
                </div>
                
                <p><strong>What's next?</strong></p>
                <ul>
                    <li>We're preparing your order</li>
                    <li>You'll receive updates via email</li>
                    <li>Track your order status anytime</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/orders/{order.id}" class="button">
                        Track Your Order
                    </a>
                </div>
                
                <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 5px;">
                    <strong>📧 Need help?</strong><br>
                    Reply to this email or contact our support team.
                </p>
            </div>
            
            <div class="footer">
                <p><strong>PeelOJuice</strong></p>
                <p>Fresh, Healthy, Delicious 🍊</p>
                <p style="font-size: 12px; color: #9ca3af;">
                    This is an automated email. Please do not reply directly to this message.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version (fallback)
    plain_message = f"""
    Order Confirmed! ✅
    
    Hi {user.full_name or user.email},
    
    Thank you for your order! We've received your order and it's being processed.
    
    Order Details:
    - Order Number: #{order.order_number}
    - Payment Method: {payment_method}
    - Status: Confirmed
    - Total Amount: {total_amount_formatted}
    - Placed on: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
    
    Your delicious juices will reach you soon!
    
    Track your order: {settings.FRONTEND_URL}/orders/{order.id}
    
    Best regards,
    PeelOJuice Team
    """
    
    try:
        # Use Brevo API instead of SMTP
        from users.email_api import send_email_via_brevo_api
        
        success, message = send_email_via_brevo_api(
            to_email=user.email,
            subject=subject,
            text_content=plain_message,
            html_content=html_message
        )
        
        if success:
            print(f"[SUCCESS] Order confirmation email sent to {user.email}")
            return True
        else:
            print(f"[ERROR] Failed to send order confirmation email: {message}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Exception sending order confirmation email: {e}")
        import traceback
        traceback.print_exc()
        return False
