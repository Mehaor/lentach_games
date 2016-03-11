from django.contrib import admin
from solo.admin import SingletonModelAdmin
import models


admin.site.register(models.User)
admin.site.register(models.Game)
admin.site.register(models.HiScore)
admin.site.register(models.SiteConfiguration, SingletonModelAdmin)

# Register your models here.
