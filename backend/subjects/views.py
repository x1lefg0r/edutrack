from django.shortcuts import render

from rest_framework import viewsets
from .models import Subject
from .serializers import SubjectSerializer
from config.permissions import IsStaffOrReadOnly


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsStaffOrReadOnly]
    lookup_field = "slug"
