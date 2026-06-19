from rest_framework import serializers
from django.contrib.auth.models import User
from .models import JobListing, UserProfile, Application
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        user_profile = getattr(user, 'profile', None)
        token['role'] = user.profile.role
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        user_profile = getattr(self.user, 'profile', None)
        data['role'] = user_profile.role if user_profile else 'job_seeker'
        data['username'] = self.user.username
        
        return data

class JobListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobListing
        fields = [
            'id', 
            'recruiter', 
            'title', 
            'company_name', 
            'company_website', 
            'description', 
            'location', 
            'max_salary', 
            'created_at'
        ]
        read_only_fields = ['recruiter']

# serializers.py
class ApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.StringRelatedField(source='user', read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'applicant', 'cover_letter', 'resume', 'status', 'applied_at']
        read_only_fields = ['status', 'applicant']

    def validate(self, attrs):
        user = self.context['request'].user
        job = attrs.get('job')

        if Application.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError({
                "detail": "You have already submitted an application for this position."
            })
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User  
        fields = [
            'username',
            'email',  
            'password',
            'role'
        ]

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        UserProfile.objects.create(user=user, role=role)
        return user
    

class RecruiterApplicationSerializer(serializers.ModelSerializer):
    applicant_username = serializers.CharField(source='user.username', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job_title', 'applicant_username', 'cover_letter', 'resume', 'status', 'applied_at']
        read_only_fields = ['job_title', 'applicant_username', 'cover_letter', 'resume', 'applied_at']


class JobSeekerApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company_name', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'company_name', 'cover_letter', 'resume', 'status', 'applied_at']
        read_only_fields = fields