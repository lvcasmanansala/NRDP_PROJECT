from functools import wraps
from django.conf import settings
import requests

def validate_recaptcha(view_function):
    @wraps(view_function)
    def _wrapped_view(request, *args, **kwargs):
        request.recaptcha_is_valid = False
        if request.method == 'POST': 
            ''' Begin reCAPTCHA validation '''
            recaptcha_response = request.POST.get('g-recaptcha-response') 
            data = {
                'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
                'response': recaptcha_response
            }
            response = requests.post('https://www.google.com/recaptcha/api/siteverify', data=data)
            result = response.json() 
            ''' End reCAPTCHA validation '''
            if result['success']:
                request.recaptcha_is_valid = True
            else:
                request.recaptcha_is_valid = False 

        return view_function(request, *args, **kwargs)
    return _wrapped_view
