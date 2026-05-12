from django.db import models
from worker.models import Worker
from user.models import CustomUser as User

# Create your models here.


class Wallet(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    worker = models.ForeignKey(Worker,on_delete=models.DO_NOTHING)
    amount =  models.FloatField(null=False,blank=False)
    pyment_id  = models.CharField( max_length=255)
    status = models.CharField(max_length=20, null=False,blank=False)
    TYPE_CHOICES = [
    ('credit', 'Amount Credit'),
    ('debit', 'Amount Debit'),
    ]
    type = models.CharField( max_length=10, choices=TYPE_CHOICES, default='credit' )
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.worker.full_name} - ₹{self.amount/100} - {self.status}"