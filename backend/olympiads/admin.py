# olympiads/admin.py
from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone
import io
import os
import matplotlib
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from .models import Olympiad, OlympiadStage, OlympiadRegistration

DEJAVU_FONT_PATH = os.path.join(
    os.path.dirname(matplotlib.__file__), "mpl-data", "fonts", "ttf", "DejaVuSans.ttf"
)
pdfmetrics.registerFont(TTFont("DejaVu", DEJAVU_FONT_PATH))


def publish_olympiads(modeladmin, request, queryset):
    queryset.update(is_published=True)


publish_olympiads.short_description = "Опубликовать выбранные олимпиады"


def export_olympiads_pdf(modeladmin, request, queryset):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    p.setFont("DejaVu", 16)
    p.drawString(50, height - 50, "Список олимпиад")
    p.setFont("DejaVu", 12)

    y = height - 100
    for olympiad in queryset.select_related("subject"):
        if y < 50:
            p.showPage()
            y = height - 50
        p.drawString(
            50,
            y,
            f"{olympiad.title} — {olympiad.subject.name} — {olympiad.get_level_display()}",
        )
        y -= 25

    p.save()
    buffer.seek(0)

    response = HttpResponse(buffer, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="olympiads.pdf"'
    return response


export_olympiads_pdf.short_description = "Экспортировать в PDF"


class OlympiadStageInline(admin.TabularInline):
    model = OlympiadStage
    extra = 1


@admin.register(Olympiad)
class OlympiadAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "subject",
        "level",
        "format",
        "is_published",
        "stages_count",
        "created_at",
    ]
    list_display_links = ["title", "subject"]
    list_filter = ["level", "format", "is_published", "subject"]
    search_fields = ["title", "subject__name"]
    prepopulated_fields = {"slug": ("title",)}
    raw_id_fields = ["subject"]
    inlines = [OlympiadStageInline]
    date_hierarchy = "created_at"
    readonly_fields = ["created_at"]
    actions = [publish_olympiads, export_olympiads_pdf]

    @admin.display(description="Этапов")
    def stages_count(self, obj):
        return obj.stages.count()


@admin.register(OlympiadRegistration)
class OlympiadRegistrationAdmin(admin.ModelAdmin):
    list_display = ["user", "olympiad", "status", "result_score", "registered_at"]
    list_display_links = ["user", "olympiad"]
    list_filter = ["status", "olympiad__subject"]
    search_fields = ["user__username", "olympiad__title"]
    raw_id_fields = ["user", "olympiad"]
    readonly_fields = ["registered_at"]
