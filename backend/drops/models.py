from django.db import models


class Drop(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    total_seats = models.PositiveIntegerField()
    registration_start = models.DateTimeField()
    registration_end = models.DateTimeField()

    is_active = models.BooleanField(default=False)
    is_allocation_complete = models.BooleanField(default=False)
    allocation_started = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Entry(models.Model):
    drop = models.ForeignKey(
        Drop,
        on_delete=models.CASCADE,
        related_name="entries"
    )
    user = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="drop_entries"
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["drop", "user"],
                name="unique_user_per_drop"
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.drop.name}"


class Seat(models.Model):
    drop = models.ForeignKey(
        Drop,
        on_delete=models.CASCADE,
        related_name="seats"
    )
    seat_number = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["drop", "seat_number"],
                name="unique_seat_per_drop"
            )
        ]

    def __str__(self):
        return f"{self.drop.name} - Seat {self.seat_number}"