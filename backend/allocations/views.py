from django.db import IntegrityError, transaction
from django.db.models import Q

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import AllocationSerializer
from .models import Allocation, IdempotencyKey
from drops.models import Entry
from .services import (
    allocate_seat,
    run_fair_allocation,
    get_allocation_metrics,
)


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


class AllocationMetricsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, drop_id):
        metrics = get_allocation_metrics(drop_id)

        return Response(metrics)


class MyAllocationStatusView(APIView):
    """Return only the signed-in user's drop entries and allocation results."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = list(Entry.objects.filter(user=request.user).select_related("drop").prefetch_related("allocation__seat").order_by("joined_at", "id"))
        results = []
        entry_counts = {drop_id: Entry.objects.filter(drop_id=drop_id).count() for drop_id in {entry.drop_id for entry in entries}}
        for entry in entries:
            allocation = getattr(entry, "allocation", None)
            entry_position = Entry.objects.filter(drop_id=entry.drop_id).filter(
                Q(joined_at__lt=entry.joined_at) | Q(joined_at=entry.joined_at, id__lte=entry.id)
            ).count()
            results.append({
                "entry_id": entry.id,
                "drop_id": entry.drop_id,
                "drop_name": entry.drop.name,
                "joined_at": entry.joined_at,
                "entry_position": entry_position,
                "total_entries": entry_counts[entry.drop_id],
                "allocation_complete": entry.drop.is_allocation_complete,
                "allocation": ({
                    "seat_number": allocation.seat.seat_number,
                    "allocated_at": allocation.allocated_at,
                } if allocation else None),
            })
        return Response(results)
