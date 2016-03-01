from django.shortcuts import render
from django.shortcuts import render_to_response


def index(request):
    return render_to_response('_index.html', {'game_slug': 'penguin'})
# Create your views here.
