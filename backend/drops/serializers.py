from rest_framework import serializers
from .models import Entry


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ["id", "drop", "user", "joined_at"]
        read_only_fields = ["id", "user", "joined_at"]