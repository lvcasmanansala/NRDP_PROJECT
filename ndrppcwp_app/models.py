 
from django.db import models
from django.db.models import Q
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db.models.base import Model
from django.utils.text import slugify
from django.urls import reverse
from django.utils.timezone import make_aware, now 
from .helpers.file_validators import file_validator_valid_pdf_image
import os, uuid, shortuuid

class Author(models.Model):

    PREFIXES_LIST = (
        ('Mr','Mr'),
        ('Ms','Ms'),
        ('Mrs','Mrs'),
        ('Mx','Mx'),
        ('Dr','Dr'),
        ('Engr','Engr'),
        ('Chan','Chan'),
        ('Miss','Miss'),
        ('Pres','Pres'),
        ('Prof','Prof'),
        ('Rep','Rep'),
        ('The Hon','The Hon'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4) 
    slug = models.SlugField(max_length=255, unique=True)
    s_name = models.CharField(max_length=255, blank=True,  default='',)
    f_name = models.CharField(max_length=255)
    m_name = models.CharField(max_length=255, blank=True,   default='')
    l_name = models.CharField(max_length=255)
    prefixes = models.CharField(max_length=255, blank=True, choices=PREFIXES_LIST,  default='')
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    disabled = models.BooleanField(default=False)

    
    def __str__(self):
        return self.l_name + ", "+ self.f_name
    
    def get_full_name(self):
        return '{l_name}, {f_name} {m_name} {s_name} {e_name}'.format(
            l_name=self.l_name, 
            f_name=self.f_name,
            m_name=self.m_name+"." if self.m_name else '',
            s_name=self.s_name+'.' if self.s_name else '',
            e_name=self.prefixes+'.' if self.prefixes else '',
            )


    
    class Meta:
        ordering = ('date_created', )
     

    def save(self, *args, **kwargs):
        name = f'{self.l_name} {self.f_name} {self.m_name}'
        self.slug = slugify(name)
        super(Author, self).save(*args, **kwargs)
    
    
    def get_absolute_url_edit(self):
        return reverse("ndrppcwp_admin_app:authors_edit", args=[self.id,])

    def get_absolute_url_delete(self):
        return reverse("ndrppcwp_admin_app:authors_delete", args=[self.id,])


class Research(models.Model):
    TEXT_AVAILABILITY_LIST = (
        ('Abstract','Abstract'),
        ('Full-Text','Full-Text'),
    )
    STUDY_AREA_LIST = (
        ('Source-Control Strategies','Source-Control Strategies'),
        ('Resource-Directed Strategies','Resource-Directed Strategies'),
        ('Revival and Rehabilitation Strategies','Revival and Rehabilitation Strategies'),
        ('Overarching Strategies','Overarching Strategies'),
    ) 

    SOURCE_DOCUMENT_LIST = (
        ('Sylvatrop Technical Journal of the Philippine Ecosystems','Sylvatrop Technical Journal of the Philippine Ecosystems'),
        ('Natural Resources Volume 27 Nos. 1 and 2','Natural Resources Volume 27 Nos. 1 and 2'),
        ('Herdin','Herdin'),
        ('PCIEERD','PCIEERD'), 
        ('ResearchGate','ResearchGate'), 
    )

    PUBLICATION_TYPE_LIST = (
        ('Journal','Journal'),
    )
    CATEGORIES_LIST = (
        ('Scientific Journals','Scientific Journals'),
        ('Manuals','Manuals'),
    )

    PUBLICATION_YEAR = (
        (str(x), str(x)) for x in range(1960, 2050)
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4) 
    contrib_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255,unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    pdf = models.FileField(upload_to="uploaded_pdf/%Y/%m/%d", blank=True, null=True, validators=[file_validator_valid_pdf_image])
    author = models.ManyToManyField(Author, related_name="fk_author_research")
    URL = models.URLField(blank=True, default="")
    pub_date = models.DateField(blank=True, null=True)
    pub_year = models.CharField(blank=True, null=True, choices=PUBLICATION_YEAR, max_length=5)
    study_area = models.CharField(max_length=255, choices=STUDY_AREA_LIST, default=STUDY_AREA_LIST[0][0])
    source_document = models.CharField(max_length=255, choices=SOURCE_DOCUMENT_LIST, default=SOURCE_DOCUMENT_LIST[0][0])
    text_availability = models.CharField(max_length=255, choices=TEXT_AVAILABILITY_LIST, default=TEXT_AVAILABILITY_LIST[0][0])
    publication_type = models.CharField(max_length=255, choices=PUBLICATION_TYPE_LIST, default=PUBLICATION_TYPE_LIST[0][0])
    categories = models.CharField(max_length=255, choices=CATEGORIES_LIST, default='', blank=True, null=True)
    # NOTE: Is complted or not
    status = models.BooleanField(default=True)  
    remarks = models.TextField(blank=True, null=True) 

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.title

    
    class Meta:
        ordering = ('date_created', )
     

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title) 
 
        # if self.pk is not None:
        #     # Object is being updated
        #     # Do something here
        #     print("SADD")
        #     pass
        # else:
        #     print('asdasd')
        #     # Object is being created
        #     # Do something else here 
        if self._state.adding:
            # Object is being created
            # Do something here
            custom_id : str = "NRDP-PCWP" 
            if self.pub_date:
                custom_id = custom_id+"-"+self.pub_date.strftime("%Y")
            elif self.pub_year:
                custom_id = custom_id+"-"+self.pub_year  

            self.contrib_id = custom_id+"-"+str(shortuuid.uuid()).upper()
        else:
            # Object is being updated
            # Do something else here
            # print('Object is being updated')
            pass
       
        super(Research, self).save(*args, **kwargs)
    
        
    def get_absolute_url_edit(self):
        return reverse("ndrppcwp_admin_app:researches_edit", args=[self.id,])

    def get_absolute_url_delete(self):
        return reverse("ndrppcwp_admin_app:researches_delete", args=[self.id,])
    
    def get_absolute_url_view(self):
        return reverse("ndrppcwp_app:research_detail", args=[self.slug,])

    def get_absolute_url_report_error(self):
        return reverse("ndrppcwp_app:create_report_error", args=[self.slug,])
    
class AbstractResearch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4) 
    research = models.OneToOneField(Research, related_name="fk_abstract_research", on_delete=models.CASCADE)
    text = models.TextField()
    counter = models.IntegerField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.research.title



class ReportError(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4) 
    name = models.CharField(max_length=50)
    research = models.ForeignKey(Research, on_delete=models.CASCADE, related_name="fk_report_error_research")
    email = models.EmailField(max_length=50)
    org = models.CharField(max_length=200)
    text = models.TextField()  
    date_created = models.DateTimeField(auto_now_add=True)

    
    def __str__(self):
        return self.research.title
    
    def get_absolute_url_view(self):
        return reverse("ndrppcwp_admin_app:report_errors_view", args=[self.id,])
    
