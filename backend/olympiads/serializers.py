# olympiads/serializers.py
from rest_framework import serializers
from .models import Olympiad, OlympiadStage, OlympiadRegistration


class OlympiadStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OlympiadStage
        fields = ["id", "title", "stage_type", "start_date", "end_date", "description"]


class OlympiadSerializer(serializers.ModelSerializer):
    stages = OlympiadStageSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    url = serializers.SerializerMethodField()

    def get_url(self, obj):
        return obj.get_absolute_url()

    class Meta:
        model = Olympiad
        fields = [
            "id",
            "title",
            "slug",
            "subject",
            "subject_name",
            "description",
            "format",
            "level",
            "organizer_url",
            "min_grade",
            "max_grade",
            "is_published",
            "stages",
            "url",
        ]


class OlympiadRegistrationSerializer(serializers.ModelSerializer):
    olympiad_title = serializers.CharField(source="olympiad.title", read_only=True)
    olympiad_slug = serializers.CharField(source="olympiad.slug", read_only=True)

    class Meta:
        model = OlympiadRegistration
        fields = [
            "id",
            "olympiad",
            "olympiad_title",
            "olympiad_slug",
            "status",
            "registered_at",
            "result_score",
        ]
        read_only_fields = ["registered_at"]
