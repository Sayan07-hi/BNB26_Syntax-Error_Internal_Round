from django.db import models


class Allocation(models.Model):
    entry = models.OneToOneField(
        "drops.Entry",
        on_delete=models.CASCADE,
        related_name="allocation"
    )
    seat = models.OneToOneField(
        "drops.Seat",
        on_delete=models.CASCADE,
        related_name="allocation"
    )

    allocated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.entry.user.username} -> Seat {self.seat.seat_number}"


class IdempotencyKey(models.Model):
    key = models.CharField(max_length=255, unique=True)

    allocation = models.OneToOneField(
        Allocation,
        on_delete=models.CASCADE,
        related_name="idempotency_record"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.key