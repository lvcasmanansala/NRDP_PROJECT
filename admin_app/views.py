from cryptography.fernet import Fernet,InvalidToken
 
from django.shortcuts import render, get_object_or_404
from django.http import (
    JsonResponse,
    Http404,
    HttpResponseRedirect
)
from django.core.signing import Signer
from django.urls import reverse, reverse_lazy
from django.contrib.auth import authenticate, login
from django.db.models import Q, F
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
from django.contrib.sites.shortcuts import get_current_site  
from django.db.models import Avg, Sum
from django.core.files import File
from django.contrib import messages
from datetime import datetime, timedelta
from django.utils.timezone import make_aware  
from django.views.decorators.csrf import csrf_exempt
from django.contrib.postgres.search import SearchQuery, SearchVector, SearchRank, SearchHeadline 
from django.contrib.auth.models import User
from ndrppcwp_app import models
from admin_app import forms as forms_admin
import json, requests, logging

logger = logging.getLogger('django')

@csrf_exempt
def api_iis_login_token_only(request, *args, **kwargs):
    
    data = dict()
    
    if request.is_ajax():
        if request.method == 'POST':
            request_data = request.POST.dict()
            
            logger.info(f'The request_data is: {request_data}')
            token = request_data.get('token', None)
            logger.info(f'The token is: {token}')
            if token:
                try: 

                    key = settings.FERNET_KEY.encode() 
                    fernet = Fernet(key) 

                    decrypted_data = fernet.decrypt(token.encode('utf-8')).decode()  
                    decrypted_data = json.loads(decrypted_data)  

                    user_id = decrypted_data.get('user_id')
                    username = decrypted_data.get('username')
                    password = decrypted_data.get('password')
                    is_allowed = decrypted_data.get('is_allowed',0)
                    is_allowed = 1 if is_allowed == '1' or is_allowed.lower() == 'yes' else 0
 
                    logger.info(f'api_iis_login_token_only: {decrypted_data}')
                    if bool(int(is_allowed)):
                        user = authenticate(username=username, password=password)
                        if user: 
                            
                                DOMAIN = get_current_site(request)
                                url:str = reverse('api_iis_login_landing')
                                url = 'http://'+str(DOMAIN)+url+"?token="+token  
                                
                                data['response'] = {
                                    'message': 'Login Success',
                                    'redirect_url': url
                                } 

                                return JsonResponse(data, status=200) 
                        else:
                            data['response'] = {
                                'message': 'Invalid Account!',
                            }

                            return JsonResponse(data, status=401)

                    else: 
                        return JsonResponse({"error": "User account is invalid!"}, status=401)
                        

                except InvalidToken:
                    return JsonResponse({"error": "Invalid Token"}, status=401)
 
            else: 
                return JsonResponse({"error": "Invalid Token"}, status=401)

    else:

        data['response'] = {    
            'error': 'Http 404 Not Found'
        }

        return JsonResponse(data,status=404)

@csrf_exempt
def api_iis_login(request, *args, **kwargs):
    data = dict()


    if request.is_ajax():
        if request.method == 'POST':
            request_data = request.POST.dict()

            user_id = request_data.get('user_id', None)
            username = request_data.get('username', None)
            password = request_data.get('password', None)
            is_allowed = request_data.get('is_allowed', None)

            if  not (user_id and username and password and is_allowed):
                data['response'] = {    
                    'error': 'Invalid request body!'
                } 
                return JsonResponse(data,status=404)
   
 
            # url = "https://iis.emb.gov.ph/embis/api/Pbs/nrdp_login_verification" 
            url = f"https://{settings.IIS_IP}/embis/api/Pbs/nrdp_login_verification" 
            payload=request_data
            
            response = requests.post(url, data=payload, verify=False, timeout=20)   

            if response.status_code == 401:
                return JsonResponse({"Error":"Invalid Account!"}, status=401) 


            logger.info(request_data)


            # ! https://www.geeksforgeeks.org/how-to-encrypt-and-decrypt-strings-in-python/
            key = settings.FERNET_KEY.encode() 
            fernet = Fernet(key)
            request_data = json.dumps(request_data)
 
            encrypt_data = fernet.encrypt(request_data.encode())
            
   
            decoded_ed = str(encrypt_data.decode('utf-8'))

            # decrypted_data = fernet.decrypt(decoded_ed.encode('utf-8')).decode() 
            # print('---------------------->',decrypted_data)
            # response = json.loads(response.text)
 
            DOMAIN = get_current_site(request)
            url:str = reverse('api_iis_login_landing')
            url = 'http://'+str(DOMAIN)+url+"?token="+decoded_ed  
            
            data['response'] = {
                'message': 'Request Success',
                'redirect_url': url,
                # NOTE: Please store on the DB
                'secret_token': decoded_ed,
            } 

            return JsonResponse(data, status=200) 
            
    else:

        data['response'] = {    
            'error': 'Http 404 Not Found'
        }

        return JsonResponse(data,status=404)

