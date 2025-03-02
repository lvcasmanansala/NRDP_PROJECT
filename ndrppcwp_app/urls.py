from django.urls import path
from . import views
from django.views.generic import TemplateView

app_name = "ndrppcwp_app"
 
urlpatterns = [ 
    path("", views.index, name="index_page"),
    path("load-researches/", views.load_researches, name="load_researches"),
    path("research-details/<slug:name>/", views.research_detail, name="research_detail"), 
    path("research-details/<slug:name>/create-report-error/", views.create_report_error, name="create_report_error"), 
]