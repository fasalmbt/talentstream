import os
from django.http import FileResponse, Http404
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .models import JobListing, Application
from .serializers import CustomTokenObtainPairSerializer, JobListingSerializer, RegisterSerializer, ApplicationSerializer, RecruiterApplicationSerializer, JobSeekerApplicationSerializer
from .permissions import isRecruiter, isJobSeeker, IsJobOwnerOrReadOnly, IsApplicantOrJobRecruiter
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class JobListCreateView(generics.ListCreateAPIView):
    queryset = JobListing.objects.all()
    serializer_class = JobListingSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [isRecruiter()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobListing.objects.all()
    serializer_class = JobListingSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [isRecruiter(), IsJobOwnerOrReadOnly()]
        return [permissions.AllowAny()]
    

class ApplicationCreateView(generics.CreateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [isJobSeeker]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecruiterApplicationsListView(generics.ListAPIView):
    serializer_class = RecruiterApplicationSerializer
    permission_classes = [isRecruiter]

    def get_queryset(self):
        return Application.objects.filter(job__recruiter=self.request.user)
    

class JobSeekerApplicationsListView(generics.ListAPIView):
    serializer_class = JobSeekerApplicationSerializer
    permission_classes = [isJobSeeker]

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class SecureResumeDownloadView(APIView):
    permission_classes = [IsAuthenticated, IsApplicantOrJobRecruiter]

    def get(self, request, pk):
        try:
            application = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            raise Http404("Application not found.")

        self.check_object_permissions(request, application)

        if not application.resume or not os.path.exists(application.resume.path):
            raise Http404("Resume file not found on server storage.")

        response = FileResponse(open(application.resume.path, 'rb'), content_type='application/pdf')
        
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(application.resume.name)}"'
        return response