@csrf_exempt
def api_iis_login_landing(request, *args, **kwargs):
    template_name = "api_login/iis_api_login_landing.html"
    data = dict()
 
    if request.method == "GET":
        token = request.GET.get('token', '') 
        to_manual = request.GET.get('to_manual', 0)
        to_manual = 1 if  int(to_manual) else 0
        try:


            key = settings.FERNET_KEY.encode() 
            fernet = Fernet(key)
    

            decrypted_data = fernet.decrypt(token.encode('utf-8')).decode()  
            decrypted_data = json.loads(decrypted_data) 

            

            user_id = decrypted_data.get('user_id')
            username = decrypted_data.get('username')
            password = decrypted_data.get('password')
            is_allowed = decrypted_data.get('is_allowed',0)
            is_allowed = 1 if is_allowed == '1' or is_allowed.lower() == 'yes' else 0

            
            # logger.info(f'------------------>{is_allowed}') 

            if bool(int(is_allowed)):
                exists = User.objects.filter(username=username).exists() 
                # ! make sure that IIS is authenticated first
                if exists:  
                    if request.user.is_authenticated:
                        return HttpResponseRedirect(reverse("ndrppcwp_admin_app:index_page")) if not to_manual else HttpResponseRedirect(reverse("ndrppcwp_admin_app:docs"))
                    elif request.user.is_anonymous:
                        user = get_object_or_404(User, username=username)   
                        # NOTE: Login and redirect to the main page
                        user.backend = 'django.contrib.auth.backends.ModelBackend'
                        login(request, user) 
                        return HttpResponseRedirect(reverse("ndrppcwp_admin_app:index_page")) if not to_manual else HttpResponseRedirect(reverse("ndrppcwp_admin_app:docs"))
         
                else:
                    # NOTE: Create a new one
                    user = User.objects.create(
                        username=username,  
                        is_staff=True,
                        is_active=True,
                        is_superuser=True, 
                    )           
                    user.set_password(password) 
                    user.save()
                    # NOTE: Login and redirect to the main page
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    login(request, user) 
                    return HttpResponseRedirect(reverse("ndrppcwp_admin_app:index_page")) if not to_manual else HttpResponseRedirect(reverse("ndrppcwp_admin_app:docs"))
            else:
                messages.error(request,"User account is invalid!")
                

        except InvalidToken:
            messages.error(request,"Invalid Token")



    context  = {

    }

    return render(request, template_name, context=context)

@csrf_exempt
def api_iis_logout_landing(request):
    # template_name = "api_login/iis_api_logout_landing.html"
    # context  = {

    # }
    return HttpResponseRedirect("https://iis.emb.gov.ph/embis/")

    # return render(request, template_name, context=context)
# @login_required(login_url='/admin')
@login_required
def index(request):
    template_name = 'administrator/index.html' 

    authors = models.Author.objects.all()
    researches = models.Research.objects.all()
    total_visitors = researches.aggregate(Sum('fk_abstract_research__counter')).get('fk_abstract_research__counter__sum',0)
    
    context = {
        'authors': authors,
        'researches': researches,
        'total_visitors': total_visitors,
    }
    return render(request, template_name, context)


