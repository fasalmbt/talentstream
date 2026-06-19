from rest_framework import permissions

class isRecruiter(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_profile = getattr(request.user, 'profile', None)
        if user_profile and user_profile.role == 'recruiter':
            return True
        return False
    
class isJobSeeker(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_profile = getattr(request.user, 'profile', None)
        if user_profile and user_profile.role == 'job_seeker':
            return True
        return False

class IsJobOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.recruiter == request.user

class IsApplicantOrJobRecruiter(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        is_applicant = (obj.user == request.user)
        is_recruiter = (obj.job.recruiter == request.user)

        return is_applicant or is_recruiter