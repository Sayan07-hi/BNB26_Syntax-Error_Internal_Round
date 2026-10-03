from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .serializers import AllocationSerializer
from .models import Allocation
from drops.models import Entry
from .services import allocate_seat


class AllocationCreateView(generics.CreateAPIView):
    serializer_class = AllocationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        entry_id = serializer.validated_data["entry_id"]

        try:
            entry = Entry.objects.get(
                id=entry_id,
                user=self.request.user
            )
        except Entry.DoesNotExist:
            raise ValidationError("Entry not found.")

        if Allocation.objects.filter(entry=entry).exists():
            raise ValidationError("This entry already has an allocation.")

        allocation = allocate_seat(entry.id)

        serializer.instance = allocation