@login_required
def authors(request):
    template_name = 'administrator/authors/authors.html' 
    user = request.user

    objects = models.Author.objects.all().order_by('-date_created')

    # search_term = request.GET.get('search_term','')
    # if search_term.strip():
    #     objects = objects.filter(
    #         Q(s_name__icontains=search_term) | 
    #         Q(f_name__icontains=search_term) | 
    #         Q(m_name__icontains=search_term) | 
    #         Q(l_name__icontains=search_term) 
    #         )

    # page = request.GET.get('page', 1)   
    
    # paginator = Paginator(objects,5)

    # try:
    #     query = paginator.page(page)
    # except PageNotAnInteger:
    #     query = paginator.page(1)
    # except EmptyPage:
    #     query = paginator.page(paginator.num_pages)

    context = {
        'user': user,  
        # 'query': query,
        'query': objects,
        # 'search_term': search_term,
    }
 


    return render(request, template_name, context)

 
@login_required
def authors_add(request):
    template_name = 'administrator/authors/add.html' 
    user = request.user


    if request.method == 'GET':
        form = forms_admin.AuthorForm(request.GET or None)
    elif request.method == 'POST': 

        save_add_another = request.POST.get('_save_add_another', None)
        form = forms_admin.AuthorForm(request.POST or None)

        if form.is_valid(): 
            try:
                
                instance = form.save(commit=False) 
                instance.save()
                
                messages.success(request, "Author has been added!") 
            except IntegrityError as e:
                messages.error(request, f"Error {e}")
       
            if isinstance(save_add_another, str): 
                return HttpResponseRedirect(reverse("ndrppcwp_admin_app:authors_add"))

            return HttpResponseRedirect(reverse("ndrppcwp_admin_app:authors")) 

    context = {
        'user': user,
        'form': form,
    }
    
    return render(request, template_name, context)


@login_required
def authors_edit(request, *args, **kwargs):
    template_name = 'administrator/authors/edit.html' 
    user = request.user
    id = kwargs.get('id')
    author = get_object_or_404(models.Author, id=id)

    if request.method == 'GET':
        form = forms_admin.AuthorForm(request.GET or None, instance=author)
    elif request.method == 'POST':
        save_add_another = request.POST.get('_save_add_another', None)
        form = forms_admin.AuthorForm(request.POST or None, instance=author)

        if form.is_valid(): 
            try:
                
                instance = form.save(commit=False) 
                instance.save()
                
                messages.info(request, "Author has been Updated!") 
            except IntegrityError as e:
                messages.error(request, f"Error {e}")
       
            if isinstance(save_add_another, str): 
                return HttpResponseRedirect(reverse("ndrppcwp_admin_app:authors_edit", args=[author.id,]))

            return HttpResponseRedirect(reverse("ndrppcwp_admin_app:authors")) 

    context = {
        'user': user,
        'form': form,
    }
  
    return render(request, template_name, context)


@login_required
def authors_delete(request, *args, **kwargs):
    template_name = 'administrator/authors/delete.html' 
    user = request.user
    id = kwargs.get('id')
    author = get_object_or_404(models.Author, id=id)
    if request.method == 'POST':
        author.delete()
        messages.success(request, f"Author: {author.get_full_name()} has been deleted")
        return HttpResponseRedirect(reverse("ndrppcwp_admin_app:authors")) 

    context = {
        'author': author,
        'user': user,
    }
    
    return render(request, template_name, context)

 
@login_required
def researches(request):
    template_name = 'administrator/researches/researches.html' 
    user = request.user

    objects = models.Research.objects.all().order_by('-date_created')

    # search_term = request.GET.get('search_term','')
    # if search_term.strip():
    #     objects = objects.filter(
    #         Q(contrib_id__icontains=search_term) |
    #         Q(title__icontains=search_term) |
    #         Q(study_area__icontains=search_term) |
    #         Q(source_document__icontains=search_term) |
    #         Q(text_availability__icontains=search_term) |
    #         Q(publication_type__icontains=search_term) |
    #         Q(remarks__icontains=search_term) |

    #         Q(author__s_name__icontains=search_term) | 
    #         Q(author__f_name__icontains=search_term) | 
    #         Q(author__m_name__icontains=search_term) | 
    #         Q(author__l_name__icontains=search_term) |

    #         Q(fk_abstract_research__text__icontains=search_term) 
    #         )

    # page = request.GET.get('page', 1)   
    
    # paginator = Paginator(objects,5)

    # try:
    #     query = paginator.page(page)
    # except PageNotAnInteger:
    #     query = paginator.page(1)
    # except EmptyPage:
    #     query = paginator.page(paginator.num_pages)

    context = {
        'user': user,  
        'query': objects,
        # 'search_term': search_term,
    }
 


    return render(request, template_name, context)
 

