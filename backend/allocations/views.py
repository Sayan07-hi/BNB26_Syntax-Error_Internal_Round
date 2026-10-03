from django.db import IntegrityError, transaction

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import AllocationSerializer
from .models import Allocation, IdempotencyKey
from drops.models import Entry
from .services import allocate_seat, run_fair_allocation


class AllocationCreateView(generics.CreateAPIView):
    serializer_class = AllocationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        entry_id = serializer.validated_data["entry_id"]

        # Get idempotency key from request header
        idempotency_key = self.request.headers.get("Idempotency-Key")

        if not idempotency_key:
            raise ValidationError(
                "Idempotency-Key header is required."
            )

        # Check whether this request was already processed
        existing_key = IdempotencyKey.objects.filter(
            key=idempotency_key
        ).select_related("allocation").first()

        if existing_key:
            serializer.instance = existing_key.allocation
            return

        # Verify that the entry belongs to the authenticated user
        try:
            entry = Entry.objects.get(
                id=entry_id,
                user=self.request.user
            )
        except Entry.DoesNotExist:
            raise ValidationError(
                "Entry not found."
            )

        # Prevent duplicate allocation
        if Allocation.objects.filter(entry=entry).exists():
            raise ValidationError(
                "This entry already has an allocation."
            )

        # Allocation is only allowed after the allocation phase starts
        if not entry.drop.allocation_started:
            raise ValidationError(
                "Allocation has not started yet."
            )

        allocation = allocate_seat(entry.id)

        # Store idempotency key with the result
        try:
            with transaction.atomic():
                IdempotencyKey.objects.create(
                    key=idempotency_key,
                    allocation=allocation
                )
        except IntegrityError:
            # Another identical request may have created it first
            existing_key = IdempotencyKey.objects.get(
                key=idempotency_key
            )
            allocation = existing_key.allocation

        serializer.instance = allocation


class FairAllocationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, drop_id):
        allocated_count = run_fair_allocation(drop_id)

        return Response({
            "message": "Fair allocation completed.",
            "drop_id": drop_id,
            "allocated_count": allocated_count,
        })