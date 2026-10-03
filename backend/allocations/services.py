from django.db import transaction
from django.core.exceptions import ValidationError

from .models import Allocation
from drops.models import Entry, Seat


@transaction.atomic
def allocate_seat(entry_id):
    entry = (
        Entry.objects
        .select_related("drop", "user")
        .select_for_update()
        .get(id=entry_id)
    )

    # Prevent duplicate allocation
    if Allocation.objects.filter(entry=entry).exists():
        raise ValidationError("Entry already has an allocation.")

    # Lock an available seat
    seat = (
        Seat.objects
        .select_for_update()
        .filter(drop=entry.drop, allocation__isnull=True)
        .first()
    )

    if not seat:
        raise ValidationError("No seats available.")

    allocation = Allocation.objects.create(
        entry=entry,
        seat=seat,
    )

    return allocation