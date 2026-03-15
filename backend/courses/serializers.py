from rest_framework import serializers
from .models import Course, CourseEnrollment


class CourseSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    olympiad_title = serializers.CharField(source="olympiad.title", read_only=True)
    url = serializers.SerializerMethodField()

    def get_url(self, obj):
        return obj.get_absolute_url()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "subject",
            "subject_name",
            "olympiad",
            "olympiad_title",
            "description",
            "format",
            "level",
            "url",
            "start_date",
            "end_date",
            "is_published",
            "url",
        ]


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_slug = serializers.CharField(source="course.slug", read_only=True)

    class Meta:
        model = CourseEnrollment
        fields = [
            "id",
            "course",
            "course_title",
            "course_slug",
            "status",
            "enrolled_at",
        ]
        read_only_fields = ["enrolled_at"]
