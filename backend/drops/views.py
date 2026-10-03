from django.db import IntegrityError
from django.utils import timezone

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Entry
from .serializers import EntrySerializer


class EntryCreateView(generics.CreateAPIView):
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        drop = serializer.validated_data["drop"]
        now = timezone.now()

        if now < drop.registration_start:
            raise ValidationError(
                "Registration has not started yet."
            )

        if now > drop.registration_end:
            raise ValidationError(
                "Registration has ended."
            )

        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            raise ValidationError(
                "You have already entered this drop."
            )