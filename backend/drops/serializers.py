from rest_framework import serializers
from .models import Drop, Entry


class DropSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=200, trim_whitespace=True)
    description = serializers.CharField(required=True, allow_blank=False, trim_whitespace=True)
    total_seats = serializers.IntegerField(min_value=1)

    class Meta:
        model = Drop
        fields = [
            "id",
            "name",
            "description",
            "total_seats",
            "registration_start",
            "registration_end",
            "is_active",
            "is_allocation_complete",
            "allocation_started",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "is_active",
            "is_allocation_complete",
            "allocation_started",
            "created_at",
        ]

    def validate(self, attrs):
        start = attrs.get("registration_start", getattr(self.instance, "registration_start", None))
        end = attrs.get("registration_end", getattr(self.instance, "registration_end", None))
        if start and end and start >= end:
            raise serializers.ValidationError({
                "registration_end": "Registration closing time must be after opening time."
            })
        return attrs


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ["id", "drop", "user", "joined_at"]
        read_only_fields = ["id", "user", "joined_at"]
