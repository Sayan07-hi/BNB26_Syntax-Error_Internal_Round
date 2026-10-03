from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.db import IntegrityError
from django.utils import timezone

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, Throttled

from .models import Entry
from .serializers import EntrySerializer


class EntryCreateView(generics.CreateAPIView):
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]

    @method_decorator(
        ratelimit(
            key="user",
            rate="5/m",
            method="POST",
            block=False
        )
    )
    def post(self, request, *args, **kwargs):
        if getattr(request, "limited", False):
            raise Throttled(
                detail="Rate limit exceeded. Try again later."
            )

        return super().post(request, *args, **kwargs)

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