@login_required
def researches_add(request):
    template_name = 'administrator/researches/add.html' 
    user = request.user


    if request.method == 'GET':
        form = forms_admin.ResearchForm(request.GET or None,initial={'status':True})
    elif request.method == 'POST': 

        save_add_another = request.POST.get('_save_add_another', None)
        form = forms_admin.ResearchForm(request.POST or None, request.FILES)

        if form.is_valid(): 
            try: 
                instance = form.save(commit=False) 
                abstract_text = form.cleaned_data['abstract_text']
                author = form.cleaned_data['author'] 
                instance.save() 
                # NOTE: Adding/Saving M2M Field
                for i in author:
                    instance.author.add(i)
                
                models.AbstractResearch.objects.create(research=instance, text=abstract_text)
                
                messages.success(request, "Research has been added!") 
            except IntegrityError as e:
                messages.error(request, f"Error {e}")
       
            if isinstance(save_add_another, str): 
                return HttpResponseRedirect(reverse("ndrppcwp_admin_app:researches_add"))

            return HttpResponseRedirect(reverse("ndrppcwp_admin_app:researches")) 

    context = {
        'user': user,
        'form': form,
    }
    
    return render(request, template_name, context)


@login_required
def researches_edit(request, *args, **kwargs):
    template_name = 'administrator/researches/edit.html' 
    user = request.user
    id = kwargs.get('id')
    research = get_object_or_404(models.Research, id=id)

    if request.method == 'GET':
        form = forms_admin.ResearchForm(request.GET or None, instance=research, initial={
            'abstract_text': research.fk_abstract_research.text,
            'pub_date': research.pub_date.strftime('%m/%d/%Y')
        })
    elif request.method == 'POST': 

        save_add_another = request.POST.get('_save_add_another', None)
        form = forms_admin.ResearchForm(request.POST or None, request.FILES, instance=research)

        if form.is_valid(): 
            try: 
                instance = form.save(commit=False) 
                abstract_text = form.cleaned_data['abstract_text']
                author = form.cleaned_data['author'] 
                instance.save() 
                # NOTE: Adding/Saving M2M Field
                instance.author.clear()
                for i in author:
                    instance.author.add(i)
                
                models.AbstractResearch.objects.update_or_create(research=instance, defaults={
                    'text':abstract_text,
                })
                
                messages.success(request, "Research has been updated!") 
            except IntegrityError as e:
                messages.error(request, f"Error {e}")
       
            if isinstance(save_add_another, str): 
                return HttpResponseRedirect(reverse("ndrppcwp_admin_app:researches_edit", args=[research.id,]))

            return HttpResponseRedirect(reverse("ndrppcwp_admin_app:researches")) 

    context = {
        'user': user,
        'form': form,
    }
    
    
    return render(request, template_name, context)

@login_required
def researches_delete(request, *args, **kwargs):
    template_name = 'administrator/researches/delete.html' 
    user = request.user
    id = kwargs.get('id')
    research = get_object_or_404(models.Research, id=id)


    if request.method == 'POST':  
        research.delete()
        messages.success(request, f"Research: {research.title} has been deleted")
        return HttpResponseRedirect(reverse("ndrppcwp_admin_app:researches")) 

    context = {
        'user': user,
        'research': research,
    }
    
    return render(request, template_name, context)


@login_required
def report_errors(request, *args, **kwargs):
    template_name = "administrator/reports/reports.html"
    user = request.user

    reports = models.ReportError.objects.all().order_by('-date_created')
    context = {
        'reports': reports,
    }

    return render(request, template_name, context)


@login_required
def report_errors_view(request, *args, **kwargs):
    template_name = "administrator/reports/view.html"
    user = request.user
    id = kwargs.get('id')

    report = get_object_or_404(models.ReportError,id=id)

    if request.method == 'POST':
        report.delete()
        messages.success(request, "Report error has been deleted successfully!")
        return HttpResponseRedirect(reverse("ndrppcwp_admin_app:report_errors")) 

    context = {
        'report': report,
    }

    return render(request, template_name, context)


@login_required
def docs(request, *args, **kwargs):
    template_name = "administrator/docs/docs.html"
    user = request.user
    context = {}

    return render(request, template_name, context)









