from django.conf import settings
from django.urls import path, re_path
from django.views.static import serve
from gallery import views

urlpatterns = [
    path('api/assets', views.assets),
    path('api/paintings', views.paintings),
    path('api/paintings/<str:pid>', views.painting),
    path('uploads/<str:name>', views.upload_file),
]
