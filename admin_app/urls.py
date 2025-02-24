from django.urls import path
from . import views
from django.views.generic import TemplateView

app_name = "ndrppcwp_admin_app"
 
urlpatterns = [ 
    path("", views.index, name="index_page"),  
    path("authors/", views.authors, name="authors"),  
    path("authors/add/", views.authors_add, name="authors_add"),  
    path("authors/edit/<uuid:id>/", views.authors_edit, name="authors_edit"),  
    path("authors/delete/<uuid:id>/", views.authors_delete, name="authors_delete"),  
    
    path("researches/", views.researches, name="researches"),  
    path("researches/add/", views.researches_add, name="researches_add"),  
    path("researches/edit/<uuid:id>/", views.researches_edit, name="researches_edit"),  
    path("researches/delete/<uuid:id>/", views.researches_delete, name="researches_delete"),   

    path("report_errors/", views.report_errors, name="report_errors"),   
    path("researches/view/<uuid:id>/", views.report_errors_view, name="report_errors_view"),  

    
    
    path("docs/", views.docs, name="docs"),   


]