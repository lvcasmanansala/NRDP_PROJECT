"""ndrppcwp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin 
from django.urls import path, include
from django.contrib.auth import views as auth_views
from ndrppcwp_app import views
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.conf.urls import handler404, handler500
from admin_app import views as ap_views

handler404 = 'ndrppcwp_app.views.error_404'
handler500 = 'ndrppcwp_app.views.error_500'
 
urlpatterns = [
    path('admin/', admin.site.urls,), 
    path('', include('ndrppcwp_app.urls')),
    path('administrator/', include('admin_app.urls')), 
    path('logout/', auth_views.LogoutView.as_view(), name="logout"),

    
    # NOTE: API
    path("api/iis/login/", ap_views.api_iis_login, name="api_iis_login"),
    path("api/iis/login/token-only/", ap_views.api_iis_login_token_only, name="api_iis_login_token_only"),
    path("api/iis/login/landing-page/", ap_views.api_iis_login_landing, name="api_iis_login_landing"),
    path("api/iis/logout/landing-page/", ap_views.api_iis_logout_landing, name="api_iis_logout_landing"),

     
]+static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
