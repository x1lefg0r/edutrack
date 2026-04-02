from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Profile
from subjects.serializers import SubjectSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.get_or_create(user=user)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    is_staff = serializers.BooleanField(source="user.is_staff", read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "username",
            "email",
            "is_staff",
            "avatar",
            "bio",
            "subjects",
            "current_streak",
            "max_streak",
            "last_activity_date",
        ]
        read_only_fields = ["current_streak", "max_streak", "last_activity_date"]
