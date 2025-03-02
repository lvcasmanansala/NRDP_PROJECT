from django.shortcuts import render, get_object_or_404, redirect
from django.http import (
    JsonResponse,
    Http404,
    HttpResponseRedirect
)
from django.core.signing import Signer
from django.urls import reverse, reverse_lazy
from django.contrib.auth import authenticate, login
from django.db.models import Q, F, Count
from django.db.utils import IntegrityError, DataError
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.utils import timezone 
from django.core.paginator import (
    Paginator,
    EmptyPage,
    PageNotAnInteger
)
from django.core.files import File
from django.contrib import messages
from datetime import datetime, timedelta
from django.utils.timezone import make_aware  
from django.contrib.postgres.search import SearchQuery, SearchVector, SearchRank, SearchHeadline 
from ndrppcwp_app import models, forms as nrdp_pcwp_form
from admin_app import forms
from django.views.decorators.csrf import csrf_exempt
from custom_modules import lsg_decorators
from .models import Research
from admin_app.forms import ResearchForm

import json

# NOTE: =====================================[START ERROR PAGES]=====================================


def error_404(request, exception):
    return render(request, "error/error_404.html", {})


def error_500(request):
    return render(request, "error/error_500.html", {})

 
def index(request):
    template_name = 'client/index.html' 

    results = models.Research.objects.all().order_by('-date_created')

    # if request.method == 'GET':
    #     search_term:str = request.GET.get('search_term', '')
    #     filter_type = request.GET.get('group','')
    #     exact = request.GET.get('exact','')
        
    #     data_filter = {
    #         'study_area' : {
    #             'scs': 'Source-Control Strategies',
    #             'rds': 'Resource-Directed Strategies',
    #             'rrs': 'Revival and Rehabilitation Strategies',
    #             'os': 'Overarching Strategies',
    #         },
    #     }

    #     if filter_type and exact:  
    #         filter_term = data_filter.get(filter_type).get(exact)   
    #         results = results.filter(Q(**{ filter_type : filter_term})) 
            
    #     if search_term.strip():  
    #         vector = SearchVector(
    #             'contrib_id' , 
    #             'title', 
    #             'author__f_name',
    #             'author__m_name',
    #             'author__l_name',
    #             'fk_abstract_research__text', 
    #         ) # columns
    #         query = SearchQuery(search_term) # search term query 

    #         search_title = SearchHeadline('title', query)
    #         search_abstract = SearchHeadline('fk_abstract_research__text',query)  

    #         results = models.Research.objects.annotate(
    #                 rank=SearchRank(vector, query)
    #             ).annotate(
    #                 search_title=search_title 
    #             ).annotate(                    
    #                 search_abstract=search_abstract, 
    #             ).filter(rank__gte=0.001).order_by('-rank').distinct() 
    #     page = request.GET.get('page', 1)
        
    #     paginator = Paginator(results, 5)

    #     try:
    #         query = paginator.page(page)
    #     except PageNotAnInteger:
    #         query = paginator.page(1)
    #     except EmptyPage:
    #         query = paginator.page(paginator.num_pages)
 
    context = {
        # 'search_term': search_term,  
        # 'query': query,
        # 'count': results.count(),
    }
    return render(request, template_name, context)

