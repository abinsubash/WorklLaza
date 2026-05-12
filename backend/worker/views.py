from .models import Worker,Jobs, WorkerAvailability as Slots
from .serializers import WorkerSerializer,JobSerializer, SlotSerializer
from booking.models import Booking, Review
from booking.serializers import BookingSerializer
from user.models import CustomUser as User
from admin_panel.models import Wallet
from admin_panel.serializers import WalletSerializer
from datetime import timedelta, datetime
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated , AllowAny
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import jwt
import stripe
import os

stripe.api_key = settings.STRIPE_SECRET_KEY
JWT_SECRET_KEY = settings.JWT_SECRET_KEY

# --- Registeration view ---
class RegistrationView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        jobs = Jobs.objects.filter(is_active=True)
        serializer = JobSerializer(jobs, many=True) 
        return Response({'message': 'success','Jobs':serializer.data}, status=status.HTTP_200_OK)
    def post(self, request, *args, **kwargs):
        try:
            # Get authenticated user directly from request
            user = request.user
            job_id = request.data.get('job')
            
            # Validate job_id
            if not job_id:
                return Response({'message':'Job selection is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user is already a worker
            if user.is_worker:
                return Response({'message':'Already registered; request may be under verification.'}, status=status.HTTP_200_OK)
            
            try:
                job = Jobs.objects.get(id=job_id)
            except Jobs.DoesNotExist:
                return Response({'message':'Invalid job selection.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Prepare data for serializer
            mutable_data = request.data.copy()
            mutable_data['user'] = user.id
            mutable_data['job'] = job.id
            
            serializer = WorkerSerializer(data=mutable_data)
            if serializer.is_valid():
                serializer.save(user=user)
                user.is_worker = True
                user.save()
                return Response({'message':'Worker registered successfully; request is under verification.'}, status=status.HTTP_201_CREATED)
            return Response({'messages':serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# --- professional details view ---
class DetailsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        token = request.headers['Authorization'][7:]
        decoded = jwt.decode(token,JWT_SECRET_KEY,algorithms=['HS256'])
        user_id = decoded['user_id']
        try:
            user = User.objects.get(id=user_id)
            worker = Worker.objects.get(user=user)
            job_title = worker.job.title
            seriloised_data = WorkerSerializer(worker).data
            seriloised_data.update({'job':job_title})
            reviews_count = Review.objects.filter(worker=worker).count()
            today_date = datetime.today().date()
            new_bookings =  Booking.objects.filter(worker=worker, booking_date=today_date).count()
            today_tasks_count = Booking.objects.filter(worker=worker, booked_date=today_date).exclude(status='completed').count()
            time_period = request.query_params.get('period', 'week')
            now = timezone.now()
            start_of_week = now - timedelta(days=now.weekday())
            start_of_last_week = start_of_week - timedelta(days=7)
            end_of_last_week = start_of_week - timedelta(seconds=1)
            booking_data = []
            
            if time_period == 'day':
                for i in range(6, -1, -1):
                    date = now.date() - timedelta(days=i)
                    count = Booking.objects.filter(booking_date=date, worker=worker).count()
                    booking_data.append({ 'label': date.strftime('%a'), 'date': date.strftime('%Y-%m-%d'), 'count': count })
            elif time_period == 'month':
                current_month = now.month
                current_year = now.year
                for i in range(5, -1, -1):
                    month = (current_month - i) % 12
                    if month == 0:
                        month = 12
                    year = current_year - ((current_month - month) // 12)
                    month_start = timezone.datetime(year, month, 1, tzinfo=timezone.get_current_timezone()).date()
                    if month == 12:
                        month_end = timezone.datetime(year + 1, 1, 1, tzinfo=timezone.get_current_timezone()).date() - timedelta(days=1)
                    else:
                        month_end = timezone.datetime(year, month + 1, 1, tzinfo=timezone.get_current_timezone()).date() - timedelta(days=1)
                    count = Booking.objects.filter(booking_date__range=(month_start, month_end), worker=worker).count()
                    booking_data.append({
                        'label': timezone.datetime(year, month, 1).strftime('%b'), 'date':timezone.datetime(year, month, 1).strftime('%Y-%m'), 'count':count })
            elif time_period == 'year':
                current_year = now.year
                for i in range(5, -1, -1):
                    year = current_year - i
                    year_start = timezone.datetime(year, 1, 1, tzinfo=timezone.get_current_timezone()).date()
                    year_end = timezone.datetime(year, 12, 31, tzinfo=timezone.get_current_timezone()).date()
                    
                    count = Booking.objects.filter( booking_date__range=(year_start, year_end), worker=worker).count()
                    booking_data.append({ 'label': str(year), 'date': str(year), 'count': count })
            else:
                for i in range(7):
                    day = (start_of_week + timedelta(days=i)).date()
                    count = Booking.objects.filter(booking_date=day, worker=worker).count()
                    booking_data.append({ 'label': day.strftime('%a'), 'date': day.strftime('%Y-%m-%d'), 'count': count })
            return Response({'messages':"Data featch successfully",'worker':seriloised_data, 'reviews_count': reviews_count, 'new_bookings': new_bookings, 'today_tasks_count': today_tasks_count, "booking_data": booking_data, "period": time_period},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'messages':str(e)},status=status.HTTP_401_UNAUTHORIZED)
        
    def patch(self, request, *args, **kwargs):
        try:
            worker_id =  request.data.get('id')
            full_name =  request.data.get('full_name')
            age =  request.data.get('age')
            salary =  request.data.get('salary')
            experience =  request.data.get('experience')
            longitude =  request.data.get('longitude')
            latitude =  request.data.get('latitude')
            previous_company =  request.data.get('previous_company')
            description =  request.data.get('description')
            qualification =  request.data.get('qualification')
        
            if full_name.strip() == "" or qualification.strip() == "" or salary.strip() == "" :
                return Response({'message':"Full name, salary and education can't be empty"},status=status.HTTP_401_UNAUTHORIZED)
            if ( not age.isnumeric() ) or ( not salary.isnumeric() ) or ( not experience.isnumeric() ) :
                return Response({'message':"Age, salary and experience should be in number"},status=status.HTTP_401_UNAUTHORIZED)
        
            worker = Worker.objects.get(id=worker_id)
            worker.full_name = full_name
            worker.age = age
            worker.salary = salary
            worker.experience = experience
            worker.longitude = longitude
            worker.latitude = latitude
            worker.previous_company = previous_company
            worker.description = description
            worker.qualification = qualification
            worker.save()
            return Response({'message':"Data Updated successfully" },status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message':str(e)},status=status.HTTP_401_UNAUTHORIZED)
        
# --- Slots view ---
class SlotView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        token = request.headers['Authorization'][7:]
        decoded = jwt.decode(token,JWT_SECRET_KEY,algorithms=['HS256'])
        user_id = decoded['user_id']
        try:
            user = User.objects.get(id=user_id)
            worker = Worker.objects.get(user=user)
            slots = Slots.objects.filter( worker=worker )
            slotSerializer = SlotSerializer(slots, many=True).data
            return Response({'message':"Slots get successfully",'slots':slotSerializer },status=status.HTTP_200_OK) 
        except Exception as e: 
            return Response({'message':str(e)},status=status.HTTP_409_CONFLICT) 
    
    def post(self, request, *args, **kwargs):
        token = request.headers['Authorization'][7:]
        decoded = jwt.decode(token,JWT_SECRET_KEY,algorithms=['HS256'])
        user_id = decoded['user_id']
        try:
            user = User.objects.get(id=user_id)
            worker = Worker.objects.get(user=user)
            day_of_week = request.data.get('week')
            start_time = request.data.get('from')
            end_time =  request.data.get('to')
            slot = Slots.objects.create(worker=worker,day_of_week=day_of_week,start_time=start_time,end_time=end_time,is_active=True)
            return Response({'message':"Slot created successfully"},status=status.HTTP_200_OK) 
        except Exception as e: 
            return Response({'message':str(e)},status=status.HTTP_409_CONFLICT) 
        
    def patch(self, request, *args, **kwargs):
        slot_id = request.data.get('id')
        try:
            slot = Slots.objects.get(id=slot_id)
            slot.is_active = not slot.is_active
            slot.save()
            return Response({'message':"Slot status updated successfully"},status=status.HTTP_200_OK) 
        except Exception as e: 
            return Response({'message':str(e)},status=status.HTTP_409_CONFLICT) 
        
    def put(self, request, *args, **kwargs):
        slot_id = request.data.get('id')
        try:
            slot = Slots.objects.get(id=slot_id)
            # Delete method now cascades to related bookings automatically
            slot.delete()
            return Response({'message': "Slot deleted successfully"}, status=status.HTTP_200_OK) 
        except Slots.DoesNotExist:
            return Response({'message': "Slot not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e: 
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
# --- Worker view ----
class WorkerView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        pass
    
    def post(self, request, *args, **kwargs):
        token = request.headers['Authorization'][7:]
        decoded = jwt.decode(token,JWT_SECRET_KEY,algorithms=['HS256'])
        user_id = decoded['user_id']
        try:
            user = User.objects.get(id=user_id)
            if user.is_worker :
                gps = False
                try:
                    worker = Worker.objects.get(user=user)
                    if not worker.is_verified:
                        return Response({'message':'The worker profile is not verified yet','is_verified':worker.is_verified},status=status.HTTP_401_UNAUTHORIZED)
                    if not worker.is_active:
                        return Response({'message':'Admin has blocked your profile','is_active':worker.is_active},status=status.HTTP_401_UNAUTHORIZED)
                    if not worker.latitude or not worker.longitude:
                        worker.latitude = request.data.get('latitude')
                        worker.longitude = request.data.get('longitude')
                        worker.save()
                    return Response({'message':'Logged in as a worker','full_name':worker.full_name,'gps':gps},status=status.HTTP_200_OK)
                except:
                    return Response({'message':'The user does not have a worker profile'},status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({'message':"You don't have access to this page"},status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'message':str(e)},status=status.HTTP_401_UNAUTHORIZED)
        
# --- Worker view ----
class BookingsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        token = request.headers['Authorization'][7:]
        decoded = jwt.decode(token,JWT_SECRET_KEY,algorithms=['HS256'])
        user_id = decoded['user_id']
        try:
            user = User.objects.get(id=user_id)
            worker = Worker.objects.get(user=user)
            bookings = Booking.objects.filter(worker=worker).exclude(status="canceled").order_by('-id')
            serializer = BookingSerializer(bookings, many=True)
            return Response({'message':"Bookings featch successfully",'Bookings':serializer.data },status=status.HTTP_200_OK) 
        except Exception as e: 
            return Response({'message':str(e)},status=status.HTTP_409_CONFLICT) 
    def patch(self, request, booking_id,*args, **kwargs, ):
        try:
            booking_status = request.data.get('status')
            booking =  Booking.objects.get(id=booking_id)
            booking.status = booking_status
            if booking.status == "accepted":
                booking.worker.total_fee += 50
                booking.worker.pending_fee += 50
                booking.worker.save()
            booking.save()
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{booking.user.id}",
                {
                    "type":"send_notification",
                    "message":{
                        "title":"Booking Update",
                        "body": f"Your booking '{booking.title}' has been updated to '{booking_status}'.",
                        "status": booking_status,
                    }
                }
            )
            return Response({'message':"Booking status updated successfully"},status=status.HTTP_200_OK) 
        
        except Exception as e: 
            return Response({'message':str(e)},status=status.HTTP_409_CONFLICT) 

# --- Payments view ---
class PaymentsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):        
        try :
            token = request.headers['Authorization'][7:]
            decoded = jwt.decode(token,JWT_SECRET_KEY,algorithms=['HS256'])
            user_id = decoded['user_id']
            user =  User.objects.get(id=user_id)
            worker = Worker.objects.get(user=user)
            wallets = Wallet.objects.filter(worker=worker)
            serialized_data = WorkerSerializer(worker).data
            p_seriolized_data =  WalletSerializer(wallets, many=True).data
            return Response({'message':"Data fetched successfully",'worker':serialized_data,"wallet_rows":p_seriolized_data},status=status.HTTP_200_OK) 
        except Exception as e: 
            return Response({'message':str(e)},status=status.HTTP_409_CONFLICT)
        
    def post(self, request, *args, **kwargs):
        try:
            # Extract and decode JWT token
            token = request.headers['Authorization'][7:]
            decoded = jwt.decode(token,JWT_SECRET_KEY,algorithms=['HS256'])
            user_id = decoded['user_id']
            
            # Fetch user and worker
            user = User.objects.get(id=user_id)
            worker = Worker.objects.get(user=user)
            
            # Check if there's a pending fee
            if worker.pending_fee <= 0: 
                return Response({"message": "No pending payments"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create Stripe checkout session
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            amount_cents = int(worker.pending_fee * 100)
            
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "inr",
                            "product_data": { 
                                "name": "Platform Service Fee", 
                            }, 
                            "unit_amount": amount_cents, 
                        }, 
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=f"{frontend_url}/worker?payment=success",
                cancel_url=f"{frontend_url}/worker?payment=cancelled",
                customer_email=request.user.email,
            )
            
            # Return response with session details
            return Response({
                'checkout_url': checkout_session.url,
                'session_id': checkout_session.id,
                'amount': worker.pending_fee
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    
        
# --- Stripe Webhook View ---
@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.headers.get("Stripe-Signature")
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        
        if not sig_header or not endpoint_secret:
            return JsonResponse({"error": "Missing Stripe Signature or Webhook Secret"}, status=400)
        
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError as e:
            return JsonResponse({"error": "Invalid payload"}, status=409)
        except stripe.error.SignatureVerificationError as e:
            return JsonResponse({"error": "Invalid signature"}, status=401)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            email = session.get("customer_email")
            amount = session.get("amount_total", 0)
            session_id = session.get("id")
            
            if not email:
                print(f"  ❌ No email found in session")
                return JsonResponse({"error": "No email in session"}, status=401)

            try:
                worker = Worker.objects.get(user__email=email)
                print(f"  👤 Worker found: {worker.full_name}")
                print(f"  💸 Before - Pending: {worker.pending_fee}, Paid: {worker.payed_fee}")
                
                worker.payed_fee += worker.pending_fee
                worker.pending_fee = 0
                worker.save()
                
                print(f"  ✅ After - Pending: {worker.pending_fee}, Paid: {worker.payed_fee}")
                
                # Create wallet transaction
                wallet = Wallet.objects.create(
                    user=worker.user,
                    worker=worker,
                    amount=amount,
                    pyment_id=session_id,
                    status="success",
                    type="credit"
                )
                print(f"  💾 Wallet transaction created: {wallet.id}")
                
            except Worker.DoesNotExist:
                print(f"  ❌ Worker not found for email: {email}")
                return JsonResponse({"error": "Worker not found"}, status=404)
            except Exception as e:
                print(f"  ❌ Error processing payment: {str(e)}")
                return JsonResponse({"error": str(e)}, status=500)
        
        return JsonResponse({"status": "success"}, status=200)

# --- Payment Verification Endpoint (for development) ---
class PaymentVerificationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        """Manual payment verification - called after Stripe checkout success"""
        session_id = request.data.get('session_id')
        
        if not session_id or session_id == 'auto_detect':
            return Response({
                'message': 'Session ID required and must be valid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get worker
            worker = Worker.objects.get(user=request.user)
            
            # Check if already processed
            existing_wallet = Wallet.objects.filter(pyment_id=session_id).first()
            if existing_wallet:
                return Response({
                    'message': 'Payment already verified',
                    'pending_fee': worker.pending_fee,
                    'payed_fee': worker.payed_fee
                }, status=status.HTTP_200_OK)
            
            # Retrieve session from Stripe
            session = stripe.checkout.Session.retrieve(session_id)
            
            # Verify payment is completed
            if session.payment_status != 'paid':
                return Response({
                    'message': f'Payment not completed. Status: {session.payment_status}',
                    'pending_fee': worker.pending_fee,
                    'payed_fee': worker.payed_fee
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Process payment - update worker fees
            amount_paid = session.amount_total / 100  # Convert cents to rupees
            
            worker.payed_fee += amount_paid
            worker.pending_fee = max(0, worker.pending_fee - amount_paid)
            worker.total_fee += amount_paid
            worker.save()
            
            # Create wallet transaction
            wallet = Wallet.objects.create(
                user=worker.user,
                worker=worker,
                amount=session.amount_total,
                pyment_id=session_id,
                status="success",
                type="credit"
            )
            
            return Response({
                'message': 'Payment verified successfully ✅',
                'pending_fee': worker.pending_fee,
                'payed_fee': worker.payed_fee,
                'total_fee': worker.total_fee,
                'transaction_id': wallet.id
            }, status=status.HTTP_200_OK)
                
        except Worker.DoesNotExist:
            return Response({
                'message': 'Worker profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except stripe.error.InvalidRequestError as e:
            return Response({
                'message': 'Invalid session ID or expired. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'message': f'Verification failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            print(f"   Payment Status: {session.payment_status}")
            print(f"   Amount: ₹{session.amount_total/100}")
            print(f"   Mode: {session.mode}")
            
            # Check if already processed
            existing_wallet = Wallet.objects.filter(pyment_id=session_id).first()
            if existing_wallet:
                print(f"⚠️  Payment already processed on {existing_wallet.id}")
                return Response({
                    'message': 'Payment already verified',
                    'pending_fee': worker.pending_fee,
                    'payed_fee': worker.payed_fee
                }, status=status.HTTP_200_OK)
            
            # Verify payment is completed
            if session.payment_status != 'paid':
                print(f"❌ Payment not completed. Status: {session.payment_status}")
                return Response({
                    'message': f'Payment not completed. Status: {session.payment_status}',
                    'pending_fee': worker.pending_fee,
                    'payed_fee': worker.payed_fee
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Process payment
            print(f"\n💰 Processing payment...")
            amount_paid = session.amount_total / 100  # Convert cents to rupees
            
            # Update worker fees
            worker.payed_fee += amount_paid
            worker.pending_fee = max(0, worker.pending_fee - amount_paid)
            worker.total_fee += amount_paid
            worker.save()
            
            # Create wallet transaction
            wallet = Wallet.objects.create(
                user=worker.user,
                worker=worker,
                amount=session.amount_total,
                pyment_id=session_id,
                status="success",
                type="credit"
            )
            
            print(f"✅ Payment successful!")
            print(f"   Wallet ID: {wallet.id}")
            print(f"   Updated Fees - Pending: ₹{worker.pending_fee}, Paid: ₹{worker.payed_fee}")
            print(f"{'='*60}\n")
            
            return Response({
                'message': 'Payment verified successfully ✅',
                'pending_fee': worker.pending_fee,
                'payed_fee': worker.payed_fee,
                'total_fee': worker.total_fee,
                'transaction_id': wallet.id
            }, status=status.HTTP_200_OK)
                
        except Worker.DoesNotExist:
            print(f"❌ Worker not found for user: {request.user.email}")
            print(f"{'='*60}\n")
            return Response({
                'message': 'Worker profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except stripe.error.InvalidRequestError as e:
            print(f"❌ Stripe Error: Invalid session ID or expired")
            print(f"   Details: {str(e)}")
            print(f"{'='*60}\n")
            return Response({
                'message': 'Invalid session ID or expired. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            print(f"   Type: {type(e).__name__}")
            print(f"{'='*60}\n")
            return Response({
                'message': f'Verification failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


