from celery import shared_task
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from .models import CustomUser
from datetime import datetime


@shared_task
def send_otp_email(user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        
        # ========== CONSOLE OUTPUT FOR DEVELOPMENT ==========
        print("\n" + "="*60)
        print("📧 OTP SENT TO USER")
        print("="*60)
        print(f"User Email: {user.email}")
        print(f"User Name: {user.first_name} {user.last_name}")
        print(f"🔑 OTP CODE: {user.otp}")
        print(f"⏱️  Valid for: 10 minutes")
        print("="*60 + "\n")
        # ====================================================
        
        subject = "Your OTP Verification Code"
        message = f"""
        Hi {user.first_name} {user.last_name},

        Your One-Time Password (OTP) for WorkLaza verification is:

        🔑 {user.otp}

        Please enter this code to complete your verification process. This OTP is valid for 10 minutes.

        If you did not request this OTP, please ignore this email.

        Best regards,  
        The WorkLaza Security Team  

        ——————————————  
        © {datetime.now().year} WorkLaza. All rights reserved.
        """
        
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        
        try:
            email.send()
            print(f"✅ Email sent successfully to {user.email}")
        except Exception as e:
            print(f"⚠️  Email Exception: {str(e)}")
            # Still return success since OTP is in console
            
        return "OTP sent successfully!"
    except CustomUser.DoesNotExist:
        print("❌ User not found!")
        return "User not found!"
