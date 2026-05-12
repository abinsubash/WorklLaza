from django.contrib import admin
from .models import Worker, Jobs

class WorkerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'job', 'user', 'is_verified', 'is_active', 'salary')
    list_filter = ('is_verified', 'is_active', 'job')
    search_fields = ('full_name', 'user__username', 'user__email')
    list_editable = ('is_verified', 'is_active')
    ordering = ('-id',)

class JobsAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title',)

admin.site.register(Worker, WorkerAdmin)
admin.site.register(Jobs, JobsAdmin)
