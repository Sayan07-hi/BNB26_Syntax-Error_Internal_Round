from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import Allocation
from drops.models import Entry, Seat, Drop


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
        raise ValidationError(
            "Entry already has an allocation."
        )

    # Lock an available seat
    seat = (
        Seat.objects
        .select_for_update()
        .filter(
            drop=entry.drop,
            allocation__isnull=True
        )
        .first()
    )

    if not seat:
        raise ValidationError(
            "No seats available."
        )

    allocation = Allocation.objects.create(
        entry=entry,
        seat=seat,
    )

    return allocation


@transaction.atomic
def run_fair_allocation(drop_id):
    drop = (
        Drop.objects
        .select_for_update()
        .get(id=drop_id)
    )

    # Registration must be closed
    if timezone.now() < drop.registration_end:
        raise ValidationError(
            "Registration is still active."
        )

    # Prevent running allocation twice
    if drop.allocation_started:
        raise ValidationError(
            "Allocation has already started."
        )

    # Get all eligible entries
    entries = list(
        Entry.objects
        .filter(drop=drop)
        .order_by("joined_at")
    )

    # Randomize allocation order
    import random
    random.shuffle(entries)

    # Mark allocation as started
    drop.allocation_started = True
    drop.save(
        update_fields=["allocation_started"]
    )

    allocated_count = 0

    # Allocate seats in randomized order
    for entry in entries:
        try:
            allocate_seat(entry.id)
            allocated_count += 1
        except ValidationError:
            break

    # Mark allocation as complete
    drop.is_allocation_complete = True
    drop.save(
        update_fields=["is_allocation_complete"]
    )

    return allocated_count

def get_allocation_metrics(drop_id):
    total_entries = Entry.objects.filter(drop_id=drop_id).count()

    allocated_entries = Allocation.objects.filter(
        entry__drop_id=drop_id
    ).count()

    allocation_rate = (
        allocated_entries / total_entries * 100
        if total_entries > 0
        else 0
    )

    return {
        "drop_id": drop_id,
        "total_entries": total_entries,
        "allocated_entries": allocated_entries,
        "allocation_rate": round(allocation_rate, 2),
    }