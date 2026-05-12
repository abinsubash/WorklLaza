from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('details_view/', DetailsView.as_view(), name='details_view'),
    path('slot_view/', SlotView.as_view(), name='slot_View'),
    path('worker_view/', WorkerView.as_view(), name='worker_view'),
    path('bookings_view/', BookingsView.as_view(), name='view_bookings'),
    path('bookings_view/<int:booking_id>', BookingsView.as_view(), name='change_booking_status'),
    path('payments_view/', PaymentsView.as_view(), name='payments_view'),
    path('payment_verify/', PaymentVerificationView.as_view(), name='payment_verify'),
    path("stripe-webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
