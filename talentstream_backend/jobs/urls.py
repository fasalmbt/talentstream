from django.urls import path
from .views import CustomTokenObtainPairView, JobListCreateView, JobDetailView, RegisterView, ApplicationCreateView, RecruiterApplicationsListView, SecureResumeDownloadView, JobSeekerApplicationsListView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(),name='register-account'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('jobs/apply/',ApplicationCreateView.as_view(), name='apply_job'),
    path('recruiter/applications/', RecruiterApplicationsListView.as_view(), name='recruiter-applications'),
    path('applications/<int:pk>/resume/', SecureResumeDownloadView.as_view(), name='secure-resume-download'),
    path('my-applications/', JobSeekerApplicationsListView.as_view(), name='jobseeker-applications'),

    path('jobs/', JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail')

]