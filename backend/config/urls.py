from django.conf import settings
from django.urls import path, re_path
from django.views.static import serve
from gallery import views
from gallery import auth_views as a

urlpatterns = [
    path('api/assets', views.assets),
    path('api/paintings', views.paintings),
    path('api/paintings/<str:pid>', views.painting),
    path('uploads/<str:name>', views.upload_file),
    path('api/me', a.me), path('api/register', a.register), path('api/login', a.login_view),
    path('api/logout', a.logout_view), path('api/profile', a.profile_update),
    path('api/reset', a.reset_request), path('api/reset/confirm', a.reset_confirm),
]



