from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Entry
from .serializers import EntrySerializer


class EntryCreateView(generics.CreateAPIView):
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)