from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserActivity


class ActivityDaySerializer(serializers.Serializer):
    date = serializers.DateField()
    count = serializers.IntegerField()


class ActivityHeatmapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[OpenApiParameter("days", OpenApiTypes.INT, description="Количество дней (макс. 365)", required=False)],
        responses={200: ActivityDaySerializer(many=True)},
    )
    def get(self, request):
        days = min(int(request.query_params.get("days", 365)), 365)
        since = timezone.now() - timedelta(days=days)

        rows = (
            UserActivity.objects.filter(user=request.user, created_at__gte=since)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        return Response([{"date": row["date"], "count": row["count"]} for row in rows])