@csrf_exempt
def load_researches(request, *args, **kwargs):
    data = dict()
    template_name = "client/advance_filter_modal.html"
    if request.is_ajax():
        filter_list = models.Research
        if request.method == 'GET': 
            study_area = filter_list.STUDY_AREA_LIST
            categories = filter_list.CATEGORIES_LIST
            year_published = [str(i) for i in range(1960,2050)] 
            context = {
                'study_area': study_area,
                'categories': categories,
                'year_published': year_published,

            }
            data['html_form'] = render_to_string(template_name, context, request)
        elif request.method == 'POST':
            d = request.POST.dict()
            objs = filter_list.objects.all().order_by('-date_created')
            _strategies = d.get('strategies', [])
            _status = d.get('status', [])
            _categories = d.get('categories', [])
            _year_pub = d.get('year_pub', '')
            _search_term = d.get('search_term', None) 

           
            _strategies = json.loads(_strategies)    
            _status = json.loads(_status)     
            _categories = json.loads(_categories)    

            _current_page = d.get('current_page', 1) 
 
            _num_per_page = 5 
            

            if bool(_strategies):           
             
                objs = objs.filter(study_area__in=_strategies)
      

            if bool(_status):  
                if not ( "st_completed" and "st_ongoing" in _status):
                    s = {
                        'st_completed': True,
                        'st_ongoing': False,
                    }
                    objs = objs.filter(status=s.get(_status[0])) 
      
            if bool(_categories):  
                objs = objs.filter(categories__in=_categories)

            if bool(_year_pub):   
                objs = objs.filter(Q(pub_year=_year_pub) | Q(pub_date__year__lte=_year_pub))
      
            # NOTE: if has search term
            if _search_term.strip():  
                vector = SearchVector(
                    'contrib_id' , 
                    'title', 
                    'author__f_name',
                    'author__m_name',
                    'author__l_name',
                    'fk_abstract_research__text', 
                ) 
                s_query = SearchQuery(_search_term) # search term query 

                search_title = SearchHeadline('title', s_query)
                search_abstract = SearchHeadline('fk_abstract_research__text',s_query)  

                objs = models.Research.objects.annotate(
                        rank=SearchRank(vector, s_query)
                    ).annotate(
                        search_title=search_title 
                    ).annotate(                    
                        search_abstract=search_abstract, 
                    ).filter(rank__gte=0.001).order_by('-rank').distinct() 
 
            paginator = Paginator(objs, _num_per_page)
            # paginator = Paginator(objs, 25)

            try:
                query = paginator.page(_current_page)
            except PageNotAnInteger:
                query = paginator.page(1)
            except EmptyPage:
                query = paginator.page(paginator.num_pages) 
 
            context = { 
                'search_term': _search_term,  
                'query': query,
                'count': objs.count(),

            } 
            data['current_page'] = query.number 
            data['total_pages'] = query.paginator.num_pages
            data['num_per_page'] = _num_per_page
            data['total'] = len(query.object_list)
            data['html_researches'] = render_to_string('client/reasearches_list.html', context, request)

        return JsonResponse(data, status=200)
    else:
        return JsonResponse(data, status=400)

def research_detail(request, *args, **kwargs):
    template_name = "client/view.html"
    research = kwargs.get('name')
    research = get_object_or_404(models.Research, slug=research)
    abstract = get_object_or_404(models.AbstractResearch, research=research)
    abstract.counter = F('counter') + 1;
    abstract.save()
    # research.save(update_fields='fk_abstract_research__counter') 
    context = {
        'research': research,
        'abstract': abstract,
    }
    return render(request, template_name, context)


def research_create(request):
    if request.method == "POST":
        form = ResearchForm(request.POST, request.FILES)

        if form.is_valid():
            research = form.save(commit=False)

            # OTHERS SELECTION
            source_document = request.POST.get("source_document", "")
            publication_type = request.POST.get("publication_type", "")

            # HANDLING OF NONE VALUES
            custom_source = request.POST.get("custom_source", "").strip()
            custom_pub_type = request.POST.get("custom_pub_type", "").strip()

            # ASSIGN VALUES WHEN CHOOSING "OTHERS"
            research.custom_source = custom_source if source_document == "Others" else ""
            research.custom_pub_type = custom_pub_type if publication_type == "Others" else ""

            research.save()
            form.save_m2m()
            return redirect("ndrppcwp_admin_app:researches_list")

        else:
                 print("Form errors:", form.errors)

    else:
        form = ResearchForm()

    return render(request, "ndrppcwp_admin_app/add.html", {"form": form})

@lsg_decorators.validate_recaptcha
def create_report_error(request, *args, **kwargs):
    data: dict = dict()
    template_name = "client/report_error/create_report.html"

    _slug = kwargs.get('name')
    research = get_object_or_404(models.Research, slug=_slug)

    if request.is_ajax():
        if request.method == 'GET':
            form = nrdp_pcwp_form.ReportErrorForm(request.GET or None)
        elif request.method == 'POST' :
            form = nrdp_pcwp_form.ReportErrorForm(request.POST or None) 
            if form.is_valid() and request.recaptcha_is_valid: 
                instance = form.save(commit=False)
                instance.research = research
                instance.save() 
            else:
                print(form.errors)
                return JsonResponse(data, status=400)

        context = {
            'form': form,
            'research': research,
        }
        data['html_form'] = render_to_string(template_name, context, request)
        
        return JsonResponse(data, status=200)
    else:
        return JsonResponse(data, status=400)
