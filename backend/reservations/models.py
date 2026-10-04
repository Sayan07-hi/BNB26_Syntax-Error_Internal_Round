from django.db import models


class Reservation(models.Model):
    allocation = models.OneToOneField(
        "allocations.Allocation",
        on_delete=models.CASCADE,
        related_name="reservation"
    )

    confirmed = models.BooleanField(default=False)
    reserved_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Reservation #{self.id}"