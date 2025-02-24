from django import template
from django.shortcuts import get_object_or_404
from django.utils import timezone 
import os, pytz, datetime, random , re 
from ndrppcwp_app import models 

register = template.Library()


@register.filter
def decimal_to_percent(value):
    percent = value * 100
    percent = round(percent, 2)
    
    return f'{percent}% matching'

@register.simple_tag(takes_context=True)
def html_highlight_text(context, value):
    term = context.get('search_term') 
    if term.strip():
        return re.sub(term, f'<b>{term}</b>', value) 
    return value