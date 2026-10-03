from rest_framework import serializers


class AllocationSerializer(serializers.Serializer):
    entry_id = serializers.IntegerField()