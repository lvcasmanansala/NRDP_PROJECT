from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.sessions.models import Session 
from . import models

admin.site.site_header = 'NRDP PCWP Super Administrator'
admin.site.index_title = 'Super Administrator Page'
admin.site.site_title = 'Super Administrator Panel'
 

# NOTE: Only is_super user allows to go this admin page
#! https://stackoverflow.com/questions/19045000/django-admin-site-register-only-for-superuser
def has_superuser_permission(request):
    return request.user.is_active and request.user.is_staff and request.user.is_superuser

admin.site.has_permission = has_superuser_permission

  

class SessionAdmin(admin.ModelAdmin):
    def _session_data(self, obj):
        return obj.get_decoded()
    list_display = ['session_key', '_session_data', 'expire_date']


admin.site.register(Session, SessionAdmin)



class ResearchAdmin(ImportExportModelAdmin):
    list_display = [field.name for field in models.Research._meta.get_fields() if 'fk' not in field.name and field.name  not in ['author',]]
    search_fields = [field.name for field in models.Research._meta.get_fields() if 'fk' not in field.name and field.name not in ['date_created','id']]  
    date_hierarchy = 'date_created'
    list_filter = ('source_document','text_availability', 'publication_type', 'study_area')
    ordering = ['date_created',]
    prepopulated_fields = {'slug': ('title',)}

admin.site.register(models.Research, ResearchAdmin) 

class AbstractResearchAdmin(ImportExportModelAdmin):
    list_display = [field.name for field in models.AbstractResearch._meta.get_fields() if 'fk' not in field.name]
    search_fields = [field.name for field in models.AbstractResearch._meta.get_fields() if 'fk' not in field.name and field.name not in ['date_created','id']]  
    date_hierarchy = 'date_created'
    ordering = ['date_created',]

admin.site.register(models.AbstractResearch, AbstractResearchAdmin) 


class AuthorAdmin(ImportExportModelAdmin):
    list_display = [field.name for field in models.Author._meta.get_fields() if 'fk' not in field.name]
    search_fields = [field.name for field in models.Author._meta.get_fields() if 'fk' not in field.name and field.name not in ['date_created','id']]  
    date_hierarchy = 'date_created'
    ordering = ['date_created',]
    prepopulated_fields = {'slug': ('l_name', 'f_name', 'm_name'),}

admin.site.register(models.Author, AuthorAdmin) 


class ReportErrorAdmin(ImportExportModelAdmin):
    list_display = [field.name for field in models.ReportError._meta.get_fields() if 'fk' not in field.name]
    search_fields = [field.name for field in models.ReportError._meta.get_fields() if 'fk' not in field.name and field.name not in ['date_created','id']]  
    date_hierarchy = 'date_created'
    ordering = ['date_created',]

admin.site.register(models.ReportError, ReportErrorAdmin) 
