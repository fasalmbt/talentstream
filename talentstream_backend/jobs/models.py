from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('recruiter', 'Recruiter'),
        ('job_seeker', 'Job Seeker')
    ]
    role = models.CharField(max_length=100, choices=ROLE_CHOICES, default='job_seeker')
    portfolio_website = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

class JobListing(models.Model):
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length = 250)
    company_name = models.CharField(max_length=100)
    company_website = models.URLField(blank=True, null=True)
    description = models.TextField()
    location = models.CharField(max_length=100, default="Remote")
    max_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class Application(models.Model):
    job = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='applications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(blank=True, null=True)
    
    resume = models.FileField(upload_to='resumes/', null=True, blank=False)
    
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewing', 'Reviewing'),
        ('interviewing', 'Interviewing'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'user')

    def __str__(self):
        return f"{self.user.username} -> {self.job.title} ({self.get_status_display()})"


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()