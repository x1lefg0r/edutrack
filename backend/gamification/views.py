from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserActivity


class ActivityHeatmapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
