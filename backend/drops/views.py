import statistics
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.db import IntegrityError, transaction
from django.utils import timezone

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError, Throttled

from .models import Drop, Entry, Seat
from .serializers import DropSerializer, EntrySerializer


class EntryCreateView(generics.CreateAPIView):
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]

    @method_decorator(
        ratelimit(
            key="user",
            rate="30/m",
            method="POST",
            block=False
        )
    )
    def post(self, request, *args, **kwargs):
        if getattr(request, "limited", False):
            raise Throttled(
                detail="Rate limit exceeded. Try again later."
            )

        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        drop = serializer.validated_data["drop"]
        now = timezone.now()

        if now < drop.registration_start:
            raise ValidationError(
                "Registration has not started yet."
            )

        if now > drop.registration_end:
            raise ValidationError(
                "Registration has ended."
            )

        try:
            with transaction.atomic():
                serializer.save(user=self.request.user)
        except IntegrityError:
            raise ValidationError(
                "You have already entered this drop."
            )


class CreateDropView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = DropSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            Drop.objects.filter(is_active=True).update(is_active=False)
            drop = serializer.save(is_active=True)
            Seat.objects.bulk_create(
                (Seat(drop=drop, seat_number=number) for number in range(1, drop.total_seats + 1)),
                batch_size=1000,
            )
        return Response(self.serialize_drop(drop), status=201)

    @staticmethod
    def serialize_drop(drop):
        data = dict(DropSerializer(drop).data)
        now = timezone.now()
        if now < drop.registration_start:
            data["registration_status"] = "upcoming"
        elif now <= drop.registration_end:
            data["registration_status"] = "open"
        else:
            data["registration_status"] = "closed"
        data["total_entries"] = drop.entries.count()
        data["allocated_entries"] = drop.entries.filter(allocation__isnull=False).count()
        data["remaining_seats"] = max(drop.total_seats - data["allocated_entries"], 0)
        data["allocation_status"] = (
            "complete" if drop.is_allocation_complete
            else "started" if drop.allocation_started
            else "not_started"
        )
        return data


class ActiveDropView(APIView):
    """Expose the published drop as read-only information for participants."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        drop = Drop.objects.filter(is_active=True).order_by("-created_at", "-id").first()
        if drop is None:
            return Response({"detail": "No active drop has been published."}, status=404)
        return Response(CreateDropView.serialize_drop(drop))


class EndRegistrationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        with transaction.atomic():
            drop = Drop.objects.select_for_update().filter(is_active=True).order_by('-created_at', '-id').first()
            if drop is None:
                return Response({"detail": "No active drop has been published."}, status=404)
            now = timezone.now()
            if now < drop.registration_start:
                return Response({"detail": "Registration has not started yet."}, status=400)
            if now <= drop.registration_end:
                drop.registration_end = now
                drop.save(update_fields=["registration_end"])
        return Response(CreateDropView.serialize_drop(drop))


class SimulationRunView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        try:
            drop_id = int(request.data["drop_id"])
        except (KeyError, TypeError, ValueError):
            raise ValidationError("drop_id must be a valid Drop ID.")
        try:
            concurrency = int(request.data.get("concurrency", 5))
        except (TypeError, ValueError):
            raise ValidationError("concurrency must be a valid number.")
        if concurrency < 1 or concurrency > 5:
            raise ValidationError("concurrency must be between 1 and 5.")

        User = get_user_model()

        users = list(
            User.objects.filter(
                email__startswith="sim"
            ).order_by("id")[:concurrency]
        )

        if len(users) < concurrency:
            return Response(
                {
                    "detail": (
                        f"Need {concurrency} simulation users, "
                        f"but only found {len(users)}."
                    )
                },
                status=400,
            )

        def submit_entry(user):
            try:
                token = str(AccessToken.for_user(user))

                start = time.perf_counter()

                response = requests.post(
                    "http://127.0.0.1:8000/api/v1/entries/",
                    json={"drop": drop_id},
                    headers={
                        "Authorization": f"Bearer {token}",
                    },
                    timeout=10,
                )

                latency = (time.perf_counter() - start) * 1000

                return {
                    "email": user.email,
                    "status": response.status_code,
                    "latency": round(latency, 2),
                    "body": response.text[:200],
                }

            except Exception as exc:
                return {
                    "email": user.email,
                    "status": "ERROR",
                    "latency": 0,
                    "body": str(exc),
                }

        results = []

        total_start = time.perf_counter()

        with ThreadPoolExecutor(
            max_workers=concurrency
        ) as executor:

            futures = [
                executor.submit(submit_entry, user)
                for user in users
            ]

            for future in as_completed(futures):
                results.append(future.result())

        total_time = (
            time.perf_counter() - total_start
        ) * 1000

        successful = [
            result
            for result in results
            if isinstance(result["status"], int)
            and 200 <= result["status"] < 300
        ]

        latencies = [
            result["latency"]
            for result in successful
        ]

        average_latency = (
            statistics.mean(latencies)
            if latencies
            else 0
        )

        p95_latency = 0

        if len(latencies) >= 2:
            p95_latency = statistics.quantiles(
                latencies,
                n=20
            )[18]

        return Response({
            "drop_id": drop_id,
            "requests": len(results),
            "successful": len(successful),
            "failed": len(results) - len(successful),
            "average_latency_ms": round(
                average_latency,
                2
            ),
            "p95_latency_ms": round(
                p95_latency,
                2
            ),
            "total_time_ms": round(
                total_time,
                2
            ),
            "results": results,
        })
