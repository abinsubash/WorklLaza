from django.db import models
from user.models import CustomUser as User
from worker.models import Worker,Jobs, WorkerAvailability as Slot


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING,related_name='bookings')
    worker = models.ForeignKey(Worker,on_delete=models.DO_NOTHING, related_name='bookings')
    job = models.ForeignKey(Jobs, on_delete=models.DO_NOTHING, related_name='bookings')
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE, related_name='booking')
    duration = models.CharField( max_length=50)
    any_previous_issues = models.TextField()
    damaged_parts = models.TextField()
    details = models.TextField()
    booked_date = models.DateField(auto_now=False, auto_now_add=False, blank=True, null=True)
    booking_date = models.DateField(auto_now=False, auto_now_add=False, blank=True, null=True)
    title = models.TextField( blank=True, null=True)
    booking_time = models.TimeField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    longitude = models.FloatField(blank=False, null=False)
    latitude = models.FloatField( blank=False, null=False)
    photo = models.ImageField(upload_to='booking_photos/', null=True, blank=True)
    total = models.CharField( max_length=50)
    STATUS_CHOICES = [
        ('created', 'Booking Created'),
        ('accepted', 'Labor Accepted'),
        ('canceled', 'User Canceled'),
        ('rejected', 'Labor Rejected'),
        ('pending', 'Work Pending'),
        ('completed', 'Completed'),
        ('visited', 'Place Visited'),
        ('liked', 'User Like'),
    ]
    status = models.CharField( max_length=10, choices=STATUS_CHOICES, default='created' )
    
    def __str__(self):
        return f"{self.title}"

    
class Review(models.Model):
    
    RATINGS = [ (0.5, '0.5'), (1, '1'), (1.5, '1.5'), (2, '2'), (2.5, '2.5'), (3, '3'), (3.5, '3.5'), (4, '4'), (4.5, '4.5'), (5, '5')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    worker =  models.ForeignKey(Worker, on_delete=models.CASCADE)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='review')
    rating = models.DecimalField( max_digits=2,  decimal_places=1,  choices=RATINGS,  default=5 )
    title = models.CharField(max_length=50)
    description = models.TextField()

    def __str__(self):
        return f"Review by {self.user.username} for Booking {self.booking.title}"